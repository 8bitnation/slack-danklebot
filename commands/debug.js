import express from 'express';
import config from '../config';
import * as db from '../lib/db';

export async function route(req, res, next) {

}

export const router = express.Router();

router.get('/', async function (req, res) {

  res.end(JSON.stringify({
    env: process.env,
    routes: req.app._router.stack.map(function(middleware){
        return {
            'type': middleware.name,
            'pattern': middleware.regexp.source
        };
    }),
    db: await db.stats()
  }));
});