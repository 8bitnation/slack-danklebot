
import config from '../config';
import * as slack from '@slack/client';
const client = new slack.WebClient(config.slackApiToken);

export async function userInfo(id) {
    return client.users.info(id);
}

export async function channels() {
    let cursor = '';
    const channels = [];
    do {
        let req = await client.conversations.list( { 
            exclude_archived : true,
            cursor,
            limit: 100
        });

        if(!req.ok) {
            return { ok: false, channels: [] };
        }

        req.channels.forEach( c => channels.push(c) );

        cursor = req.response_metadata.next_cursor;
    } while (cursor !== '');
    return {
        ok: true,
        channels
    }
}

export async function members(channel) {
    let cursor = '';
    const members = [];
    do {
        let req = await client.conversations.members(channel, {
            cursor,
            limit: 100
        });

        if(!req.ok) {
            return { ok: false, members: [] };
        }

        req.members.forEach( m => members.push(m) );

        cursor = req.response_metadata.next_cursor;
    } while (cursor !== '');
    return {
        ok: true,
        members
    }
}



export async function postMessage(channel, message, opts) {
    return client.chat.postMessage(channel, message, opts);
}

// why are the args for postMessage and delete message
export async function deleteMessage(ts, channel, opts) {
    return client.chat.delete(ts, channel, opts);
}
