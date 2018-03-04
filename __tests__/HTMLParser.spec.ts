import * as fs from 'fs';
import * as path from 'path';
import { RecordParseResult } from '../lib/generic';
import HTMLParser from '../lib/html';
import { matchParseResultWithExpectedResult } from './Utils';

describe('HTMLParser Spec', () => {
    const testDataPath = path.join(__dirname, './data/html');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')).toString());

    it('should return the expected results for hardcoded test files', async () => {
        for(const test of tests) {
            /* tslint:disable:no-string-literal */
            const data = fs.readFileSync(path.join(testDataPath, test['file'])).toString();
            const result = await HTMLParser(data);
            const expectedResult = test['expectedResult'] as RecordParseResult;
            /* tslint:enable:no-string-literal */

            matchParseResultWithExpectedResult(result, expectedResult);
        }
    });

});
