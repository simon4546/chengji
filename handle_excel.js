const nodeXlsx = require('node-xlsx');
const fs = require('fs');

function handle(path) {
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

    fs.writeFileSync('./resultJSON.json', JSON.stringify(resultList, null, 2), 'utf-8');
    console.log('Excel文件已成功解析为JSON并保存到文件。');
}

exports.Handle=handle