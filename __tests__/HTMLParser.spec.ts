describe('HTMLParser Spec', () => {
    const fs = require('fs');
    const path = require('path');
    const HTMLParser = require('../dist/html').default;
    const soyHTML = fs.readFileSync(path.join(__dirname, './data/html/anon.html'));

    it('should return an empty array', async () => {
        const result = await HTMLParser(soyHTML.toString());

        expect(result).toEqual([]);
    });

});
