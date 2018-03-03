/**
 * @jest-environment node
 */

describe('TextParserSpec', () => {
    const fs = require('fs');
    const path = require('path');
    const TextParser = require('../dist/text').default;
    const soyTextData = new Uint8Array(fs.readFileSync(path.join(__dirname, './data/soy.txt')));

    it('should work', async () => {
        const result = await TextParser(soyTextData);

        expect(result).toEqual([]);
    };
});
