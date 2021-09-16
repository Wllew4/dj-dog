interface IFetchStrategy {
  fetch(url:string): Promise<string>;
}