import { TrackInfo } from "../bot/Track";

export interface IFetchStrategy {
  fetch(url:string): Promise<TrackInfo>;
}