import { RecordParseResult } from '../lib/generic';

export function matchParseResultWithExpectedResult(result: RecordParseResult, expectedResult: object) {
   expect(JSON.parse(JSON.stringify(result))).toEqual(JSON.parse(JSON.stringify(expectedResult)));
}
