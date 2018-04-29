import { readI18nUsageFromXML } from '../src/main.mjs'
import fs from 'fs';

var contents = fs.readFileSync("test/hello.view.xml", { "encoding": "utf8" });

const ExpectedResult = [{ file: 'test/hello.view.xml', value: 'showHelloButtonText' }]

test('xml-view-reading', () => {
    expect.assertions(1);
    //jest can only see normal promises
    return new Promise(function (resolve, reject) {
        readI18nUsageFromXML(contents, "test/hello.view.xml").done(function (result) {
            expect(result).toEqual(ExpectedResult);
            resolve()
        });
    });
});
