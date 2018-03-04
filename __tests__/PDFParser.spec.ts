/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');
import PDFParser from '../lib/pdf';
import { RecordParseResult } from '../lib/generic';
const { matchParseResultWithExpectedResult } = require('./Utils');

describe('PDFParser Spec', () => {
    const testDataPath = path.join(__dirname, './data/pdf');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')));

    it('should return the expected results for hardcoded test files', async () => {
        for(let i = 0; i < tests.length; i++){
            const test = tests[i];
            const data = new Uint8Array(fs.readFileSync(path.join(testDataPath, test['file'])));
            const result = await PDFParser(data);
            const expectedResult = test['expectedResult'] as RecordParseResult;

            matchParseResultWithExpectedResult(result, expectedResult);
        }
    });
});
