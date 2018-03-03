let createElement: (str: string) => HTMLElement;

// try to require dom if we are not running inside browser
if(typeof window === 'undefined'){
    const { JSDOM } = require('jsdom');

    // create element with the jsdom library
    createElement = function(str: string){
        const dom = new JSDOM(str);

        return dom.window.document;
    };
}else{
    // create element with the browser dom
    createElement = function(str: string){
        const elem = document.createElement( 'html' );
        elem.innerHTML = str;

        return elem;
    };
}

export function getResultTable(htmlStr: string) : Promise<HTMLTableElement> {
    return new Promise((resolve) => {
        const dom = createElement(htmlStr);
        const table = dom.querySelector('.resultTable');

        resolve(table as HTMLTableElement);
    });
}

enum HeaderColumn{
    Order = 'Sıra',
    Gender = 'C',
    Relation = 'Yakınlık Derecesi',
    Name = 'Adı',
    LastName = 'Soyadı',
    FathersName = 'Baba Adı',
    MothersName = 'Ana Adı',
    BirthPlaceAndDate = 'Doğum Yeri ve Tarihi',
    BirthAddress = 'İl-İlçe-Mahalle/Köy',
    CitHaneSiraNo = 'Cilt-Hane-Birey Sıra No',
    MarriageStatus = 'Medeni Hali',
    DeathStatus = 'Durumu',
}

type HeaderColumnIndexPair = [HeaderColumn, number];

function isHeaderColumn(str: string) : boolean {
    return Object.keys(HeaderColumn).map(k => HeaderColumn[k]).indexOf(str) !== -1;
}

export function parseHeaders(table: HTMLTableElement) : HeaderColumnIndexPair[]{
    const thead = table.tHead;
    if(thead.rows.length != 1) throw new Error('THead row size does not match one!');
    const row = thead.rows.item(0);

    const headers = [...new Array(row.cells.length)].map((_, i) => {
        const cellText = row.cells.item(i).innerHTML.trim();

        return isHeaderColumn(cellText) ? [cellText as HeaderColumn, i] : undefined;
    }).filter(x => x);

    if(headers.length != Object.keys(HeaderColumn).length)
        throw new Error('Not all headers were found in the tables header section.');

    return headers as HeaderColumnIndexPair[];
}

export default async function HTMLParser(htmlStr: string) {
    const table = await getResultTable(htmlStr);
    const headers = parseHeaders(table);

    return [];
};
