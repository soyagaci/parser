import {RecordParseResult} from "../src/RecordParse";
const {matchParseResultWithExpectedResult} = require( "./Utils");

describe('HTMLParser Spec', () => {
    const fs = require('fs');
    const path = require('path');
    const HTMLParser = require('../dist/html').default;
    const testDataPath = path.join(__dirname, './data/html');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')));

    it('should return the expected results for hardcoded test files', async () => {
        for(let i = 0; i < tests.length; i++){
            const test = tests[i];
            const data = fs.readFileSync(path.join(testDataPath, test['file'])).toString();
            const result = await HTMLParser(data);
            const expectedResult = test['expectedResult'] as RecordParseResult;

            matchParseResultWithExpectedResult(result, expectedResult);
        }
    });

});
