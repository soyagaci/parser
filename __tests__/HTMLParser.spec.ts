const fs = require('fs');
const path = require('path');
const HTMLParser = require('../dist/html').default;
const soyHTML = fs.readFileSync(path.join(__dirname, './data/soy.html'));

describe('HTMLParser Spec', () => {
    it('should return an empty array', async () => {
        const result = await HTMLParser(soyHTML.toString());

        expect(result).toEqual([]);
    });

});
