import { Message, MessageEditOptions } from 'discord.js'
import Queue from '../music/Queue'
import Track from '../music/Track'

/**
 * ViewModel representing the current track.
 * Updates a set Discord message every time a setter is used.
 */
class ReplyVM {
	/**
	 * @param _replyMessage The reply to the summoning interaction, obtained after replying from Interaction.fetchReply()
	 */
	constructor(private readonly _replyMessage: Promise<Message>) {}

	/**
	 * Update ViewModel
	 */
	public async render(
		track: Track | undefined,
		queue: Queue<Track>,
		paused: boolean
	): Promise<void> {
		if (track)
			(await this._replyMessage).edit(
				await this.busyPlayer(track, queue, paused)
			)
		else (await this._replyMessage).edit(await this.emptyPlayer())
	}

	public async remove() {
		;(await this._replyMessage).delete()
	}

	private async emptyPlayer(): Promise<MessageEditOptions> {
		return {
			content:
				'Nothing playing right now, type `/play <song>` to add a song to the queue.',
			embeds: [
				{
					title: 'No music queued',
					thumbnail: undefined,
					color: 'LUMINOUS_VIVID_PINK',
					description: new Date(0 * 1000).toISOString().slice(11, 19),
					fields: [
						{
							name: 'Queue',
							value: 'Queue is Empty',
						},
					],
					timestamp: Date.now(),
				},
			],
		}
	}

	private async busyPlayer(
		track: Track,
		queue: Queue<Track>,
		paused: boolean
	): Promise<MessageEditOptions> {
		// Update Queue
		let queueS = ''
		if (queue)
			for (let i = 0; i < queue.length(); i++)
				queueS += `${i + 1}. [${queue.at(i).info.title}](${
					queue.at(i).info.webpage_url
				})\n`
		// Shorthand track references
		const info = track.info
		let thumb = null
		if (info.thumbnail) thumb = info.thumbnails[0]
		// Populate ViewModel
		return {
			content: !paused ? `⯈ Playing` : '⏸︎ Paused',
			embeds: [
				{
					author: {
						name: info.uploader,
						url: info.channel_url,
					},
					title: info.title,
					url: info.webpage_url,
					thumbnail: thumb
						? {
								url: thumb.url,
								width: thumb.width,
								height: thumb.height,
						  }
						: undefined,
					color: 'LUMINOUS_VIVID_PINK',
					description: info.is_live
						? '🔴 LIVE'
						: `${new Date(info.duration * 1000)
								.toISOString()
								.slice(11, 19)}`,
					fields: [
						{
							name: 'Queue',
							value: queueS != '' ? queueS : 'Queue is Empty',
						},
					],
					timestamp: Date.now(),
				},
			],
		}
	}
}

export default ReplyVM
