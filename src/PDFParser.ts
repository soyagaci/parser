import {findHeaderColumn, HeaderColumn, HeaderColumnIndexPair, parseRecords, RecordParseResult} from "./RecordParse";

declare var PDFJS: any;

// Try to require PDFJS if its not globally defined.
if(typeof PDFJS === 'undefined') PDFJS = require('pdfjs-dist');

class ColumnWidth{
    start: number;
    end: number;
    column: HeaderColumn;
}

function getCoordinates(data: object, index: number, column: HeaderColumn): ColumnWidth {
    const items = data['items'];
    // helper function for retrieving coordinates
    return {
        start: items[index]["transform"][4],
        end: items[index]["transform"][4] + items[index]["width"],
        column
    };
}

function checkInColumn(columns: ColumnWidth[], columnIndex: number, xStart: number, xEnd: number) : boolean {
    const previousColumn = columns[columnIndex - 1];
    const nextColumn = columns[columnIndex + 1];
    const columnStart = previousColumn ? previousColumn.end : 0;
    const columnEnd = nextColumn ? nextColumn.start : Number.MAX_VALUE;

    return xStart > columnStart && xEnd < columnEnd;
}

function process(data: any) : [string[][], HeaderColumnIndexPair[]]{
    let tableCoordinates : ColumnWidth[] = [];
    let kinshipDict: object = {};
    let i: number = 0;
    const items = data['items'];

    // find the coordinates of the headers in format of {"header": [x1, x2], ...}
    while (i < items.length) {
        const item = items[i];

        if (item["str"] === HeaderColumn.Order) {
            tableCoordinates = [
                getCoordinates(data, i, HeaderColumn.Order),
                getCoordinates(data, i + 1, HeaderColumn.Gender),
                getCoordinates(data, i + 2, HeaderColumn.Relation),
                getCoordinates(data, i + 3, HeaderColumn.Name),
                getCoordinates(data, i + 4, HeaderColumn.LastName),
                getCoordinates(data, i + 5, HeaderColumn.FathersName),
                getCoordinates(data, i + 6, HeaderColumn.MothersName),
                getCoordinates(data, i + 7, HeaderColumn.BirthPlaceAndDate),
                getCoordinates(data, i + 9, HeaderColumn.BirthAddress),
                getCoordinates(data, i + 10, HeaderColumn.CitHaneSiraNo),
                getCoordinates(data, i + 12, HeaderColumn.MarriageStatus),
                getCoordinates(data, i + 14, HeaderColumn.DeathStatus),
            ];

            i += 15;
            break;
        }
        i++;
    }

    // create the kinship dictionary
    let person: string;
    let columnIndex = 0;
    let currentRecord = [];
    const records = [];

    function finishRow(){
        currentRecord = [];
        columnIndex = 0;
    }

    while (i < items.length) {
        const item = items[i];
        const xStart = item['transform'][4];
        const xEnd = xStart + item['width'];
        const inCurrentColumn = checkInColumn(tableCoordinates, columnIndex, xStart, xEnd);
        const inNextColumn = checkInColumn(tableCoordinates, columnIndex + 1, xStart, xEnd);

        if(inCurrentColumn){
            if(item['str'].trim()) {
                if (!currentRecord[columnIndex])
                    currentRecord[columnIndex] = item['str'];
                else
                    currentRecord[columnIndex] += '\n' + item['str'];
            }
        }else if(inNextColumn){
            columnIndex++;
            i--;
        }else if(columnIndex === tableCoordinates.length - 1){
            records.push(currentRecord);
            finishRow();

            i--;
        }else{
            // failed because the row reading has not finished yet.
            finishRow();
        }

        if(i === items.length - 1 && currentRecord.length === tableCoordinates.length){
            records.push(currentRecord);
            finishRow();
        }

        i++;
    }

    return [
        records,
        tableCoordinates.map((cw, idx) => [cw.column, idx]) as HeaderColumnIndexPair[]
    ];
}



export default async function PDFParser(data: Uint8Array) : Promise<RecordParseResult> {
    const doc = await PDFJS.getDocument(data);
    const numPages = doc.numPages;
    const results = await Promise.all(
        [ ...new Array(doc.numPages) ]
            .map(async (_, i) => {
                const page = await doc.getPage(i + 1);
                const content = await page.getTextContent();
                const [stringMatrix, headers] = process(content);

                return parseRecords(stringMatrix, headers);
            })
    );

    return results.reduce((acc, parseResult) => {
        Array.prototype.push.apply(acc.records, parseResult.records);
        Array.prototype.push.apply(acc.errors, parseResult.errors);
        return acc;
    }, { records: [], errors: [] });
};
