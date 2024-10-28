const nodeXlsx = require('node-xlsx');
const fs = require('fs');

function handle(path) {
    try {
        const workbook = nodeXlsx.parse(path);
        let excelContent = workbook[0].data;
        let resultList = [];
        let titleList = excelContent[1][0];

        const regex = /(.*?)\((\d+)\)_成绩单/;
        for (let index = 0; index < excelContent.length;) {
            const element = excelContent[index];
            let obj = {items:[],values:[]};
            let title;
            if (element.length == 1 && element[0].indexOf("成绩单") != -1) {
                title = excelContent[index][0]
                const match = title.match(regex);
                if (match) {
                    obj.titleList = titleList;
                    obj.name = match[1];
                    obj.no = match[2];
                }
            }
            for (let idx = index + 1; idx < excelContent.length;) {
                const row = excelContent[idx];
                if (row.length > 0 && row[0] == '题号') {
                    _tem=row.slice(1)
                    obj.items = obj.items.concat(_tem)
                    let row1 = excelContent[idx + 1];
                    _tem=row1.slice(1)
                    obj.values = obj.values.concat(_tem)
                    idx++;
                }
                if (row.length == 0 && obj.values.length > 0) {
                    index = idx;
                    break;
                }
                idx++;
            }
            obj.level = obj.values.at(-1);
            obj.score = obj.values.at(-2);
            resultList.push(obj)
            index++
        }
        fs.rm(path, function () { });
        return resultList
    } catch (ex) {
        return -1
    }
}
// handle('./1.xlsx')
exports.Handle = handle