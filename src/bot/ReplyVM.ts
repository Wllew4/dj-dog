import { Message } from "discord.js";
import Track from "./Track";

/**
 * Viewmodel representing the current track.
 * Updates a set Discord message every time a setter is used.
 */
class ReplyVM {
	private _track: Track | undefined = undefined;
	public get track(): Track | undefined {
		return this._track;
	}
	public set track(value: Track | undefined) {
		this._track = value;
		this.render();
	}
	private _isPlaying: boolean = true;
	/**
	 * 
	 * @param _replyMessage The reply to the summoning interaction, obtained after replying from Interaction.fetchReply()
	 */
	constructor(private readonly _replyMessage: Message) {
	}
	private async render(): Promise<void>{
		if (this._track){
			const info = await this._track.info;
			let thumb = null;
			if (info.thumbnail) thumb = info.thumbnails[0];
			this._replyMessage.edit({
				content: this._isPlaying ? `⯈ Playing` : '▎ ▎ Paused',
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
						timestamp:Date.now()
					}
				]
			});
		} else {
			this._replyMessage.edit("Nothing playing right now, reply to the thread or type /play <song> to add a song.");
		}
	};
}

export default ReplyVM;