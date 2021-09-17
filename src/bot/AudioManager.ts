import { waitForMs } from "../util/util";
import { createReadStream } from 'fs';
import { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { TrackInfo } from "./Track";

export class AudioManager
{
  private paused: boolean;
  public audioPlayer: AudioPlayer;

  /**
   * Constructs a new AudioManager object
   * Handles audio playback for a session
   */
  public constructor()
  {
    this.paused = false;
    this.audioPlayer = createAudioPlayer({	behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    }});
  }

  private async probeAndCreateResource(path: string): Promise<AudioResource> {
    const readableStream = createReadStream(path);
    const { stream, type } = await demuxProbe(readableStream);
    return createAudioResource(stream, { inputType: type });
  }

  public async play(trackInfo: TrackInfo)
  {
    const resource = await this.probeAndCreateResource(trackInfo.path);
    this.audioPlayer.play(resource);
    
    await waitForMs(trackInfo.duration * 1000);
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