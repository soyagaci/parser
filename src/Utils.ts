export function parseTurkishDate(str: string) : Date{
    const split = str.split("/");
    return new Date(Date.UTC(parseInt(split[2], 10), parseInt(split[1], 10) - 1, parseInt(split[0], 10)));
}
