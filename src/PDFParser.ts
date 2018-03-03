declare var PDFJS: any;

// Try to require PDFJS if its not globally defined.
if(typeof PDFJS === 'undefined') PDFJS = require('pdfjs-dist');

function getCoordinates(data: object, index: number, step: number): number[] {
    // helper function for retrieving coordinates
    return [data["items"][index - step]["transform"][4] + data["items"][index - step]["width"], data["items"][index + step]["transform"][4]];
}

function process(data: any): object {
    let tableCoordinates: object = {};
    let kinshipDict: object = {};
    let i: number = 0;
    // find the coordinates of the headers in format of {"header": [x1, x2], ...}
    while (i < data["items"].length) {
        if (data["items"][i]["str"] === "Sıra") {
            tableCoordinates["order"] = [data["items"][i]["transform"][4], data["items"][i + 1]["transform"][4]];
            tableCoordinates["sex"] = getCoordinates(data, i + 1, 1);
            tableCoordinates["kinship"] = getCoordinates(data, i + 2, 1);
            tableCoordinates["name"] = getCoordinates(data, i + 3, 1);
            tableCoordinates["surname"] = getCoordinates(data, i + 4, 1);
            tableCoordinates["father"] = getCoordinates(data, i + 5, 1);
            tableCoordinates["mother"] = getCoordinates(data, i + 6, 1);
            tableCoordinates["birthPlace"] = getCoordinates(data, i + 7, 2);
            tableCoordinates["address"] = getCoordinates(data, i + 9, 1);
            tableCoordinates["idInfo"] = getCoordinates(data, i + 10, 2);
            tableCoordinates["maritalStat"] = getCoordinates(data, i + 12, 2);
            tableCoordinates["stat"] = [data["items"][i + 12]["transform"][4] + data["items"][i + 12]["width"], data["items"][i + 14]["transform"][4] + data["items"][i + 14]["width"] + data["items"][i]["width"]];
            i += 15;
            break;
        }
        i++;
    }
    // create the kinship dictionary
    let person: string;
    while (i < data["items"].length) {
        let blackList: string[] = ["İÇİŞLERİ BAKANLIĞI", "T.C.", "ALT ÜST SOY BELGESİ"];
        if (blackList.indexOf(data["items"][i]["str"]) !== -1) {
            i += 1;
            continue;
        }
        let start: number = data["items"][i]["transform"][4];
        let end: number = start + data["items"][i]["width"];
        if (!isNaN(data["items"][i]["str"]) && data["items"][i]["str"] !== " ")
            person = data["items"][i]["str"];
        if (!kinshipDict.hasOwnProperty(person))
            kinshipDict[person] = {};
        for (let key in tableCoordinates) {
            if (tableCoordinates[key][0] <= start && tableCoordinates[key][1] >= end) {
                if (!kinshipDict[person].hasOwnProperty(key))
                    kinshipDict[person][key] = data["items"][i]["str"];
                else
                    kinshipDict[person][key] += data["items"][i]["str"];
                break;
            }
        }
        i++;
    }
    return kinshipDict;
}



export default function PDFParser(data: Uint8Array){
    return PDFJS.getDocument(data).then(function (doc){
        let numPages = doc.numPages;
        let results = {};

        doc.getPage(0)
            .then((page) => page.getTextContent())
            .then((content) => process(content));

        return results;
    });
};
