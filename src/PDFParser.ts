declare function require(name:string);
const PDFJS = require('pdfjs-dist');

export default function PDFParser(data){
    return PDFJS.getDocument(data)
};
