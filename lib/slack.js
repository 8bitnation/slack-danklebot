
import config from '../config';

import WebClient from ('@slack/client');
export const client = new WebClient(config.slackApiToken);
