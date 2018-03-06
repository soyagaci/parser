import { AncestorRecord, DeathStatus, Gender, PersonRecord } from '@soyagaci/models';
import { parseTurkishDate } from './utils';

// definition of each header columns for html/pdf/text tables.
export enum HeaderColumn {
    Order = 'Sıra',
    Gender = 'C',
    Relation = 'Yakınlık Derecesi',
    Name = 'Adı',
    LastName = 'Soyadı',
    FathersName = 'Baba Adı',
    MothersName = 'Ana Adı',
    BirthPlaceAndDate = 'Doğum Yeri ve Tarihi',
    BirthAddress = 'İl-İlçe-Mahalle/Köy',
    CitHaneSiraNo = 'Cilt-Hane-Birey Sıra No',
    MarriageStatus = 'Medeni Hali',
    DeathStatus = 'Durumu',
}

/**
 * tries to find the given string in the headers. if its a valid header title, returns the matching header.
 * @param {string} str
 * @return {HeaderColumn}
 */
export function findHeaderColumn(str: string): HeaderColumn {
    const keys = Object.keys(HeaderColumn);
    return keys.map((k) => HeaderColumn[k]).find((x) => x === str);
}

export class RecordParseResult {
    constructor(
        // sucessfully parsed ancestor record items
        readonly records: AncestorRecord[],
        // rows that could not be parsed correctly and the error
        readonly errors: Array<[Error, string[]]>,
    ) {
        //
    }
}

// the pair of header and which row column the data for that column is in
export type HeaderColumnIndexPair = [HeaderColumn, number];

/**
 * Parses the order into an integer.
 * @param {string} str
 * @return {number}
 */
export function parseOrder(str: string): number {
    return parseInt(str, 10);
}

/**
 * Parses the gender string into the Gender enum.
 * @param {string} str
 * @return {Gender}
 */
export function parseGender(str: string): Gender {
    switch (str) {
        case 'E': return Gender.Male;
        case 'K': return Gender.Female;
        default: throw new Error('invalid gender for the row');
    }
}

/**
 * Converts the long relation into a simpler to use format, where each of the letters define a relation in the
 * mother's or father's side. For example:
 * Annesinin Annesi -> AA which essentially means relative to our user, this person is his mother's mother
 * Babasının Annessinin Babası -> BAB which means our user's Father's Mother's Father
 * Kızı -> P
 * Kendisi -> Kendisi
 * Oğlu -> O
 * the K means the record belongs to the start of the ancestor record.
 * Possible values: [ABOP]+ or K
 * @param {string} str
 * @return {string}
 */
export function parseRelation(str: string): string {
    if(!str || str.constructor !== String) throw new Error('invalid input');
    // If the relation is to him/herself, return K
    if(str.trim().startsWith('Kendi')) return 'K';
    // Otherwise only get the uppercase letters.
    const relation = str.replace(/[^ABKO]+/g, '');
    if(relation.length <= 0) throw new Error('invalid relation between user and ancestor');
    // Replace Kızı and other K's with P
    return relation.replace(/K/g, 'P');
}

/**
 * Trims the spaces and dashes from the given string. And returns undefined if its not valid. A custom trim function.
 * @param {string} str
 * @return {string}
 */
export function trimSpacesAndDash(str: string): string {
    if(!str || str.constructor !== String) return undefined;
    const value = str.trim();

    if(!value || value === '-') return undefined;
    return value;
}

/**
 * Parses the birth place and date from the given string.
 * Expects them to be sepeareted by \n and there is only one new line.
 * The date is in the Turkish day/month/year format. The resulting Date object is UTC.
 * For example:
 * Ordu
 * 01/01/1979
 * @param {string} str
 * @return {[string , Date]}
 */
export function parseBirthPlaceAndDate(str: string): [string, Date] {
    if(!str || str.constructor !== String) throw new Error('invalid input');
    const split = str.split('\n');
    if(split.length !== 2) throw new Error('birthplace and date is invalid. should have 2 lines.');
    let date = parseTurkishDate(split[1].trim());

    date = !date || isNaN(date.getTime()) ? undefined : date;
    if(!date) throw new Error('ancestor record without birthYear is unacceptable');
    return [split[0].trim(), date];
}

/**
 * Parses the death status from the given string. And returns an enum describing the state and the date of death if
 * its present. The date maybe undefined or valid in the case of some DeathStatus.Dead.
 * The date is in the Turkish day/month/year format. The resulting Date object is UTC.
 * For example:
 * Ölüm
 * 01/01/1979
 * @param {string} str
 * @return {[string , Date]}
 */
export function parseDeathStatus(str: string): [DeathStatus, Date] {
    if(!str || str.constructor !== String) throw new Error('invalid input as death status');
    const split = str.split('\n');
    if(split.length < 2) throw new Error('not enough lines to parse death status');
    if(split[0].trim() !== 'Ölüm') return [ DeathStatus.Alive, undefined ];
    let date = parseTurkishDate(split[1].trim());

    date = !date || isNaN(date.getTime()) ? undefined : date;
    return [ DeathStatus.Dead, date ];
}

/**
 * Parses id information regarding the order of registration of the person's into the family.
 * Three variables in order are:
 * - the book number the family is registered to
 * - the order of the family in the book
 * - the order of the person in the family
 * @param {string} str
 * @return {[number , number , number]}
 */
export function parseCiltHaneSiraNo(str: string): [number, number, number] {
    if(!str || str.constructor !== String) throw new Error('invalid input');
    const match = str.trim().match(/^([0-9]+)-([0-9]+)-([0-9]+)$/);
    if(!match || match.length !== 4) throw new Error('invalid cilt hane sira no tri');

    return [ parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10) ];
}

/**
 * Returns the birth address from the given string. Strips new lines and returns a one line address.
 * @param {string} str
 * @return {string}
 */
export function parseBirthAddress(str: string): string {
    const trimmed = trimSpacesAndDash(str);
    if(!trimmed) return trimmed;
    const replaced = trimmed.replace(/(?:\r\n|\r|\n)/g, '').trim();
    return replaced ? replaced : undefined;
}

// which parser function to use for the given column
const columnToParser = {
    [HeaderColumn.Order]: parseOrder,
    [HeaderColumn.Gender]: parseGender,
    [HeaderColumn.Relation]: parseRelation,
    [HeaderColumn.Name]: trimSpacesAndDash,
    [HeaderColumn.LastName]: trimSpacesAndDash,
    [HeaderColumn.FathersName]: trimSpacesAndDash,
    [HeaderColumn.MothersName]: trimSpacesAndDash,
    [HeaderColumn.MarriageStatus]: trimSpacesAndDash,
    [HeaderColumn.BirthAddress]: parseBirthAddress,
    [HeaderColumn.BirthPlaceAndDate]: parseBirthPlaceAndDate,
    [HeaderColumn.DeathStatus]: parseDeathStatus,
    [HeaderColumn.CitHaneSiraNo]: parseCiltHaneSiraNo,
};

// which field to output the parser result when parsing a row.
const columnToField = {
    [HeaderColumn.Order]: 'order',
    [HeaderColumn.Gender]: 'gender',
    [HeaderColumn.Relation]: 'relation',
    [HeaderColumn.Name]: 'name',
    [HeaderColumn.LastName]: 'lastName',
    [HeaderColumn.FathersName]: 'fathersName',
    [HeaderColumn.MothersName]: 'mothersName',
    [HeaderColumn.MarriageStatus]: 'marriageStatus',
    [HeaderColumn.BirthAddress]: 'birthNeighbourhood',
    [HeaderColumn.BirthPlaceAndDate]: 'birthPlaceAndDate',
    [HeaderColumn.DeathStatus]: 'status',
    [HeaderColumn.CitHaneSiraNo]: 'ciltHaneSiraNo',
};

/**
 * Given a list of columns, and a function that helps accessing to column data for any given column,
 * parses an ancestor record
 * @param {HeaderColumn[]} columns the columns to use when doing the parsing
 * @param {(column: HeaderColumn) => string} columnTextGetter the accessor function for the row data
 * @return {AncestorRecord}
 */
export function parseRecordWithHeaders(
    columns: HeaderColumn[],
    columnTextGetter: (column: HeaderColumn) => string,
): AncestorRecord {
    const record = columns.reduce((result, column) => {
        const parser = columnToParser[column];
        const field = columnToField[column];

        if(!parser || !field) throw new Error(`could not found parse or field for column ${column}`);
        // get column data for the given header column, and parse it with the found parser.
        const value = parser(columnTextGetter(column));

        // add the result value if there is any to the result object.
        if(value) result[field] = value;
        return result;
    }, {});

    /* tslint:disable:no-string-literal */
    // we will put the relation out of the person record
    const relation = record['relation'];
    delete record['relation'];

    // rename the parsed results into person record fields
    const [ birthPlace, birthYear ] = record['birthPlaceAndDate'];
    const [ ciltNo, haneNo, siraNo ] = record['ciltHaneSiraNo'];
    const [ deathStatus, dateOfDeath ]  = record['status'];
    /* tslint:enable:no-string-literal */

    // create a person record
    const person = [
        'order', 'gender', 'name', 'lastName',
        'fathersName', 'mothersName', 'marriageStatus',
        'birthNeighbourhood', 'dateOfDeath',
    ].reduce((acc, key) => {
        if(record[key])
            acc[key] = record[key];

        return acc;
    }, {
        birthPlace, birthYear, ciltNo, dateOfDeath, deathStatus, haneNo, siraNo,
    });

    return { relation, record: person as PersonRecord };
}

/**
 * Given a 2d matrix of string, which represents rows of data, and a list of header/column index pair, does the
 * hard job of parsing each row into AncestorRecord. Keeps both the successful parsing results and the failed ones.
 * @param {string[][]} rows the columns of data in rows.
 * @param {HeaderColumnIndexPair[]} headers the headers and which row/columns that we will look to get their data.
 * @return {RecordParseResult}
 */
export function parseRecords(rows: string[][], headers: HeaderColumnIndexPair[]): RecordParseResult {
    // get only the columns from the pairs
    const columns = headers.map(([column]) => column);
    // create a column to row index mapping HeaderColumn -> number
    const headerMap = headers.reduce((acc, [column, idx]) => {
        acc[column] = idx;
        return acc;
    }, {});

    // for each row, try to parse it
    return rows.reduce((acc, cells) => {
        // Invalid cell length for the row.
        if(cells.length < headers.length) {
            acc.errors.push([ new Error('invalid cell length for row, compared to headers.'), cells ]);
            return acc;
        }

        try {
            // a function that lets the parseRecordWithHeaders access to this rows column data.
            // you give it a column, and it gives you the associated data in the row by looking up the
            // header column index pair list.
            const columnTextGetter = (column) => cells[headerMap[column]].trim();
            const record = parseRecordWithHeaders(columns, columnTextGetter);

            acc.records.push(record);
        } catch(ex) {
            acc.errors.push([ ex, cells ]);
        }

        return acc;
    }, { records: [], errors: [] });
}

/**
 * Given two different record parse results, merges them into one.
 * @param {RecordParseResult} acc
 * @param {RecordParseResult} parseResult
 * @return {RecordParseResult}
 */
export function mergeRecordParseResults(acc: RecordParseResult, parseResult: RecordParseResult): RecordParseResult {
    Array.prototype.push.apply(acc.records, parseResult.records);
    Array.prototype.push.apply(acc.errors, parseResult.errors);
    return acc;
}
