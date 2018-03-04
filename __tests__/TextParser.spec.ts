/**
 * @jest-environment node
 */

describe('TextParserSpec', () => {
    const fs = require('fs');
    const path = require('path');
    const TextParser = require('../dist/text').default;
    const testDataPath = path.join(__dirname, './data/text');
    const tests = JSON.parse(fs.readFileSync(path.join(testDataPath, './tests.json')));

    it('should work', async () => {
        tests.forEach((test) => {
            const textData = fs.readFileSync(path.join(testDataPath, test['file']));
            const result = TextParser(textData);

            expect(result).toEqual(test['expectedResult']);
        });
    });
});
