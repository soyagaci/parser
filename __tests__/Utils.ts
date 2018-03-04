import {RecordParseResult} from "../src/RecordParse";

function matchParseResultWithExpectedResult(result: RecordParseResult, expectedResult: object){
   expect(JSON.parse(JSON.stringify(result))).toEqual(JSON.parse(JSON.stringify(expectedResult)));
}

module.exports = {
    matchParseResultWithExpectedResult
};
