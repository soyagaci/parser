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
    constructor(
        // order of the person in the records.
        readonly order: number,
        // gender of the person this record belongs to
        readonly gender: Gender,
        readonly name: string,
        // person's father's name
        readonly fathersName: string,
        // person's mother's name
        readonly mothersName: string,
        // the city/district the person was born in
        readonly birthPlace: string,
        // birth year of the person
        readonly birthYear: Date,
        // the whole address of the neighbourhood of person's birth (kütük)
        readonly birthNeighbourhood: string,
        // cilt no of the person, describing the book number the family is registered to
        readonly ciltNo: number,
        // hane no of the person, describing the which lastName/family the person belongs to in the cilt (book)
        readonly haneNo: number,
        // sıra no of the person, describing in which order the person was registered to the family
        readonly siraNo: number,
        // marriage status for the person.
        readonly marriageStatus: string,
        // wether the person is dead or alive
        readonly deathStatus: DeathStatus,
        // optional last name parameter
        readonly lastName?: string,
        // date of death for the person.
        readonly dateOfDeath?: Date,
    ) {
        //
    }
}

export class AncestorRecord {
    constructor(
        // a string that defines a relation relative to the starting person to this record.
        // for example: ABA -> Annesinin Babasının Annesi -> The Mother of the Father of the person's Mother...
        readonly relation: string,
        // person record for the ancestor.
        readonly record: PersonRecord,
    ) {
        //
    }
}

export class RelationalAncestorRecord {
    constructor(
        readonly person: PersonRecord,
        readonly relations: { [t in RelationType]: number[]; },
    ) {
       //
    }
}

export type RelationalAncestorRecords = RelationalAncestorRecord[];
