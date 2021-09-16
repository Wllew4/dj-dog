export async function waitForMs(ms: number)
{
    await new Promise( f => setTimeout(f, ms))
}