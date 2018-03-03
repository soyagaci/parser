declare function require(name:string);
declare var PDFJS: any;

// Try to require PDFJS if its not globally defined.
if(typeof PDFJS === 'undefined') PDFJS = require('pdfjs-dist');

export default function PDFParser(data: Uint8Array){
    return PDFJS.getDocument(data)
        .then((doc) => doc.getPage(1))
        .then((page) => page.getTextContent());
};
