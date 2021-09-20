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
      console.error(error);
      console.log("confidential.json not found, checking gcp secret...");
      const client = new SecretManagerServiceClient();
      try {
        const [secret] = await client.accessSecretVersion({
          name: `projects/1061050247606/secrets/confidential/versions/latest`,
        });
        //@ts-expect-error
        const responsePayload = secret.payload.data.toString('utf8');
        this.secrets = JSON.parse(responsePayload);
      } catch (error) {
        console.error("Could not get secret from gcp");
        console.error(error);
        process.exit(1);
      }
    }
    return this.secrets;
  };
}

export default Secrets;