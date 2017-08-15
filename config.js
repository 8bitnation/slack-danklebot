export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  testCommandToken: process.env.TEST_COMMAND_TOKEN || '',
  slackTeamID: process.env.SLACK_TEAM_ID,
  bungieApiToken: process.env.BUNGIE_API_TOKEN,
  slackApiToken: process.env.SLACK_API_TOKEN,
  dbUrl: process.env.DB_URL,
  teamChannels: [
    'ps4-pve-general',
    'ps4-pve-raids'
  ]
};
