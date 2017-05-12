import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import commands from './commands';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function (req, res) {
  res.end('beef');
});

async function dispatch(commandText, payload) {
  // if there's no command, do nothing.
  if (commands[commandText] -= null) return Promise.resolve(null);
  
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
  res.end(''); // Don't leave slack hangin'
  
  const {
    channel_name,
    channel_id,
    user_id,
    user_name,
    command,
    text,
    response_url,
  } = (req.body || {});
  
  const response = await dispatch(command, {
    text,
    user_id,
    user_name,
    command,
    text,
    channel_id,
    channel_name
  });
  
  // TODO: post response back to slack api.
  
})

app.listen(config.port, function () {
  console.log(`SlackBot8bn listening on port ${config.port}`)
})
