export enum Gender {
    Female = 'K',
    Male = 'E',
}

export enum DeathStatus {
    Alive = 'Sağ',
    Dead = 'Ölüm',
}

// mother of, father of, child to mother, child to father relation types.
export type RelationType = 'MO' | 'FO' | 'CTM' | 'CTF';

export class PersonRecord {
    // order of the person in the records.
    order: number;
    // gender of the person this record belongs to
    gender: Gender;
    name: string;
    lastName?: string;
    // person's father's name
    fathersName: string;
    // person's mother's name
    mothersName: string;
    // the city/district the person was born in
    birthPlace: string;
    // birth year of the person
    birthYear: Date;
    // the whole address of the neighbourhood of person's birth (kütük)
    birthNeighbourhood: string;
    // cilt no of the person, describing the book number the family is registered to
    ciltNo: number;
    // hane no of the person, describing the which lastName/family the person belongs to in the cilt (book)
    haneNo: number;
    // sıra no of the person, describing in which order the person was registered to the family
    siraNo: number;
    // marriage status for the person.
    marriageStatus: string;
    // wether the person is dead or alive
    deathStatus: DeathStatus;
    // date of death for the person.
    dateOfDeath?: Date;
}

export class AncestorRecord {
    // a string that defines a relation relative to the starting person to this record.
    // for example: ABA -> Annesinin Babasının Annesi -> The Mother of the Father of the person's Mother...
    relation: string;
    // person record for the ancestor.
    record: PersonRecord;
}

export class RelationalAncestorRecord {
    person: PersonRecord;
    relations: { [t in RelationType]: number[]; }
}

export type RelationalAncestorRecords = RelationalAncestorRecord[];
