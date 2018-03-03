/**
 * @jest-environment node
 */

describe('PDFParser Spec', () => {
    const fs = require('fs');
    const path = require('path');
    const PDFParser = require('../dist/pdf').default;
    const soyPDFData = new Uint8Array(fs.readFileSync(path.join(__dirname, './data/soy.pdf')));

    it('should return an empty array', async () => {
        const result = await PDFParser(soyPDFData);

        expect(result).toEqual([]);
    });
});
