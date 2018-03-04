import {HeaderColumn, HeaderColumnIndexPair, parseRecords} from "./RecordParse";

function parseText(buffer: Buffer): object {
    const str: string = buffer.toString();
    const pattern: RegExp = /\d+\t(E|K)\t[ABK]/g;
    let results: string[][] = [];
    let firstMatch: any;

    // iterate through matches and add the data between them into the results array
    while((firstMatch = pattern.exec(str)) != null) {
        let start: number = firstMatch.index;
        let secondMatch: any = pattern.exec(str);
        let end: number = (secondMatch != null) ? secondMatch.index : -1;
        pattern.lastIndex = start + firstMatch[0].length;   // take one step back
        let record: string[] = str.slice(start, end).split("\t");
        results.push(record);
    }

    let HeaderColumnIndexPairs: HeaderColumnIndexPair[] = [
        [HeaderColumn.Order, 0],
        [HeaderColumn.Gender, 1],
        [HeaderColumn.Relation, 2],
        [HeaderColumn.Name, 3],
        [HeaderColumn.LastName, 4],
        [HeaderColumn.FathersName, 5],
        [HeaderColumn.MothersName, 6],
        [HeaderColumn.MarriageStatus, 10],
        [HeaderColumn.BirthAddress, 8],
        [HeaderColumn.BirthPlaceAndDate, 7],
        [HeaderColumn.DeathStatus, 11],
        [HeaderColumn.CitHaneSiraNo, 9]
    ];

    return parseRecords(results, HeaderColumnIndexPairs);
}


export default function TextParser(buffer: Buffer): any[] {
    parseText(buffer);
    return [];
};
