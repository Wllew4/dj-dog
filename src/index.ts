import { DJDog } from './bot/DJDog';
import Secrets from './Secrets';

let djDog: DJDog;

Secrets.getSecrets().then((s) => {
  djDog = new DJDog(s);
});