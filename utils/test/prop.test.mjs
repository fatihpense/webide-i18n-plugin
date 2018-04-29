import { readProperties } from '../src/main.mjs'
import fs from 'fs';

var contents = fs.readFileSync("./test/i18n.properties", { "encoding": "utf8" });


const ExpectedResult = { "label_ProductID": "Product ID", "label_UnitsInStock": "Units In Stock", "label_UnitsOnOrder": "Units On Order" }


test('i18n-property-reading', () => {
    expect.assertions(1);
    //jest can only see normal promises
    return new Promise(function (resolve, reject) {
        readProperties(contents).done(function (result) {
            expect(result).toEqual(ExpectedResult);
            resolve()
        });
    });
});