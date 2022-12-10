/**
 * Basic logging functionality
 */
export default class Log {
	/**
	 * Get the uptime prefix
	 * @returns Prefix including current uptime
	 */
	private static prefix(): string {
		const uptime: string = process.uptime().toFixed(3).padStart(10, '0')
		return '[ ' + uptime + ' ]: '
	}

	/**
	 * Pretty log to stdout
	 * @param msg message to log
	 */
	public static logSystem(msg: string) {
		console.log(Log.prefix() + msg)
	}

	/**
	 * Pretty log to stderr
	 * @param msg message to log
	 */
	public static logSystemErr(msg: any) {
		console.error(Log.prefix() + msg)
	}
}
