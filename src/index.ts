export {default as PDFParser} from './PDFParser';

export function HtmlParser(data){ return []; }
export function TextParser(data){ return []; }

export default HtmlParser;

// Nodejs code for testing out pdf reading...
import PDFParser from './PDFParser';
declare function require(name:string);
const fs = require('fs');
const data = new Uint8Array(fs.readFileSync('pdf_examples/yigit_soy.pdf'));

function getCoordinates(data, index) {
    // helper function for retrieving coordinates
    return [data["items"][index]["transform"][4], data["items"][index]["transform"][5]];
}

PDFParser(data).then(function(data){
    var tableCoordinates = {};
    var i = 0;
    // find the coordinates of the headers
    while(i < data["items"].length) {
        // console.log(data["items"][i]);
        if(data["items"][i]["str"] === "Sıra") {
            tableCoordinates["order"] = getCoordinates(data, i);
            tableCoordinates["sex"] = getCoordinates(data, i + 1);
            tableCoordinates["kinship"] = getCoordinates(data, i + 2);
            tableCoordinates["name"] = getCoordinates(data, i + 3);
            tableCoordinates["surname"] = getCoordinates(data, i + 4);
            tableCoordinates["father"] = getCoordinates(data, i + 5);
            tableCoordinates["mother"] = getCoordinates(data, i + 6);
            tableCoordinates["birthPlace"] = getCoordinates(data, i + 7);
            tableCoordinates["address"] = getCoordinates(data, i + 9);
            tableCoordinates["idInfo"] = getCoordinates(data, i + 10);
            tableCoordinates["maritalStat"] = getCoordinates(data, i + 12);
            tableCoordinates["stat"] = getCoordinates(data, i + 14);
            i += 15;
            break;
        }
        i++;
    }
    console.log(tableCoordinates);
    // print the data objects all items
    // data["items"].forEach(function(item){
    //     console.log(item);
    // })

    // print just first 35 elements
    for(let i = 0; i < 35; i++) {
        console.log(data["items"][i]);
    }

});

