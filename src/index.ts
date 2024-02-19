import DJDog from './bot/DJDog'
import Log from './Log'
import getSecrets from './Secrets'
Log.init()
;(async () => {
	new DJDog(await getSecrets())
})()
