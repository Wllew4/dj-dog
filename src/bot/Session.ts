import { Track } from "./Track";

import { StageChannel, VoiceChannel } from "discord.js";
import {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    VoiceConnection
} from '@discordjs/voice';

export class Session
{
    constructor(channel: VoiceChannel | StageChannel)
    {
        this.channel = channel;
        this.controller = new AbortController();
        this.signal = this.controller.signal;
        this.queue = [];

        this.connection = joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator
        });

        this.join();
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

    public channel:     VoiceChannel | StageChannel;
    private connection: VoiceConnection;
    private controller: AbortController;
    private signal:     AbortSignal;

    public queue:       Track[];
};