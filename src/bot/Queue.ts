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

    private data: T[] = [];
};