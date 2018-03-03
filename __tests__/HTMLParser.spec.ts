const fs = require('fs');
import HTMLParser from '../dist/html';

describe('HTMLParser Spec', () => {
    it('should return an empty array', () => {
        expect(HTMLParser('')).toEqual([]);
    });

});
