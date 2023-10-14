import { Secrets } from '../Secrets'
import Session from './Session'

import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import {
	APIMessage,
	Client,
	CommandInteraction,
	GuildMember,
	IntentsBitField,
	Interaction,
	Message,
	StageChannel,
	TextChannel,
	VoiceChannel,
} from 'discord.js'
import ReplyVM from './ReplyVM'
import Log from '../Log'
import Track from '../music/Track'
import YTSearchTrack from '../yt/SearchTrack'

export default class DJDog {
	private client: Client
	private sessions: Session[] = []
	private static readonly DELETE_REPLY_TIMEOUT = 5000

	/**
	 * Bot class, initializes commands and manages sessions.
	 * @param secrets keys
	 */
	public constructor(private secrets: Secrets) {
		this.client = new Client({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildVoiceStates,
			],
		})

		this.refreshSlashCommands()
		this.client.on('interactionCreate', (i) => {
			this.replyCommands(i)
		})

		this.client.login(this.secrets.token)
		this.client.on('ready', () => {
			Log.logSystem('Ready!!')
			this.client.user?.setActivity(
				`your favorite tunes (v${process.env.npm_package_version})`
			)
		})
	}

	/**
	 * Finds a session by the voice channel associated with it
	 * @param vChannel Voice channel associated with the session
	 * @returns A session based on the parameters given
	 */
	private getSession(
		vChannel: VoiceChannel | StageChannel
	): Session | undefined {
		for (let session of this.sessions)
			if (session.vChannel == vChannel) return session
	}

	/**
	 * Start a new session
	 * @param vChannel VoiceChannel for session
	 * @returns new Session
	 */
	private startSession(
		vChannel: VoiceChannel | StageChannel,
		i: Promise<Message | APIMessage>
	): Session {
		return this.sessions[
			this.sessions.push(
				new Session(vChannel, this, new ReplyVM(i as Promise<Message>))
			) - 1
		]
	}

	/**
	 * Ends a session
	 * @param s the session to end
	 */
	public endSession(s: Session) {
		this.sessions.forEach((item, index) => {
			if (item == s) {
				item.leave()
				this.sessions.splice(index, 1)
			}
		})
	}

	/**
	 * Refreshes the / commands on a given DJDog instance
	 * @param this The owning DJDog object
	 */
	private async refreshSlashCommands(this: DJDog) {
		const rest = new REST({ version: '9' }).setToken(this.secrets.token)

		try {
			const commands = require('../../commands.json')

			await rest.put(Routes.applicationCommands(this.secrets.client_id), {
				body: commands,
			})
		} catch (e) {
			Log.logSystemErr(e)
		}
	}

	/**
	 * Reply and delete
	 * @param i Interaction to respond to
	 * @param msg Message to respond with
	 */
	private static replyTimeout(i: CommandInteraction, msg: string) {
		i.reply(msg)
		setTimeout(() => {
			i.deleteReply()
		}, DJDog.DELETE_REPLY_TIMEOUT)
	}

	/**
	 * Respond to commands
	 * @param i Interaction
	 */
	private async replyCommands(i: Interaction): Promise<void> {
		// Type-checking for CommandInteraction
		if (
			!i.isCommand() ||
			!(i.channel instanceof TextChannel) ||
			!(i.member instanceof GuildMember)
		)
			return

		// Commands that don't require a session
		if (i.commandName == 'ping' || i.commandName == 'pong') {
			i.reply(i.commandName == 'ping' ? 'pong!' : 'ping!')
			Log.logSystem(i.commandName == 'ping' ? 'Pinged!' : 'Ponged!')
			return
		}

		// Check for existing session
		const vc = i.member.voice.channel
		if (!vc) {
			DJDog.replyTimeout(i, 'You are not in a voice channel!')
			Log.logSystemErr(
				`Received command from "${i.member.displayName}" in channel "#${i.channel.name}" of "${i.guild?.name}", but they were not in a voice channel`
			)
			return
		}
		let session = this.getSession(vc)

		// Commands that can begin a session
		switch (i.commandName) {
			case 'join':
				if (session === undefined) {
					this.startSession(vc, i.fetchReply())
					i.reply(`Joining voice channel: ${vc}`)
					break
				}
				DJDog.replyTimeout(i, `A session already exists in ${vc}`)
				return

			case 'play':
				// Search for track
				const query = i.options.get('song', true).value as string
				i.reply(`Searching for "${query}"...`)
				const track: Track | null = await YTSearchTrack.getTrack(query)

				// Validate that track was found
				if (track == null) {
					await ((await i.fetchReply()) as Message).edit(
						`Sorry, we could not process your query: ${query}`
					)
					setTimeout(() => {
						i.deleteReply()
					}, 5000)
				} else {
					// Create session if needed
					let bNewSession = false
					if (session === undefined) {
						session = this.startSession(vc, i.fetchReply())
						bNewSession = true
					}

					// Add track to queue
					await session.play(track)

					// Reply
					if (!bNewSession) {
						await ((await i.fetchReply()) as Message).edit(
							`Added [${track.info.title}](${track.url}) to the queue.`
						)
						setTimeout(() => {
							i.deleteReply()
						}, 5000)
					}
				}
				return
		}

		// Confirm existing session
		if (session === undefined) {
			DJDog.replyTimeout(i, `No active session exists in ${vc}`)
			return
		}

		// Commands that require an active session
		switch (i.commandName) {
			case 'leave':
				this.endSession(session)
				DJDog.replyTimeout(i, `Leaving voice channel: ${vc}`)
				break

			case 'remove':
				const index = i.options.get('index', true).value as number
				DJDog.replyTimeout(i, await session.remove(index))
				break

			case 'skip':
				DJDog.replyTimeout(i, await session.skip())
				break

			case 'pause':
				DJDog.replyTimeout(i, await session.pause())
				break
		}
	}
}
