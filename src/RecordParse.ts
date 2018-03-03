import {Gender, AncestorRecord, PersonRecord} from "./Models";
import { parseTurkishDate } from "./Utils";

export enum HeaderColumn{
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

export function findHeaderColumn(str: string) : HeaderColumn {
    const keys = Object.keys(HeaderColumn);
    return keys.map(k => HeaderColumn[k]).find(x => x == str);
}

export class RecordParseResult {
    records: AncestorRecord[];
    errors: [Error, string[]][];
}

export type HeaderColumnIndexPair = [HeaderColumn, number];

function parseOrder(str: string) : number {
    return parseInt(str);
}

function parseGender(str: string) : Gender {
    switch(str){
        case 'E':
            return Gender.Male;
        case 'K':
            return Gender.Female;
        default:
            throw new Error('invalid gender for the row');
    }
}

function parseRelation(str: string) : string {
    const relation = str.replace(/[^ABK]+/g, '');
    if(relation.length <= 0) throw new Error('invalid relation between user and ancestor');
    return relation;
}

function trimSpacesAndDash(str: string) : string {
    const value = str.trim();

    if(!value || value === '-') return undefined;
    return value;
}

function parseBirthPlaceAndDate(str: string) : [string, Date] {
    const split = str.split('<br>');
    if(split.length != 2) throw new Error('birthplace and date is invalid. should have 2 lines.');
    return [split[0].trim(), parseTurkishDate(split[1].trim())];
}

function parseDeathStatus(str: string) : Date {
    const split = str.split('<br>');
    if(split.length != 2) return undefined;
    if(split[0].trim() != 'Ölüm') return undefined;
    return parseTurkishDate(split[1].trim());
}

function parseCiltHaneSiraNo(str: string) : [number, number, number] {
    const match = str.trim().match(/^([0-9]+)-([0-9]+)-([0-9]+)$/);
    if(!match || match.length != 4) throw new Error('invalid cilt hane sira no tri.');

    return [ parseInt(match[1]), parseInt(match[2]), parseInt(match[3]) ];
}

function parseBirthAddress(str: string) : string {
    return trimSpacesAndDash(str).replace(/\<br\>/g, '');
}

export const columnToParser = {
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

export const columnToField = {
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
    [HeaderColumn.DeathStatus]: 'dateOfDeath',
    [HeaderColumn.CitHaneSiraNo]: 'ciltHaneSiraNo',
};

export function parseRecordWithHeaders(
    columns: HeaderColumn[],
    columnTextGetter: (column: HeaderColumn) => string
) : AncestorRecord {
    const record = columns.reduce((result, column) => {
        const parser = columnToParser[column];
        const field = columnToField[column];

        if(!parser || !field) throw new Error(`could not found parse or field for column ${column}`);
        const value = parser(columnTextGetter(column));

        if(value) result[field] = value;
        return result;
    }, {});

    const relation = record['relation'];
    delete record['relation'];

    const [ birthPlace, birthYear ] = record['birthPlaceAndDate'];
    const [ ciltNo, haneNo, siraNo ] = record['ciltHaneSiraNo'];
    const person = [
        'order', 'gender', 'name', 'lastName',
        'fathersName', 'mothersName', 'marriageStatus',
        'birthNeighbourhood', 'dateOfDeath'
    ].reduce((acc, key) => {
        if(record[key])
            acc[key] = record[key];

        return acc;
    }, {
        birthPlace, birthYear, ciltNo, haneNo, siraNo
    });


    return { relation, record: person as PersonRecord };
}

export function parseRecords(rows: string[][], headers: HeaderColumnIndexPair[]) : RecordParseResult {
    const columns = headers.map(([column]) => column);
    const headerMap = headers.reduce((acc, [column, idx]) => {
        acc[column] = idx;
        return acc;
    }, {});

    return rows.reduce((acc, cells) => {
        // Invalid cell length for the row.
        if(cells.length !== headers.length){
            acc.errors.push([ new Error('invalid cell length for row, compared to headers.'), cells ]);
            return acc;
        }

        try{
            const columnTextGetter = (column) => cells[headerMap[column]].trim();
            const record = parseRecordWithHeaders(columns, columnTextGetter);

            acc.records.push(record);
        }catch(ex){
            acc.errors.push([ ex, cells ]);
        }

        return acc;
    }, { records: [], errors: [] });
}
