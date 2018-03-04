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

/**
 * Given a html string, extracts the result table out of it.
 * @param {string} htmlStr the html to parse and search
 * @return {Promise<HTMLTableElement>} the table that contains the headers and the data
 */
export function getResultTable(htmlStr: string) : Promise<HTMLTableElement> {
    return new Promise((resolve, reject) => {
        const dom = createElement(htmlStr);
        const table = dom.querySelector('.resultTable');

        if(table)
            resolve(table as HTMLTableElement);
        else
            reject(new Error('could not found result table in the html'));
    });
}

/**
 * Given a html collection of row elements, converts them to js array.
 * @param {HTMLCollectionOf<HTMLTableRowElement>} rows the html element list
 * @return {HTMLTableRowElement[]}
 */
function rowCollectionToArray(rows: HTMLCollectionOf<HTMLTableRowElement>) : HTMLTableRowElement[] {
    return [...new Array(rows.length)].map((_, i) => rows.item(i));
}

/**
 * Given a html collection of data or header cell elements, converts them to js array.
 * @param {HTMLCollectionOf<HTMLTableDataCellElement | HTMLTableHeaderCellElement>} cells the html cell list.
 * @return {(HTMLTableDataCellElement | HTMLTableHeaderCellElement)[]}
 */
function cellCollectionToArray(
    cells: HTMLCollectionOf<HTMLTableDataCellElement | HTMLTableHeaderCellElement>
) : (HTMLTableDataCellElement | HTMLTableHeaderCellElement)[] {
    return [...new Array(cells.length)].map((_, i) => cells.item(i));
}

/**
 * Parses the headers out of the given table. For each of the found header columns, it also gets the which column
 * the header was found at. To extract data for that row from the same column in the data rows.
 * @param {HTMLTableElement} table the html table to get the headers from.
 * @return {HeaderColumnIndexPair[]}
 */
export function parseHeaders(table: HTMLTableElement) : HeaderColumnIndexPair[]{
    const thead = table.tHead;
    if(thead.rows.length != 1) throw new Error('thead row size does not match one');
    const cells = cellCollectionToArray(thead.rows.item(0).cells);

    // match the column header text with our parsers, if found, add it to our headers list.
    const headers = cells.reduce((headers, cell, i) => {
        const cellText = cell.innerHTML.trim();
        const header = findHeaderColumn(cellText);

        if(header) headers.push([header, i]);
        return headers;
    }, []);

    // abort in case the html doesn't contain all of the headers.
    if(headers.length != Object.keys(HeaderColumn).length)
        throw new Error('not all headers were found in the tables header section');

    return headers as HeaderColumnIndexPair[];
}

/**
 * Given a html table, converts it into a 2d matrix of strings, where rows and columns represents the data.
 * The data is extracted out of tbody.
 * @param {HTMLTableElement} table the html table to extract data from.
 * @return {string[][]}
 */
export function parseTableToStringMatrix(table: HTMLTableElement) : string[][] {
    const tbodies = table.tBodies;
    if(tbodies.length != 1) throw new Error('there should be only one tbody');
    const rows = rowCollectionToArray(tbodies.item(0).rows);

    // Replace <br> with \n to be comptaible with generic record parser.
    return rows.map(row => cellCollectionToArray(row.cells).map(cell => cell.innerHTML.replace(/\<br\>/g, '\n')));
}

/**
 * Given a table and the header/column index pair, extracts data out of the table's tbody, and tries to parse them
 * with the given header info. The rows are passed to the generic parser with the given headers.
 * @param {HTMLTableElement} table
 * @param {HeaderColumnIndexPair[]} headers
 * @return {RecordParseResult}
 */
export function parseTableRecords(table: HTMLTableElement, headers: HeaderColumnIndexPair[]) : RecordParseResult {
    return parseRecords(parseTableToStringMatrix(table), headers);
}


/**
 * Parse and extract ancestor data from the given html string. The .resultTable is parsed to get the headers and rows of data
 * then additional parsing is applied to get results in the AncestorRecord model.
 * @param {string} htmlStr the html string to extract data from.
 * @return {Promise<RecordParseResult>}
 * @constructor
 */
export default async function HTMLParser(htmlStr: string) : Promise<RecordParseResult> {
    const table = await getResultTable(htmlStr);
    const headers = parseHeaders(table);
    return parseTableRecords(table, headers);
};
