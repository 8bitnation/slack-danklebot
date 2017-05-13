import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import commands from './commands';
import fetch from 'isomorphic-fetch';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function (req, res) {
  res.end('beef');
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
  console.log(req.body);
  try {
  
    const response = await dispatch(command, {
      text,
      user_id,
      user_name,
      command,
      channel_id,
      channel_name
    });
  
    if(response) {
      // TODO: post response back to slack api.
      console.log("sending response to: ", response_url);

      const result = await fetch(response_url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(response)
      });
      if(result.status !== 200) {
        console.error(result);
      }
      
    }

  } catch(err) {
    console.error(err);
  }

  
});

app.listen(config.port, function () {
  console.log(`SlackBot8bn listening on port ${config.port}`)
});
