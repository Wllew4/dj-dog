import {SecretManagerServiceClient} from '@google-cloud/secret-manager';
import confidential from './confidential.json';

let secrets = confidential;

if (confidential.token.length == 0) {
  const client = new SecretManagerServiceClient();
  // @ts-ignore
  secrets = await client.getSecret('confidential');
}

const youtube_api_key = secrets.youtube_api_key;
const token = secrets.token;
const client_id = secrets.client_id;
const guild_id = secrets.guild_id;

export {
  youtube_api_key,
  token,
  client_id,
  guild_id
};