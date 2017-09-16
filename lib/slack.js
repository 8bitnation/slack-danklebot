
import config from '../config';
import * as slack from '@slack/client';
const client = new slack.WebClient(config.slackApiToken);

export async function userInfo(id) {
    return client.users.info(id);
}

export async function channels() {
    return client.channels.list();
}

export async function postMessage(channel, message, opts) {
    return client.chat.postMessage(channel, message, opts);
}

// why are the args for postMessage and delete message
export async function deleteMessage(ts, channel, opts) {
    return client.chat.delete(ts, channel, opts);
}
