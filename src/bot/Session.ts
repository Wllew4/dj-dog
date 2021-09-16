import { Track } from './Track';

import { StageChannel, TextChannel, VoiceChannel } from 'discord.js';
import {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    VoiceConnection
} from '@discordjs/voice';

export class Session
{
    constructor(vChannel: VoiceChannel | StageChannel, tChannel: TextChannel)
    {
        this.vChannel = vChannel;
        this.tChannel = tChannel;
        this.controller = new AbortController();
        this.signal = this.controller.signal;
        this.queue = [];

        this.connection = joinVoiceChannel({
            channelId: this.vChannel.id,
            guildId: this.vChannel.guild.id,
            adapterCreator: this.vChannel.guild.voiceAdapterCreator
        });
    }

    public async join()
    {
        try
        {
            await entersState(this.connection, VoiceConnectionStatus.Ready, this.signal);
        }
        catch (e)
        {
            this.controller.abort();
            console.error(e);
        }
    }

    public async leave()
    {
        try
        {
            this.connection.destroy();
        }
        catch (e)
        {
            console.error(e);
        }
    }

    public async play(url: string)
    {
        console.log(`parse this url: ${url}`);
    }

    public vChannel:    VoiceChannel | StageChannel;
    private tChannel:   TextChannel;
    private connection: VoiceConnection;
    private controller: AbortController;
    private signal:     AbortSignal;

    public queue:       Track[];
};