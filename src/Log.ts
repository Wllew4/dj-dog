export default class Log {
	private static prefix(): string {
		const uptime: string = process.uptime().toFixed(3).padStart(10, '0')
		return '[ ' + uptime + ' ]: '
	}

	public static logSystem(msg: string) {
		console.log(Log.prefix() + msg)
	}

	public static logSystemErr(msg: any) {
		console.error(Log.prefix() + msg)
	}
}
