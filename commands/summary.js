import * as bungie from '../bungieApi';
import * as util from 'util';

export const command = '/summary';
export async function handler(payload) {
  // do some stuff with the payload

  const name = payload.text.length ? payload.text : payload.user_name;
  const msg = {
      "response_type": "ephemeral",
      attachments: []
  };

  const member = [
      ...await bungie.getPlayerID(1, name),
      ...await bungie.getPlayerID(2, name)
  ];

  if(!member.length) {
      return({
        "response_type": "ephemeral",
        text: "Sorry, Bungie did not know anything about `" + name + "`"
      });
  }

  // loop around each member
  for(let m = 0; m < member.length; m++) {
      let a = {
          color: "#a6364f",
          author_icon: 'https://www.bungie.net'+member[m].iconPath,
          author_name: member[m].displayName
      }; // new attachment

      msg.attachments = [...msg.attachments, a, ...await memberSummary(member[m])];

  }
  return msg;
}

async function memberSummary(member) {
  const r = await bungie.accountSummary(member.membershipType, member.membershipId);
  const chars = r.data.characters;

  const response = [];
  //
  for(let c = 0; c < chars.length; c++) {
    let guardian = chars[c];
    let a = {
      thumb_url: 'https://www.bungie.net'+guardian.emblemPath,
      fields: [],
      color: "#36a64f",
      "mrkdwn_in": [ "text", "title" ]
    };

    a.text = util.format("*━━━ %s %s %s ",
      r.definitions.genders[guardian.characterBase.genderHash].genderName,
      r.definitions.races[guardian.characterBase.raceHash].raceName,
      r.definitions.classes[guardian.characterBase.classHash].className
    );
    a.text += "━".repeat(40 - a.text.length) + "*";

    a.fields.push({ title: "Level", value: guardian.characterLevel, short: true });
    a.fields.push({ title: "Light", value: guardian.characterBase.powerLevel, short: true });
    a.fields.push({ title: "Hours Played", value: Math.round( guardian.characterBase.minutesPlayedTotal / 6) / 10, short: true });

    response.push(a);
  }
  return response;
}


