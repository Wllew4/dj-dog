import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

export interface secret {
  debug:"",
  token:"",
  client_id:"",
  guild_id:"",
  youtube_api_key:""
};

class Secrets {
  private static secrets: secret;

  static async getSecrets () {
    try {
      this.secrets = require('../confidential.json');
    } catch (error) {
			console.log("Failed to load credentials!");
      console.error(error);
    }
    return this.secrets;
  };
}

export default Secrets;