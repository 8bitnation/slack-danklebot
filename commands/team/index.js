import express from 'express';
import * as logger from 'winston';
import config from '../../config';
import {urlSafeToken} from '../../lib/token';
import path from 'path';
import {ObjectID} from 'mongodb';

import * as db from '../../lib/db';
import * as slack from '../../lib/slack';

/**
 * 
 */

const COOKIE_NAME = '8bn-team';
export const router = express.Router();

export const command = '/team';
export async function handler(payload) {

    // create a new token for accessing the team page
    // and return the link to the user

    const token = await urlSafeToken(32);
    const url = `http://${payload.req.headers.host}/team/auth/${token}`

    const insert = await db.team.tokens.insertOne({
        user: payload.user_id,
        channel: payload.channel_id,
        token: token,
        expire: Date.now() + 900000
    });

    // check if the insert worked?

    return({
        "response_type": "ephemeral",
        text: `Please follow this link <${url}|here> to review events`
    });
    
}

router.get('/auth', async function(req, res) {
    const tc = await db.team.tokens.find({});
    const tokens = [];
    while(await tc.hasNext()) {
        var t = await tc.next();
        tokens.push( {
            user: t.user,
            channel: t.channel,
            token: t.token,
            url: `http://${req.headers.host}/team/auth/${t.token}`
        });
    }
    res.json(tokens);
});

// authenticate session and create cookie
router.get('/auth/:token', async function(req, res) {

    try {
        const token = await db.team.tokens.findOne({token : req.params.token});

        
        if(!token || token.expire < Date.now()) {
            // don't expire tokens for now
            //return res.status(410).send('Token Expired');
        }

        res.cookie(COOKIE_NAME, req.params.token, { path: '/team' });
        return res.redirect('..');

    } catch(err) {
        logger.error(err);
        return res.status(500).send('Ouch!');
    }
    
});

// events REST

// list all events
router.get('/events', async function(req, res) {

    try {
        var token = req.headers['authorization'];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        // get a list of subscribed channels for this user
        // generate a list of events filtered by channels
        // db.team.events.find()
        const users = {};
        const uc = await db.team.users.find();
        while(await uc.hasNext()) {
            var u = await uc.next();
            users[u._id] = u.name;
        }

        const sc = await slack.channels();
        console.debug(sc);
        if(!sc.ok) {
            logger.error("unable to get channel details from slack")
            return res.status(500).json({ status: 'failed to get channel details from slack' });
        }
        const channels = [];
        sc.channels.forEach((c) => {
            if(config.teamChannels.includes(c.name) 
                && c.members.length 
                && c.members.includes(token.user)) channels.push({ id: c.id, name: c.name});
        });
        channels.sort((a, b) => a.name.localeCompare(b.name) );

        const events = await db.team.events.find().toArray();
        events.forEach((e) => {
            // map _id to id
            e.id = e._id;
            delete e._id;
        });
        events.sort((a, b) => a.timestamp - b.timestamp);

        return res.json({
            'status': 'ok',
            token: { 
                channel: token.channel, 
                user: token.user  
            },
            users: users,
            channels: channels,
            events: events
        });

    } catch(err) {
        logger.error(err);
        return res.status(500).json({ status: 'internal error' });
    }

});

// create a new event
router.post('/events', async function(req, res) {

    try {
        var token = req.headers['authorization'];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        const {
            channel,
            name,
            timestamp
        } = (req.body || {});
        logger.info(req.body);

        // check everything exists?
        if(!channel || !name || !timestamp) {
            return res.status(400).json({ status: 'malformed event' });
        }

        const user = await slack.userInfo(token.user);
        logger.debug(user);
        if(!user.ok) {
            logger.error("unable to get user details from slack");
            return res.status(500).json( { status: 'failed to get user info from slack'});
        }

        // update/insert the user
        const userUpdate = await db.team.users.updateOne({ _id: token.user }, {$set: {name: user.user.name}},{upsert:true});

        const event = await db.team.events.insertOne({
            owner: token.user,
            channel: channel,
            name: name,
            timestamp: timestamp,
            participants: [ token.user ],
            alternates: [ ]
        });

        //logger.debug(event.insertedId);
        return res.json({ status: 'ok', result: event.result, id : event.insertedId});

    } catch(err) {
        logger.error(err);
        return res.status(500).json({ status: 'internal error' });
    }
});

// replace (i.e. update) the event
router.put('/events/:id', async function(req, res) {
    try {
        logger.info(req.body);

        var token = req.headers['authorization'];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        const event_id = new ObjectID(req.params.id);
        logger.debug('updating event: ',event_id.valueOf());
        
        const update = await db.team.events.updateOne({_id: event_id}, {
            $set: {
                name: req.body.name,
                timestamp: req.body.timestamp,
                participants: req.body.participants,
                alternates: req.body.alternates
            }
        });

        logger.debug(update.result);

        return res.json({ status: 'ok', result: update.result});

    } catch(err) {
        logger.error(err);
        return res.status(500).json({ status: 'internal error' });
    }
});


router.post('/events/:id/join', async function(req, res) {
    try {
        logger.info(req.body);
        var token = req.headers['authorization'];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        if(!req.body.type) {
            return res.status(400).json( { status: 'malformed request' } );
        }

        const event_id = new ObjectID(req.params.id);
        logger.debug('user: '+token.user+', is joining event: '+event_id.valueOf());

        const addToSet = {};

        const update = await db.team.events.updateOne({_id: event_id}, {
            $push: (req.body.type === 'participant') ? {
                participants: token.user 
            } : {
                alternates: token.user
            }
        });

        logger.debug(update.result);
        return res.json({ status: 'ok', result: update.result});

    } catch(err) {
        logger.error(err);
        return res.status(500).json({ status: 'internal error' });
    }
});

router.get('/events/:id/leave', async function(req, res) {
    try {
        logger.info(req.body);
        var token = req.headers['authorization'];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        const event_id = new ObjectID(req.params.id);
        logger.debug('user: '+token.user+', is leaving event: '+event_id.valueOf());

        // brute force leave
        const update = await db.team.events.updateOne({_id: event_id}, {
            $pull: { participants: token.user, alternates: token.user }
        });

        logger.debug(update.result);
        return res.json({ status: 'ok', result: update.result});

    } catch(err) {
        logger.error(err);
        return res.status(500).json({ status: 'internal error' });
    }
});

// remove the event
router.delete('/events/:id', async function(req, res) {

});

//serve up static files
router.use('/', express.static(path.join(__dirname, 'public')));