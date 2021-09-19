import {SecretManagerServiceClient} from '@google-cloud/secret-manager';
import confidential from './confidential.json';

class Secrets {
  private static secrets = confidential;
  static async getSecrets () {
    if (this.secrets.token.length == 0) {
      const client = new SecretManagerServiceClient();
      // @ts-ignore
      secrets = await client.getSecret('confidential');
    }
    return this.secrets;
  };
}

export default Secrets;