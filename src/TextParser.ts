import {HeaderColumn, HeaderColumnIndexPair, parseRecords} from "./RecordParse";

function parseText(buffer: Buffer): object {
    const str: string = buffer.toString();
    const pattern: RegExp = /\d+\t(E|K)\t[ABK]/g;
    let results: string[][] = [];
    let indexes: number[] = [];
    let match: any;
    let headerColumn = HeaderColumn;

    // collect the indexes of matches
    while((match = pattern.exec(str)) != null) {
        indexes.push(match.index);
    }
    // add index of the string which indicates text's end as last index to the indexes list
    let endIndex = str.indexOf("AÇIKLAMALAR");
    indexes.push(endIndex);

    // loop through "indexes" array and push results to the "results" array
    for(let i: number = 0; i < indexes.length - 1; i++) {
        let record: string[] = str.slice(indexes[i], indexes[i + 1]).split("\t");
        results.push(record);
    }

    let headerColumnIndexPairs: HeaderColumnIndexPair[] = [
        [headerColumn.Order, 0],
        [headerColumn.Gender, 1],
        [headerColumn.Relation, 2],
        [headerColumn.Name, 3],
        [headerColumn.LastName, 4],
        [headerColumn.FathersName, 5],
        [headerColumn.MothersName, 6],
        [headerColumn.MarriageStatus, 10],
        [headerColumn.BirthAddress, 8],
        [headerColumn.BirthPlaceAndDate, 7],
        [headerColumn.DeathStatus, 11],
        [headerColumn.CitHaneSiraNo, 9]
    ];
    return parseRecords(results, headerColumnIndexPairs);
}


export default function TextParser(buffer: Buffer): any[] {
    parseText(buffer);
    return [];
};
