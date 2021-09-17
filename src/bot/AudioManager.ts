import { waitForMs } from "../util/util";
import { createReadStream } from 'fs';
import { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { TrackInfo } from "./Track";
import ytdl from 'ytdl-core';


export class AudioManager
{
  private paused: boolean;
  public audioPlayer: AudioPlayer;
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

    //Plays the file passed in as path
    //returns when song is done

    //waiting 5 seconds for debugging
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
      });

      const interval = setInterval(()=>{
        console.log(str.readableLength);
        console.log(resource.playbackDuration);
      },5000);

      const msToWait = parseInt(basicInfo.videoDetails.lengthSeconds) * 1000;
      await waitForMs(msToWait);
      clearInterval(interval);
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