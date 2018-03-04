import {
    findHeaderColumn, HeaderColumn, HeaderColumnIndexPair, mergeRecordParseResults, parseRecords,
    RecordParseResult
} from "./generic";
import {PDFDocumentProxy, TextContent, TextContentItem} from "pdfjs-dist";

declare var PDFJS: any;

function initPDFJS(){
    // Try to require PDFJS if its not globally defined.
    PDFJS = require('pdfjs-dist');
}

// lazily initialize and get pdfjs
function getPDFJS() {
    // init pdfjs if its not defined
    if (typeof PDFJS === 'undefined') initPDFJS();
    return PDFJS;
}

// A structure to hold where each of the table header texts start and finish, and which column they belong to.
class ColumnWidth{
    // the start x position of the column
    start: number;
    // the end x position of the column
    end: number;
    // which header column the pdf header belongs to in our generic parser
    column: HeaderColumn;
}

/**
 * Helper function for retrieving coordinates.
 * Given a text content item index, and a column that it relates to, creates ColumnWidth info
 * @param {object} items
 * @param {number} index
 * @param {HeaderColumn} column
 * @return {ColumnWidth}
 */
function getCoordinates(items: TextContentItem[], index: number, column: HeaderColumn): ColumnWidth {
    return {
        start: items[index].transform[4],
        end: items[index].transform[4] + items[index].width,
        column
    };
}

/**
 * Checks wether the given xStart and xEnd coordinates are between the previous column's end, and the next column's
 * start positions. Essentially telling us wether its between the boundry of the columnIndex.
 * @param {ColumnWidth[]} columns the column start and end position info
 * @param {number} columnIndex which column we are checking the inclusion for.
 * @param {number} xStart the start position of the item
 * @param {number} xEnd the end position of the item
 * @return {boolean}
 */
function checkInColumn(columns: ColumnWidth[], columnIndex: number, xStart: number, xEnd: number) : boolean {
    const previousColumn = columns[columnIndex - 1];
    const nextColumn = columns[columnIndex + 1];
    const columnStart = previousColumn ? previousColumn.end : 0;
    const columnEnd = nextColumn ? nextColumn.start : Number.MAX_VALUE;

    return xStart > columnStart && xEnd < columnEnd;
}

function parseHeaders(data: TextContent): [ColumnWidth[], number]{
    let kinshipDict: object = {};
    let i: number = 0;
    const items = data.items;

    // find the coordinates of the headers in format of {"header": [x1, x2], ...}
    while (i < items.length) {
        const item = items[i];

        // if the current item matches the HeaderColumn's first column, we got the start of the headers
        if (item["str"] === HeaderColumn.Order) {
            // assume the position of other columns with hardcoded relative positions to current item
            const columns = [
                getCoordinates(items, i, HeaderColumn.Order),
                getCoordinates(items, i + 1, HeaderColumn.Gender),
                getCoordinates(items, i + 2, HeaderColumn.Relation),
                getCoordinates(items, i + 3, HeaderColumn.Name),
                getCoordinates(items, i + 4, HeaderColumn.LastName),
                getCoordinates(items, i + 5, HeaderColumn.FathersName),
                getCoordinates(items, i + 6, HeaderColumn.MothersName),
                getCoordinates(items, i + 7, HeaderColumn.BirthPlaceAndDate),
                getCoordinates(items, i + 9, HeaderColumn.BirthAddress),
                getCoordinates(items, i + 10, HeaderColumn.CitHaneSiraNo),
                getCoordinates(items, i + 12, HeaderColumn.MarriageStatus),
                getCoordinates(items, i + 14, HeaderColumn.DeathStatus),
            ];

            // the columns we found and a position to start searching for data items
            return [columns, i + 15];
        }
        i++;
    }
}

/**
 * Given a pdf file's text content and start pos to search for data, returns a 2d matrix of strings,
 * which is compatible with the generic parser.
 * @param {TextContent} data the text content for the pdf
 * @param {ColumnWidth[]} columns is used to figure out rows of data
 * @param {number} startPos the startPos to start searching for data.
 * @return {string[][]}
 */
function parsePDFToStringMatrix(data: TextContent, columns: ColumnWidth[], startPos: number) : string[][]{
    let i = startPos;
    const items = data.items;
    // start by searching for an item thats in the boundry box of first column
    let columnIndex = 0;
    let currentRecord = [];
    const records = [];

    // restart to the starting column
    function finishRow(){
        currentRecord = [];
        columnIndex = 0;
    }

    while (i < items.length) {
        const item = items[i];
        const xStart = item.transform[4];
        const xEnd = xStart + item.width;

        if(checkInColumn(columns, columnIndex, xStart, xEnd)){ // if the item is in the current column
            // and is not an empty string...
            if(item['str'].trim()) {
                if (!currentRecord[columnIndex])
                    // set the first value of the current row's column
                    currentRecord[columnIndex] = item['str'];
                else
                    // append the item to the current row's column
                    currentRecord[columnIndex] += '\n' + item['str'];
            }
        } else if(checkInColumn(columns, columnIndex + 1, xStart, xEnd)){ // if the item is in the next column
            // this item belongs to the next column, so we increment the current column index
            // and decrement the i, so the next loop will process the item with the correct column
            columnIndex++;
            i--;
        }else if(columnIndex === columns.length - 1){ // if not in both columns, but the row reading has finished...
            // we commit the accumulated record into the result array, and reset the row reading
            records.push(currentRecord);
            finishRow();
            // this column needs to be re-processed
            i--;
        }else{ // not in current or next column, the row reading has not finished
            // so we just abondon the current row
            finishRow();
        }

        // if the items are finished, but the last row has not been commited
        if(i === items.length - 1 && currentRecord.length === columns.length){
            // we commit the acummulated record and finish the row...
            records.push(currentRecord);
            finishRow();
        }

        i++;
    }

    return records;
}

/**
 * Given a pdf document and a page number, only parses the given page and nothing else.
 * @param {PDFDocumentProxy} doc
 * @param {number} pageNum
 * @return {Promise<RecordParseResult>}
 */
export async function parseSinglePage(doc: PDFDocumentProxy, pageNum: number) : Promise<RecordParseResult>{
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const [columns, startPos] = parseHeaders(content);
    const stringMatrix = parsePDFToStringMatrix(content, columns, startPos);
    const headers = columns.map((cw, idx) => [cw.column, idx]) as HeaderColumnIndexPair[];

    return parseRecords(stringMatrix, headers);
}

/**
 * Given a byte array of a pdf document, parses it into an ancestor record listing.
 * @param {Uint8Array} data
 * @return {Promise<RecordParseResult>}
 * @constructor
 */
export async function PDFParser(data: Uint8Array) : Promise<RecordParseResult> {
    const doc = await getPDFJS().getDocument(data);
    const numPages = doc.numPages;
    // for each page, run the parseSinglePage in async, wait for all of them to finish
    const results = await Promise.all(
        [ ...new Array(doc.numPages) ]
            .map(async (_, i) => parseSinglePage(doc, i + 1))
    );

    // merge all page results into one.
    return results.reduce(mergeRecordParseResults, { records: [], errors: [] });
}

export default PDFParser;
