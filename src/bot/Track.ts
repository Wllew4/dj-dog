import { unlink } from 'fs';

//  Needs download() code

export class Track
{
  public path: string;
  
  public constructor(public url: string)
  {
    this.url = url;

    this.path = this.download(this.url);
  }

  private download(url: string): string
  {
    //download track and return file path
    return '';
  }

  public delete()
  {
    unlink(this.path, e => {
      if(e) console.error(e);
    });
  }
};