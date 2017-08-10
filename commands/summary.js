import * as bungie from '../lib/bungie';
import { flatten, compact } from 'lodash';

const classColour = [
    '#B25F00', // titan
    '#634438', // hunter
    '#1F3330' // warlock
    ];

export const command = '/summary';
export async function handler(payload) {
  // do some stuff with the payload

  const name = payload.text.length ? payload.text : payload.user_name;
  const msg = {
      "response_type": "in_channel",
      attachments: []
  };

  const member = flatten(compact(await Promise.all([
    bungie.getPlayerID(1, name),
    bungie.getPlayerID(2, name),
  ])));

  if(!member.length) {
      return({
        "response_type": "ephemeral",
        text: `Sorry, Bungie did not know anything about \`${name}\``
      });
  }

  // loop around each member
  msg.attachments = flatten(
    await Promise.all(member.map(memberSummary))
  );
  return msg;
}

async function memberSummary(member) {
  const r = await bungie.accountSummary(member.membershipType, member.membershipId);
  const chars = r.data.characters;

  const response = [{
    color: "#a6364f",
    author_icon: 'https://www.bungie.net'+member.iconPath,
    author_name: member.displayName,
    "mrkdwn_in": [ "text" ],
    text: `*Grimoire:* ${r.data.grimoireScore}`
  }];

  //
  for(let c = 0; c < chars.length; c++) {
    let guardian = chars[c];
    let text = [];
    let a = {
      thumb_url: 'https://www.bungie.net'+guardian.emblemPath,
      color: classColour[guardian.characterBase.classType],
      "mrkdwn_in": [ "text" ]
    };

    a.title = 
      r.definitions.genders[guardian.characterBase.genderHash].genderName + " " +
      r.definitions.races[guardian.characterBase.raceHash].raceName + " " +
      r.definitions.classes[guardian.characterBase.classHash].className + " ";

    //a.text = util.format("`%s %s`", a.text, "━".repeat(40 - a.text.length));
    text.push(`       Level: ${guardian.characterLevel}`);
    text.push(`       Light: ${guardian.characterBase.powerLevel}`);
    text.push(`Hours Played: ${Math.round( guardian.characterBase.minutesPlayedTotal / 6) / 10}`);

    if(guardian.characterBase.currentActivityHash) {
      let act = r.definitions.activities[guardian.characterBase.currentActivityHash];
      let dest = r.definitions.destinations[act.destinationHash];
      let type = r.definitions.activityTypes[act.activityTypeHash];
      //a.footer = util.format("%s / %s / %s", act.activityName, dest.destinationName, type.activityTypeName);
      //a.footer_icon = 'https://www.bungie.net'+dest.icon;
      text.push(`    Activity: ${type.activityTypeName} / ${act.activityName} / ${dest.destinationName}`);
    }
    a.text = `\`\`\`${text.join("\n")}\`\`\``;

    response.push(a);

  }
  return response;
}