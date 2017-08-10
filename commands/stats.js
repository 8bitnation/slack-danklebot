import * as bungie from '../lib/bungie';
import { flatten, compact } from 'lodash';

export const command = '/stats';
export async function handler(payload) {
  // do some stuff with the payload

  const name = payload.text.length ? payload.text : payload.user_name;
  const msg = {
    "response_type": "ephemeral",
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
    await Promise.all(member.map(memberStats))
  );
  return msg;
}

async function memberStats(member) {
  const stats = await bungie.accountStats(member.membershipType, member.membershipId);
  
  const pve = stats.mergedAllCharacters.results.allPvE.allTime;
  const pvp = stats.mergedAllCharacters.results.allPvP.allTime;

  const response = [];

  if (pve) {
    const a = {    
      color: "#36a64f",
      author_icon: 'https://www.bungie.net'+member.iconPath,
      author_name: member.displayName,
      text: "PvE",
      fields: []
    };
    a.fields.push({ title: "Time Played", value: pve.secondsPlayed.basic.displayValue, short: true });
    a.fields.push({ title: "Highest Light Level", value: pve.highestLightLevel.basic.displayValue, short: true });
    a.fields.push({ title: "KDR", value: pve.killsDeathsRatio.basic.displayValue, short: true });
    a.fields.push({ title: "Precision Kills", value: pve.precisionKills.basic.displayValue, short: true });
    a.fields.push({ title: "Best Weapon", value: pve.weaponBestType.basic.displayValue, short: true });

    response.push(a);
  }

  if (pve) {
    const a = {    
      color: "#a6364f",
      author_icon: 'https://www.bungie.net'+member.iconPath,
      author_name: member.displayName,
      text: "PvP",
      fields: []
    };
    a.fields.push({ title: "Time Played", value: pvp.secondsPlayed.basic.displayValue, short: true });
    a.fields.push({ title: "Highest Light Level", value: pvp.highestLightLevel.basic.displayValue, short: true });
    a.fields.push({ title: "KDR", value: pvp.killsDeathsRatio.basic.displayValue, short: true });
    a.fields.push({ title: "Precision Kills", value: pvp.precisionKills.basic.displayValue, short: true });
    a.fields.push({ title: "Best Weapon", value: pvp.weaponBestType.basic.displayValue, short: true });
    a.fields.push({ title: "Win Loss Ratio", value: pvp.winLossRatio.basic.displayValue, short: true });
    a.fields.push({ title: "Longest Spree", value: pvp.longestKillSpree.basic.displayValue, short: true });
    response.push(a);
  }
  return response;

}