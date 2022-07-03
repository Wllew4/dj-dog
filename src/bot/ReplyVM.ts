import { Message } from "discord.js";
import Queue from "./Queue";
import Track from "./Track";

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
	public async render(track: Track | undefined, queue: Queue<Track> | undefined, paused: boolean | undefined): Promise<void>
	{
		// Update Queue
		let queueS = "";
		if(queue)
		{
			for(let i = 0; i < queue.length(); i++)
				queueS += `${i+1}. [${(await queue.at(i).info).title}](${(await queue.at(i).info).webpage_url})\n`;
		}

		// Update current track
		if (track){
			const info = await track.info;
			let thumb = null;
			if (info.thumbnail) thumb = info.thumbnails[0];
			(await this._replyMessage).edit({
				content: !paused ? `⯈ Playing` : '⏸︎ Paused',
				embeds: [
					{
						author:{
							name: info.uploader,
							url: info.channel_url
						},
						title: info.title,
						url: info.webpage_url,
						thumbnail:thumb ? {
							url: thumb.url,
							width: thumb.width,
							height: thumb.height
						} : undefined,
						color:'LUMINOUS_VIVID_PINK',
						description:info.is_live !== undefined && info.is_live || info.duration === undefined ? '🔴 LIVE' : `${new Date(info.duration*1000).toISOString().slice(11,19)}`,
						// footer:{
						//     text: `${'Foshka#0001'}`,
						//     iconURL: 'https://cdn.discordapp.com/avatars/124131215547695104/73bd451ab76416e584b316b35c37eb8c.webp?size=128'
						// },
						timestamp:Date.now(),
						fields:
						[
							{
								name: "Queue",
								value: (queueS != "") ? queueS : "Queue is Empty"
							}
						]
					}
				]
			});
		}
		else
		{
			(await this._replyMessage).edit("Nothing playing right now, type /play <song> to add a song to the queue.");
		}
	}

	public async remove()
	{
		(await this._replyMessage).delete();
	}
}

export default ReplyVM;
