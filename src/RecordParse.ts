import { Gender, AncestorRecord } from "./Models";

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

export const columnToParser = {
    [HeaderColumn.Order]: parseOrder,
    [HeaderColumn.Gender]: parseGender,
};

export const columnToField = {
    [HeaderColumn.Order]: 'order',
    [HeaderColumn.Gender]: 'gender',
};

export function parseRecordWithHeaders(
    columns: HeaderColumn[],
    columnTextGetter: (column: HeaderColumn) => string
) : AncestorRecord {
    const record = columns.reduce((result, column) => {
        const parser = columnToParser[column];
        const field = columnToField[column];

        if(!parser || !field) throw new Error(`could not found parse or field for column ${column}`);

        result[field] = parser(columnTextGetter(column));
        return result;
    }, {});

    return record as AncestorRecord;
}
