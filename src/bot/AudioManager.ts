import { waitForMs } from "../util/util";

import { VoiceConnection } from "@discordjs/voice";

export class AudioManager
{
  private paused: boolean;

  public constructor(private channel: VoiceConnection)
  {
    this.paused = false;
  }

  public async play(url: string)
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
};