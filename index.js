import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import {commands, routers} from './commands';
import * as db from './lib/db'
import fetch from 'isomorphic-fetch';
import { forOwn } from 'lodash';
import cookieParser from 'cookie-parser';

import * as logger from 'winston';
// fudge - by default winston disables timestamps on the console
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { prettyPrint: true, 'timestamp':true, level: 'debug' });

logger.info('Starting bot');

const app = express();

app.use(express.static('public'))
app.use(cookieParser());

// simple express logger
app.use(function(req, res, next) {
  logger.info(`<<< ${req.method} ${req.originalUrl}`);
  res.on('finish', function() {
    logger.info(`>>> ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
  
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// add all the sub routers defined in commands
forOwn(routers, function(v, k) {
  logger.info(`adding router for: ${k}`);
  app.use(k, v);
});


async function dispatch(commandText, payload) {
  // if there's no command, do nothing.
  if (!commands[commandText]) return null;
  
  return await commands[commandText](payload);
}

/*
  token=...
  team_id=...
  team_domain=example
  channel_id=C2147483705
  channel_name=test
  user_id=U2147483697
  user_name=Steve
  command=/weather
  text=94070
  response_url=https://hooks.slack.com/commands/1234/5678
*/

app.post('/command', async function (req, res) {
  res.end(); // Don't leave slack hangin'
  
  const {
    channel_name,
    channel_id,
    user_id,
    user_name,
    command,
    text,
    response_url,
    token
  } = (req.body || {});
  logger.info(req.body);
  try {
  
    const response = await dispatch(command, {
      text,
      user_id,
      user_name,
      command,
      channel_id,
      channel_name,
      req
    });
  
    if(response) {
      // TODO: post response back to slack api.
      logger.info(`sending response to: ${response_url}`);

      const result = await fetch(response_url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(response)
      });
      if(result.status !== 200) {
        logger.error(result);
      }
      
    }

  } catch(err) {
    logger.error(err);
  }

  
});

(async function init() {
  await db.init();

  const events = await db.team.events.find();

  app.listen(config.port, function () {
    logger.info(`SlackBot8bn listening on port ${config.port}`)
  });
})();

