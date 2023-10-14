import fs from 'fs'

/**
 * Basic logging functionality
 */
export default class Log {
	private static LOG_FILE = `./logs/${new Date().toISOString()}.log`

	/**
	 * Get the uptime prefix
	 * @returns Prefix including current uptime
	 */
	private static prefix(): string {
		const uptime: string = process.uptime().toFixed(3).padStart(10, '0')
		return `[ ${uptime} ]: `
	}

	/**
	 * Pretty log to stdout
	 * @param msg message to log
	 */
	public static logSystem(msg: string) {
		const _msg = `${Log.prefix()} ${msg}`
		console.log(_msg)
		fs.writeFile(this.LOG_FILE, `${_msg}\n`, { flag: 'a+'}, () => {})
	}

	/**
	 * Pretty log to stderr
	 * @param msg message to log
	 */
	public static logSystemErr(msg: any) {
		const _msg = `${Log.prefix()} ERR: ${msg}`
		console.log(_msg)
		fs.writeFile(this.LOG_FILE, `${_msg}\n`, { flag: 'a+'}, () => {})
	}
}
