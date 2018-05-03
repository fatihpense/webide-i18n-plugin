import Q from 'q';
import xmldom from 'xmldom';

//section:filereading

export function readProperties(file_content) {

    return Q.Promise(function (resolve, reject, notify) {

        //let es5
        var lines = file_content.split(/\r?\n/);

        var properties = {};


        //es5 (line of lines)
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.startsWith("#")) {
                continue;
            }
            var arr = line.split('=');
            if (arr.length != 2) {
                continue;
            }
            var key = arr[0].trim();
            var val = arr[1].trim();
            properties[key] = val;
            //console.log(key, '----', val);
        }
        resolve(properties);
    });
}


// Node Types
var NodeType = {}
var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
var TEXT_NODE = NodeType.TEXT_NODE = 3;
var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
var NOTATION_NODE = NodeType.NOTATION_NODE = 12;

export function readI18nUsageFromXML(file_content, file_path) {
    return Q.Promise(function (resolve, reject, notify) {

        var doc = new xmldom.DOMParser().parseFromString(file_content);
        var docEl = doc.documentElement;
        var arr = [];
        getI18nUsageInXMLRecursive(arr, file_path, docEl)
        resolve(arr);

    });
}


function getUsageFromXMLAttribute(file, attributeString) {
    var regex = RegExp('(\{i18n>[^}]*\})', 'g');
    //var str1 = 'table {i18n>test}football, {i18n>test2}foosball';
    var arrayTemp = [];
    var resultArr = [];
    while ((arrayTemp = regex.exec(attributeString)) !== null) {
        var i18nUsage = {
            file: file,
            value: arrayTemp[0].substring(6, arrayTemp[0].length - 1)
        }
        resultArr.push(i18nUsage);
    }
    return resultArr;
}

//var i18nUsage = {file:"",value:""}
export function getI18nUsageInXMLRecursive(arr, file, el) {
    if (el.nodeType != ELEMENT_NODE) {
        return;
    }
    //console.log(el.tagName);
    for (var i = 0; i < el.attributes.length; i++) {
        var attr = el.attributes[i];
        var results = getUsageFromXMLAttribute(file, attr.value);
        Array.prototype.push.apply(arr, results);

    }
    //search children
    for (var i = 0; i < el.childNodes.length; i++) {
        var childEl = el.childNodes[i]
        getI18nUsageInXMLRecursive(arr, file, childEl)
    }

}

//section:COMPARE

export function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    //for (var a of as)
    for (var i = 0; i < as.length; i++) {
        var a = bs[i];
        if (!bs.has(a)) return false;
    }
    return true;
}

//takes i18nAll, return array of grouped i18n
//[ { key: 'buttonAcceptText',
//    usedIn: Set { './testdata/Allowance.view.xml' } },
export function prepareSetArr(groupedI18n, arr) {

    if (arr.length == 0) {
        return groupedI18n;
    }
    //take one
    var splicedArr = arr.splice(arr.length - 1, 1);
    var splicedI18n = splicedArr[0];

    var setOfI18n = {
        i18nArr: [splicedI18n.key],
        usedInSet: splicedI18n.usedIn
    }

    for (var i = arr.length - 1; i > 0; i--) {

        if (eqSet(setOfI18n.usedInSet, arr[i].usedIn)) {

            setOfI18n.i18nArr.push(arr[i].key);
            arr.splice(i, 1);
        }

    }
    groupedI18n.push(setOfI18n);
    //if(arr.length>0){}
    prepareSetArr(groupedI18n, arr);
}

