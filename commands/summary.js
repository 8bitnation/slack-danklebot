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
        text: util.format("Sorry, Bungie did not know anything about `%s`", name)
      });
  }

  // loop around each member
  for(let m = 0; m < member.length; m++) {
      msg.attachments = [...msg.attachments, ...await memberSummary(member[m])];
  }
  return msg;
}

async function memberSummary(member) {
  const r = await bungie.accountSummary(member.membershipType, member.membershipId);
  const chars = r.data.characters;

  const response = [{
    color: "#a6364f",
    author_icon: 'https://www.bungie.net'+member.iconPath,
    author_name: member.displayName,
    fields: [ {
      title: "Grimoire",
      value: r.data.grimoireScore
    }]
  }];

  //
  for(let c = 0; c < chars.length; c++) {
    let guardian = chars[c];
    let a = {
      thumb_url: 'https://www.bungie.net'+guardian.emblemPath,
      fields: [],
      color: "#36a64f",
      "mrkdwn_in": [ "text", "title" ]
    };

    a.title = util.format("%s %s %s",
      r.definitions.genders[guardian.characterBase.genderHash].genderName,
      r.definitions.races[guardian.characterBase.raceHash].raceName,
      r.definitions.classes[guardian.characterBase.classHash].className
    );
    //a.text = util.format("`%s %s`", a.text, "━".repeat(40 - a.text.length));

    a.fields.push({ title: "Level", value: guardian.characterLevel, short: true });
    a.fields.push({ title: "Light", value: guardian.characterBase.powerLevel, short: true });
    a.fields.push({ title: "Hours Played", value: Math.round( guardian.characterBase.minutesPlayedTotal / 6) / 10, short: true });

    if(guardian.characterBase.currentActivityHash) {
      let act = r.definitions.activities[guardian.characterBase.currentActivityHash];
      let dest = r.definitions.destinations[act.destinationHash];
      let type = r.definitions.activityTypes[act.activityTypeHash];
      //a.footer = util.format("%s / %s / %s", act.activityName, dest.destinationName, type.activityTypeName);
      //a.footer_icon = 'https://www.bungie.net'+dest.icon;
      a.fields.push({
        title: "Activity",
        value: util.format("%s / %s / %s", act.activityName, dest.destinationName, type.activityTypeName),
        short: true
      });
    }

    response.push(a);

  }
  return response;
}


