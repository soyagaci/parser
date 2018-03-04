/**
 * @jest-environment node
 */
import * as fs from 'fs';
import * as path from 'path';
import TextParser from '../lib/text';
import { matchParseResultWithExpectedResult } from './Utils';

describe('TextParserSpec', () => {
    const testDataPath = path.join(__dirname, './data/text');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')).toString());

    it('should work', async () => {
        for(const test of tests) {
            /* tslint:disable:no-string-literal */
            const textData = fs.readFileSync(path.join(testDataPath, test['file']));
            const result = await TextParser(textData);

            matchParseResultWithExpectedResult(result, test['expectedResult']);
            /* tslint:enable:no-string-literal */
        }
    });
});
