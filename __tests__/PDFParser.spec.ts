/**
 * @jest-environment node
 */
import * as fs from 'fs';
import * as path from 'path';
import { RecordParseResult } from '../lib/generic';
import PDFParser from '../lib/pdf';
import { matchParseResultWithExpectedResult } from './Utils';

describe('PDFParser Spec', () => {
    const testDataPath = path.join(__dirname, './data/pdf');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')).toString());

    it('should return the expected results for hardcoded test files', async () => {
        for(const test of tests) {
            /* tslint:disable:no-string-literal */
            const data = new Uint8Array(fs.readFileSync(path.join(testDataPath, test['file'])));
            const result = await PDFParser(data);
            const expectedResult = test['expectedResult'] as RecordParseResult;
            /* tslint:enable:no-string-literal */

            matchParseResultWithExpectedResult(result, expectedResult);
        }
    });
});
