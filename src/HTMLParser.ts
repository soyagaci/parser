let createElement: (str: string) => HTMLElement;
import {
    HeaderColumn, HeaderColumnIndexPair, findHeaderColumn, parseRecords,
    RecordParseResult
} from './RecordParse';

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

    const headers = cells.reduce((headers, cell, i) => {
        const cellText = cell.innerHTML.trim();
        const header = findHeaderColumn(cellText);

        if(header) headers.push([header, i]);
        return headers;
    }, []);

    if(headers.length != Object.keys(HeaderColumn).length)
        throw new Error('not all headers were found in the tables header section');

    return headers as HeaderColumnIndexPair[];
}

export function parseTableToStringMatrix(table: HTMLTableElement) : string[][] {
    const tbodies = table.tBodies;
    if(tbodies.length != 1) throw new Error('there should be only one tbody');
    const rows = rowCollectionToArray(tbodies.item(0).rows);

    return rows.map(row => cellCollectionToArray(row.cells).map(cell => cell.innerHTML));
}

export function parseTableRecords(table: HTMLTableElement, headers: HeaderColumnIndexPair[]) : RecordParseResult {
    return parseRecords(parseTableToStringMatrix(table), headers);
}


export default async function HTMLParser(htmlStr: string) {
    const table = await getResultTable(htmlStr);
    const headers = parseHeaders(table);
    const records = parseTableRecords(table, headers);

    return [];
};
