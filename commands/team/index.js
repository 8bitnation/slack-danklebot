import express from 'express';
import * as logger from 'winston';
import config from '../../config';
import {urlSafeToken} from '../../lib/token';
import path from 'path';

import * as db from '../../lib/db';
import * as slack from '../../lib/slack';

/**
 * 
 */
export const router = express.Router();

export const command = '/team';
export async function handler(payload) {

    // create a new token for accessing the team page
    // and return the link to the user

    const token = await urlSafeToken(32);
    const url = `http://${payload.req.headers.host}/team/auth/${token}`

    await db.team.tokens.insertOne({
        user: payload.user_id,
        channel: payload.channel_id,
        token: token,
        expire: Date.now() + 900000
    });

    return({
        "response_type": "ephemeral",
        text: `Please follow this link <${url}|here> to review events`
    });
    
}

// authenticate session
router.get('/auth/:token', async function(req, res) {

    try {
        const token = await db.team.tokens.findOne({token : req.params.token});
        /*
        // don't expire tokens for now
        if(!token || token.expire < Date.now()) {
            return res.status(410).send('Token Expired');
        }
        */
        res.cookie('8bn-team', req.params.token);
        res.redirect('..');

    } catch(err) {
        logger.error(err);
        res.status(500).send('Ouch!');
    }
    
});

//serve up static files
router.use('/', express.static(path.join(__dirname, 'public')));