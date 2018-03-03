declare function require(name:string);
const PDFJS = require('pdfjs-dist');

export default function PDFParser(data){
    // TODO: her bir sayfa icin islemi tekrarla ve sonucu birlestir.
    let numPages:number = data.numPages;
    return PDFJS.getDocument(data)
        .then((doc) => doc.getPage(1))
        .then((page) => page.getTextContent());
};
