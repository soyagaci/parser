let createElement: (str: string) => HTMLElement;
import { AncestorRecord } from './Models';
import {HeaderColumn, parseRecordWithHeaders} from './RecordParse';

// try to require dom if we are not running inside browser
if(typeof window === 'undefined'){
    const { JSDOM } = require('jsdom');

    // create element with the jsdom library
    createElement = function(str: string){
        const dom = new JSDOM(str);

        return dom.window.document;
    };
}else{
    // create element with the browser dom
    createElement = function(str: string){
        const elem = document.createElement( 'html' );
        elem.innerHTML = str;

        return elem;
    };
}

export function getResultTable(htmlStr: string) : Promise<HTMLTableElement> {
    return new Promise((resolve) => {
        const dom = createElement(htmlStr);
        const table = dom.querySelector('.resultTable');

        resolve(table as HTMLTableElement);
    });
}

class RecordParseResult {
    records: AncestorRecord[];
    errors: [Error, HTMLTableRowElement][];
}

type HeaderColumnIndexPair = [HeaderColumn, number];

function isHeaderColumn(str: string) : boolean {
    return Object.keys(HeaderColumn).map(k => HeaderColumn[k]).indexOf(str) !== -1;
}

function rowCollectionToArray(rows: HTMLCollectionOf<HTMLTableRowElement>) : HTMLTableRowElement[] {
    return [...new Array(rows.length)].map((_, i) => rows.item(i));
}

function cellCollectionToArray(
    cells: HTMLCollectionOf<HTMLTableDataCellElement | HTMLTableHeaderCellElement>
) : (HTMLTableDataCellElement | HTMLTableHeaderCellElement)[] {
    return [...new Array(cells.length)].map((_, i) => cells.item(i));
}

export function parseHeaders(table: HTMLTableElement) : HeaderColumnIndexPair[]{
    const thead = table.tHead;
    if(thead.rows.length != 1) throw new Error('thead row size does not match one');
    const cells = cellCollectionToArray(thead.rows.item(0).cells);

    const headers = cells.map((cell, i) => {
        const cellText = cell.innerHTML.trim();

        return isHeaderColumn(cellText) ? [cellText as HeaderColumn, i] : undefined;
    }).filter(x => x);

    if(headers.length != Object.keys(HeaderColumn).length)
        throw new Error('not all headers were found in the tables header section');

    return headers as HeaderColumnIndexPair[];
}

export function parseRecords(table: HTMLTableElement, headers: HeaderColumnIndexPair[]) : RecordParseResult {
    const tbodies = table.tBodies;
    if(tbodies.length != 1) throw new Error('there should be only one tbody');
    const rows = rowCollectionToArray(tbodies.item(0).rows);
    const columns = headers.map(([column]) => column);
    const headerMap = headers.reduce((acc, [column, idx]) => {
        acc[column] = idx;
        return acc;
    }, {});

    return rows.reduce((acc, row) => {
        const cells = row.cells;
        // Invalid cell length for the row.
        if(cells.length !== headers.length){
            acc.errors.push([ new Error('invalid cell length for row, compared to headers.'), row ]);
            return acc;
        }

        try{
            const columnTextGetter = (column) => cells.item(headerMap[column]).innerHTML.trim();
            const record = parseRecordWithHeaders(columns, columnTextGetter);

            acc.records.push(record);
        }catch(ex){
            acc.errors.push([ ex, row ]);
        }

        return acc;
    }, { records: [], errors: [] });
}

export default async function HTMLParser(htmlStr: string) {
    const table = await getResultTable(htmlStr);
    const headers = parseHeaders(table);
    const records = parseRecords(table, headers);

    return [];
};
