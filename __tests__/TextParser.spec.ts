/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');
import TextParser from '../lib/text';
const { matchParseResultWithExpectedResult } = require('./Utils');

describe('TextParserSpec', () => {
    const testDataPath = path.join(__dirname, './data/text');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')));

    it('should work', async () => {
        for(let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const textData = fs.readFileSync(path.join(testDataPath, test['file']));
            const result = await TextParser(textData);

            matchParseResultWithExpectedResult(result, test['expectedResult']);
        }
    });
});
