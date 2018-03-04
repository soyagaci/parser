import {HeaderColumn, HeaderColumnIndexPair, parseRecords, RecordParseResult} from "./RecordParse";

function parseText(buffer: Buffer): RecordParseResult {
    const str: string = buffer.toString();
    const pattern: RegExp = /\d+\t(E|K)\t[ABK]/g;
    let results: string[][] = [];
    let currentMatch = pattern.exec(str);

    // iterate through matches and add the data between them into the results array
    while(currentMatch != null){
        let start: number = currentMatch.index;
        currentMatch = pattern.exec(str);
        let end: number = (currentMatch != null) ? currentMatch.index : -1;

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


export default function TextParser(buffer: Buffer): Promise<RecordParseResult> {
    return Promise.resolve(parseText(buffer));
};
