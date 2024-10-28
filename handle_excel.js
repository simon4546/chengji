const nodeXlsx = require('node-xlsx');
const fs = require('fs');

function handle(path) {
    try {
        const workbook = nodeXlsx.parse(path);
        let excelContent = workbook[0].data;
        let resultList = [];
        let titleList = excelContent[1][0];
        for (let index = 0; index < excelContent.length; index = index + 8) {
            const element = excelContent[index];
            let obj = {};
            let title = excelContent[index][0]
            const regex = /(.*?)\((\d+)\)_成绩单/;
            const match = title.match(regex);
            if (match) {
                obj.titleList = titleList;
                obj.name = match[1];
                obj.no = match[2];

                obj.items = excelContent[index + 5]
                obj.items.shift()
                obj.values = excelContent[index + 6]
                obj.values.shift()
                obj.level = obj.values.at(-1);
                obj.score = obj.values.at(-2);
                resultList.push(obj)
            }
        }

        return resultList
    } catch (ex) {
        return -1
    }
}

exports.Handle = handle