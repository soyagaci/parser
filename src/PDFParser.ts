declare function require(name:string);
const PDFJS = require('pdfjs-dist');

export default function PDFParser(data){
    return PDFJS.getDocument(data)
        .then((doc) => doc.getPage(1))
        .then((page) => page.getTextContent());
};
