/**
 * Generic class for handling FIFO queues
 */
export default class Queue<T>
{
	private data: T[] = [];

	/**
	 * Add a non-null item to the queue
	 * @param item item to add to queue
	 */
	public add(item: T)
	{
		// Dont add null items
		if(item != null)
			this.data.push(item);
	}

	/**
	 * Removes and returns the first element of queue,
	 * shifts all other elements down
	 * @returns the front of the queue
	 */
	public advance(): T | undefined
	{
		return this.data.shift();
	}

	/**
	 * Remove an item from the Queue
	 * @param i the index to remove
	 * @returns the value removed
	 */
	public remove(i: number): T
	{
		let out = this.data[i];
		this.data.splice(i, 1);
		return out;
	}

	/**
	 * @returns true if this queue is empty
	 */
	public isEmpty(): boolean
	{
		return this.data.length == 0;
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