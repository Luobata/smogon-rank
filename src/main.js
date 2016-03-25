/**
 * @file 统计smogon统计概率
 * @auth luobata(batayao@sohu-inc.com)
 */

var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var Promise = require('bluebird');
var console = require('better-console');

var root = path.dirname(__dirname).replace(/\\/g, '/') + '/';


var download = function (downloadUrl, filePath, name) {
    return new Promise (function (resolve) {
        var options = {
            host: url.parse(downloadUrl).hostname,
            port: url.parse(downloadUrl).port || 80,
            path: url.parse(downloadUrl).pathname
        };

        var fileName = url.parse(downloadUrl).pathname.split('/').pop();
        var file = fs.createWriteStream(filePath + name);
        console.log(filePath + name);

        http.get(options, function(res) {
            res.on('data', function(data) {
                //fs.appendFileSync(filePath + fileName, data, 'utf-8');
                file.write(data, 'utf-8')
            });
            res.on('end', function() {
                file.end();
                resolve(res.statusCode);
                console.log('downloaded');
            });
        });
    });
}
var logFormate = function (root, fileName) {
    var log = fs.readFileSync(root + fileName, 'utf-8');
    var pokemons = log.split('\n').splice(3);
    var head = pokemons.shift();
    // 去除头尾分隔符
    pokemons.shift();
    pokemons.pop();
    pokemons.pop();
    var typeLen = {
        name: 0,
        rank: 0,
        usage: 0
    };
    var str = {
        rank: 'Rank',
        name: 'Pokemon',
        usage: 'Usage'
    };
    var rank = {};
    var headFormate = function (head) {
        head.split('|').forEach(function (item) {
            if (item.indexOf(str.rank) !== -1) {
                typeLen.rank = item.length;
            } else if (item.indexOf(str.name) !== -1) {
                typeLen.name = item.length;
            } else if (item.indexOf(str.usage) !== -1) {
                typeLen.usage = item.length;
            }
        });
    }
    var rankFormate = function (pokemons) {
        pokemons.forEach(function (item) {
            var pm = item.trim().split('|');
            pm = pm.slice(1, pm.length - 1);
            var id = pm[0];
            var name = pm[1];
            var usage = pm[2];
            rank[name] = {
                rank: id,
                usage: usage
            };
        });
    }
    headFormate(head);
    rankFormate(pokemons);
    return rank;
}
var rankFormate = function (rankA, rankB) {
    for (var k in rankB) {
        var change = parseFloat(rankB[k].usage, 10) - parseFloat(rankA[k].usage, 10) + '%';
        rankB[k].change = change;
    }
    return rankB;
}

var main = function () {
    var month = 'http://www.smogon.com/stats/2016-02/ou-1695.txt';
    var lastmonth = 'http://www.smogon.com/stats/2016-01/ou-1695.txt';
    var rankA = logFormate(root, '01.txt');
    var rankB = logFormate(root, '02.txt');
    rankB = rankFormate(rankA, rankB);
    fs.writeFileSync(root + '1.txt', JSON.stringify(rankB), 'utf-8');
//    Promise.all([download(month, root, '02.txt'), download(lastmonth, root, '01.txt')])
//        .then(function () {
//            console.log('all over');
//            logFormate(root, '01.txt');
//        })
//        .error(function (e) {
//            console.error('an error happened:' + e.message);
//        });
//
}
main();
