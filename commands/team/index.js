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
        // get the session token from the cookie
        var token = req.cookies[COOKIE_NAME];
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
        if(!sc.ok) {
            logger.error("unable to get channel details from slack")
            return res.status(500).json({ status: 'failed to get channel details from slack' });
        }
        const channels = {};
        sc.channels.forEach((c) => {
            if(config.teamChannels.includes(c.name) 
                && c.members.length 
                && c.members.includes(token.user)) channels[c.id] = c.name;
        });

        const events = await db.team.events.find().toArray();

        return res.json({
            'status': 'ok',
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
        // get the session token from the cookie
        var token = req.cookies[COOKIE_NAME];
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

// replace the event
// e.g. join / leave / update
router.put('/events/:id', async function(req, res) {
    try {
        logger.info(req.body);
        // get the session token from the cookie
        var token = req.cookies[COOKIE_NAME];
        if(token) {
            token = await db.team.tokens.findOne({token : token});
        }

        if(!token) {
            return res.status(410).json({ status: 'session expired' });
        }

        const event_id = new ObjectID(req.params.id);
        logger.debug('updating event: ',event_id);
        
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

// remove the event
router.delete('/events/:id', async function(req, res) {

})



//serve up static files
router.use('/', express.static(path.join(__dirname, 'public')));