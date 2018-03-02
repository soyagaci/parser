//import pdf1 from 'pdfjs';
declare function require(name:string);
const pdf1 = require('pdfjs-dist');

console.log(pdf1);

export function PdfParser(){ return 'PDF'; }
export function HtmlParser(){ return 'Html'; }
export function TextParser(){ return 'Text'; }

export default HtmlParser;
