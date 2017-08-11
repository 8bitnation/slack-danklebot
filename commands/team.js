import express from 'express';

import * as db from '../lib/db';

/**
 * 
 */



export const command = '/team';
export async function handler(payload) {

    // create a new token for accessing the team page
    // and return the link to the user

    db.team.tokens.create({
        id: 'test',
        uuid: 'test',
        expire: Date.now() + 9000000
    });
    
}

export const router = express.Router();
router.get('/', function(req, res) {
    try {
        //db.team.find();
        res.render('team/index');
    } catch(err) {
        logger.error(err);
        res.status(500).send('Ouch!');
    }
});