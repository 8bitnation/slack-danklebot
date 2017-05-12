// @flow
import fetch from 'isomorphic-fetch';
import queryString from 'query-string';

import config from './config';

const BASE_URL = 'http://www.bungie.net';

export
function makeGETRequest(path: string, params: ?Object) {
  let paramString = '';
  if (params != null) {
    paramString = `?${queryString.stringify(params)}`;
  }

  const response = await fetch(`${BASE_URL}${path}/${paramString}`, {
    credentials: 'include',
    headers: {
      'x-api-key': config.bungieApiToken,
      'Accept': 'application/json',
    }
  })

  const json = await response.json();

  return { response, json, Response: json.Response };
}

type MembershipType = '1' | '2';

export
function getPlayerID(
  membershipType: MembershipType,
  displayName: string,
) {
  const path = `/SearchDestinyPlayer/${membershipType}/${displayName}`;
  const makeGETRequest(path)
}
