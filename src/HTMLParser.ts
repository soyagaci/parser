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

export default function HTMLParser(str: string){
    return createElement(str).querySelectorAll(".test").item(0).innerHTML;
};
