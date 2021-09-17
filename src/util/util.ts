/**
 * Use with await to sleep thread
 * @param ms time to wait in milliseconds
 */
export async function waitForMs(ms: number)
{
  await new Promise( f => setTimeout(f, ms));
}

/**
 * Generic class for handling FIFO queues
 */
export class Queue<T>
{
  private data: T[] = [];

  /**
   * Add an item to the queue
   * @param item item to add to queue
   */
  public add(item: T)
  {
    this.data.push(item);
  }

  /**
   * Get item at the top of the queue
   * @returns item at top of queue
   */
  public get(): T
  {
    return this.data[0];
  }

  /**
   * Remove first element of queue, shift all other elements down
   */
  public advance()
  {
    this.data.shift();
  }

  /**
   * Get the length of the queue
   * @returns the length of the queue
   */
  public length(): number
  {
    return this.data.length;
  }

  /**
   * Get an item in the queue
   * @param index the index of the item to get
   * @returns the item at the given index
   */
  public at(index: number): T
  {
    return this.data[index];
  }

  /**
   * Get the queue's internal array storage
   * @returns Array holding all queue elements
   */
  public getQueue(): T[]
  {
    return this.data;
  }
};