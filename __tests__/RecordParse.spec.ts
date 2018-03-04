import { DeathStatus } from '@soyagaci/models';
import {
    parseBirthAddress, parseBirthPlaceAndDate, parseCiltHaneSiraNo, parseDeathStatus, trimSpacesAndDash,
} from '../lib/generic';

describe('RecordParse spec', () => {

    describe('parseBirthAddress function', () => {
        it('should strip all new lines', () => {
            const f = parseBirthAddress;

            expect(f('a\n\nb\nc\r\d')).toEqual('abcd');
            expect(f('-\na')).toEqual('-a');
            expect(f('\n')).toBe(undefined);
        });
    });

    describe('trimSpacesAndDashes function', () => {
        it('should return undefined if there is only dash left', () => {
            const f = trimSpacesAndDash;

            expect(f(undefined)).toBe(undefined);
            expect(f(' -')).toBe(undefined);
            expect(f('- ')).toBe(undefined);
            expect(f('  -  ')).toBe(undefined);
            expect(f(' -a')).toEqual('-a');
        });
    });

    describe('parseCiltHaneSiraNo function', () => {
        const f = parseCiltHaneSiraNo;

        it('should work for valid cilt hane sira nos', () => {
            expect(f('1-2-3')).toEqual([1, 2, 3]);
            expect(f('01-2-03')).toEqual([1, 2, 3]);
            expect(f('734-42-9999')).toEqual([734, 42, 9999]);
        });
        it('should throw for invalid cilt hane sira nos', () => {
            expect(() => f(undefined)).toThrow('invalid input');
            expect(() => f('asd')).toThrow('invalid cilt hane sira no tri');
            expect(() => f('0-1-a')).toThrow('invalid cilt hane sira no tri');
            expect(() => f('0-1-2-3')).toThrow('invalid cilt hane sira no tri');
        });
    });

    describe('parseDeathStatus function', () => {
        const f = parseDeathStatus;

        it('should handle invalid input', () => {
            expect(() => f(undefined)).toThrow('invalid input as death status');
        });

        it('should work for alive people', () => {
            expect(f('Sağ\n-')).toEqual([DeathStatus.Alive, undefined]);
            expect(f('Sağ\n01/01/1970')).toEqual([DeathStatus.Alive, undefined]);
        });

        it('should work for dead people', () => {
            expect(f('Ölüm\n-')).toEqual([DeathStatus.Dead, undefined]);
            expect(f('Ölüm\n02/02/1971')).toEqual([DeathStatus.Dead, new Date(Date.UTC(1971, 1, 2))]);
            expect(f('Ölüm\n-73/42/asd')).toEqual([DeathStatus.Dead, undefined]);
        });
    });

    describe('parseBirthPlaceAndDate function', () => {
        const f = parseBirthPlaceAndDate;

        it('should handle invalid input', () => {
            expect(() => parseBirthPlaceAndDate(undefined)).toThrow('invalid input');
            expect(() => parseBirthPlaceAndDate(null)).toThrow('invalid input');
        });

        it('should handle valid places invalid birth dates', () => {
            expect(() => f('Ordu\n01/01/asd')).toThrow('ancestor record without birthYear is unacceptable');
            expect(() => f('Ordu\n01/asd/1943')).toThrow('ancestor record without birthYear is unacceptable');
        });

        it('should work with valid places and dates', () => {
            expect(f(' Antalya\n 24/10/1995 ')).toEqual(['Antalya', new Date(Date.UTC(1995, 9, 24))]);
        });
    });
});
