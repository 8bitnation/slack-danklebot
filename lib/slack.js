
import config from '../config';
import * as slack from '@slack/client';
const client = new slack.WebClient(config.slackApiToken);

export async function userInfo(id) {
    return client.users.info(id);
}

export async function channels() {
    return client.channels.list();
}
