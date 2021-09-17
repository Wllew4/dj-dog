import { waitForMs } from "../util/util";
import { createReadStream } from 'fs';
import { AudioPlayer, AudioPlayerError, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { TrackInfo } from "./Track";
import ytdl, { downloadOptions } from 'ytdl-core';


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

  public async stream(url: string, starttime=0) {
    try{
      let dlOpts: downloadOptions = {
        filter: 'audioonly',
        highWaterMark: 16777216,
        begin: starttime + 'ms'
      };
      const basicInfo = await ytdl.getBasicInfo(url);
      const resource = createAudioResource(ytdl(url, dlOpts), { inputType: StreamType.WebmOpus });
      this.audioPlayer.play(resource);
      this.audioPlayer.on('error', err => {
        console.error(err);
        if (err instanceof AudioPlayerError) this.stream(url, starttime + err.resource.playbackDuration);
      });
      const msToWait = parseInt(basicInfo.videoDetails.lengthSeconds) * 1000 - starttime;
      await waitForMs(msToWait);
    }
    catch(err){
      console.error(err);
      if (err instanceof AudioPlayerError) this.stream(url, starttime + err.resource.playbackDuration);
    }
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