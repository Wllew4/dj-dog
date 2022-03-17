import DJDog from './bot/DJDog';
import getSecrets from './Secrets';

(async() => {
	new DJDog(await getSecrets());
})();