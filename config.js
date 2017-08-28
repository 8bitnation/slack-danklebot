export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  testCommandToken: process.env.TEST_COMMAND_TOKEN || '',
  slackTeamID: process.env.SLACK_TEAM_ID,
  bungieApiToken: process.env.BUNGIE_API_TOKEN,
  slackApiToken: process.env.SLACK_API_TOKEN,
  dbUrl: process.env.DB_URL,
  homePage: 'http://8bitnation.com/',
  teamChannels: [
    'pc-pve-general',
    'pc-pvp-activities',
    'pc-pve-raids',
    'ps4-pve-general',
    'ps4-pvp-activities',
    'ps4-pve-raids',
    'xb1-pve-general',
    'xb1-pvp-activities',
    'xb1-pve-raids'
  ]
};
