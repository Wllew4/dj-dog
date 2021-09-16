import { StageChannel, VoiceChannel } from "discord.js";
import { waitForMs } from "../util/util";

export class AudioManager
{
    public constructor(channel: VoiceChannel | StageChannel)
    {
        this.channel = channel;

        this.paused = false;
    }

    public async play(path: string)
    {
        //Plays the file passed in as path
        //returns when song is done

        //waiting 5 seconds for debugging
        await waitForMs(10000);
    }

    public pause(): boolean
    {
        //pauses playback

        if(this.paused)
        {
            //unpause
            this.paused = false;
        }
        else
        {
            //pause
            this.paused = true;
        }
        return this.paused;
    }

    private paused:     boolean;

    private channel:    VoiceChannel | StageChannel;
};