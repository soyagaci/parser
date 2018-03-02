export {default as PDFParser} from './PDFParser';

export function HtmlParser(data){ return []; }
export function TextParser(data){ return []; }

export default HtmlParser;

// Nodejs code for testing out pdf reading...
import PDFParser from './PDFParser';
declare function require(name:string);
const fs = require('fs');
const data = new Uint8Array(fs.readFileSync('/home/yengas/Downloads/soyagaci.pdf'));
PDFParser(data).then(console.log, console.log);
