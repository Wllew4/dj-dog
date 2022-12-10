import { Secrets } from '../Secrets'
import Session from './Session'

import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import {
	Client,
	CommandInteraction,
	GuildMember,
	Intents,
	Interaction,
	Message,
	StageChannel,
	TextChannel,
	VoiceChannel,
} from 'discord.js'
import { APIMessage } from 'discord.js/node_modules/discord-api-types'
import ReplyVM from './ReplyVM'

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
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
		})

		this.refreshSlashCommands()
		this.client.on('interactionCreate', (i) => {
			this.replyCommands(i)
		})

		this.client.login(this.secrets.token)
		this.client.on('ready', () => {
			console.log('Ready!!')
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
			console.error(e)
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
			return
		}

		// Check for existing session
		const vc = i.member.voice.channel
		if (!vc) {
			DJDog.replyTimeout(i, 'You are not in a voice channel!')
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
				break

			case 'play':
				let bNewSession = false
				if (session === undefined) {
					session = this.startSession(vc, i.fetchReply())
					bNewSession = true
				}
				const query = i.options.getString('song', true)
				i.reply(`Searching for "${query}"...`)
				let r = await session.play(query)
				if (!bNewSession) {
					await ((await i.fetchReply()) as Message).edit(r)
					setTimeout(() => {
						i.deleteReply()
					}, 5000)
				}
				break
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
				const index = i.options.getInteger('index', true)
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
