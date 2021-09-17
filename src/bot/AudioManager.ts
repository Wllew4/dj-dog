import { waitForMs } from "../util/util";
import { createReadStream } from 'fs';
import { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { TrackInfo } from "./Track";
import ytdl from 'ytdl-core';


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

  public async stream(url: string) {
    try{
      const basicInfo = await ytdl.getBasicInfo(url);
      const str = ytdl(url, { filter: 'audioonly'});
      const resource = createAudioResource(str, { inputType: StreamType.WebmOpus });
      this.audioPlayer.play(resource);
      this.audioPlayer.on('error', error => {
        console.error(error);
        // retry after 50ms

        const max_retries = 20;
        let retries = 0;
        const retryInterval = setTimeout(()=>{
          retries++;
          if(this.audioPlayer.unpause()){
            clearInterval(retryInterval);
            console.log(`Resuming playback after ${retries} retries.`);
            return;
          } else {
            if (retries>=max_retries){
              clearInterval(retryInterval);
              console.log(`Failed resuming playback after ${retries} retries.`);
              return;
            }
          };
        },50);
      });
      const msToWait = parseInt(basicInfo.videoDetails.lengthSeconds) * 1000;
      await waitForMs(msToWait);
    }
    catch(e){
      console.error(e);
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