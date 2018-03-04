function createResults(buffer: Buffer): object {
    const str: string = buffer.toString();
    const pattern: RegExp = /\d+\t(E|K)\t[ABK]/g;
    let results: object = {"records": [], "errors": []};
    let indexes: number[] = [];
    let match: any;

    // collect the indexes of matches
    while((match = pattern.exec(str)) != null) {
        indexes.push(match.index);
    }
    // add index of the string which indicates text's end as last index to the indexes list
    let endIndex = str.indexOf("AÇIKLAMALAR");
    indexes.push(endIndex);

    // loop through indexes array and append results to results object
    for(let i: number = 0; i < indexes.length - 1; i++) {
        let record: string[] = str.slice(indexes[i], indexes[i + 1]).split("\t");
        let relation: string[] = [];
        record[2].split("").forEach(function(c) {
            if(c >= "A" && c <= "Z")
                relation.push(c);
        });
        results["records"].push({"record": record, "relation": relation.join("")});
    }
    console.log(results["records"][0]);
    return results;
}


export default function TextParser(buffer: Buffer): any[] {
    createResults(buffer);
    return [];
};
