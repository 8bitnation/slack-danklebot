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
    const url = `http://${payload.req.headers.host}/team/${token}/events`

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

async function sendFile(res, file, type) {
    return new Promise( (resolve, reject) => {
        const fileName = path.join(__dirname, file);
        const options = {
            maxAge: 60000,
            headers: { 'content-type': type }
        };
        res.sendFile(fileName, options, function (err) {
            if (err) {
              reject(err);
            } else {
              logger.debug('Sent:', fileName);
              resolve();
            }
        });
    });
} 

// TODO: find a better way to server up the static files whilst keeping
// them together with the template

router.get('/:token/events.js', async function(req, res, next) {
    try {
        await sendFile(res, 'events.js', 'application/javascript');
    } catch(err) {
        logger.error(err)
    }
});

router.get('/:token/events.css', async function(req, res, next) {
    try {
        await sendFile(res, 'events.css', 'application/javascript');
    } catch(err) {
        logger.error(err)
    }
});


router.get('/:token/events', async function(req, res) {
    try {
        const token = await db.team.tokens.findOne({token : req.params.token});
        /*
        // don't expire tokens for now
        if(!token || token.expire < Date.now()) {
            return res.status(410).send('Token Expired');
        }
        */
        await sendFile(res, 'events.html', 'text/html');

    } catch(err) {
        logger.error(err);
        res.status(500).send('Ouch!');
    }
});