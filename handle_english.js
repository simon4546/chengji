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
            let obj = {};
            let title;
            if (element.indexOf("成绩单") != -1) {
                title = excelContent[index][0]
                const match = title.match(regex);
                if (match) {
                    obj.titleList = titleList;
                    obj.name = match[1];
                    obj.no = match[2];
                    obj.items=[];
                    obj.values=[];
                }
            }
            for (let idx = 0; idx < excelContent.length;) {
                const row = excelContent[idx];
                if(row.length>0 && row[0]=='题号'){
                    obj.items =obj.items.concat(row.slice(1))
                    const row = excelContent[idx+1];
                    obj.values =obj.values.concat(row.slice(1))
                }
                if(row.length==0){
                    index=idx;
                    break;
                }
            }
            obj.level = obj.values.at(-1);
            obj.score = obj.values.at(-2);
            resultList.push(obj)
        }
        fs.rm(path, function () { });
        return resultList
    } catch (ex) {
        return -1
    }
}

exports.Handle = handle