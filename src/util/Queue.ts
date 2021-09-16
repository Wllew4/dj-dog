export class Queue<T>
{
    public add(item: T)
    {
        this.data.push(item);
    }

    public get(): T | undefined
    {
        return this.data.shift();
    }

    public length(): number
    {
        return this.data.length;
    }

    public at(index: number): T
    {
        return this.data[index];
    }

    public getQueue(): T[]
    {
        return this.data;
    }

    private data: T[] = [];
};