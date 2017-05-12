export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  testCommandToken: process.env.TEST_COMMAND_TOKEN || '',
  slackTeamID: process.env.SLACK_TEAM_ID,
  bungieApiToken: process.env.BUNGIE_TOKEN,
};
