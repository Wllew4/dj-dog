import { DJDog } from './bot/DJDog';
import Secrets from './Secrets';

Secrets.getSecrets().then((s) => {
  new DJDog(s.token, s.client_id);
});