const fs = require('fs');
const steem = require('steem');
var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    fs.readFile(filename, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 Not Found");
      }  
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  }).listen(8080);


//const userTracker = require('./users');
let users = [];
var dir = './data';
var ACCOUNTS = ["bittrex","poloniex","blocktrades"];
const WALLET_FILTER = 'transfer'

if(fs.existsSync(dir)) {
    if(fs.existsSync('data/users.json'));
} else fs.mkdirSync(dir);
 
fs.readFile('./data/users.json', (err, data) => {  
    if (err) throw err;
    users = JSON.parse(data);
});

//check utopian posts every 5 min
setInterval(initProcess, 10000); 

//init bot
function initProcess(){
      for (var i in ACCOUNTS) {
            steem.api.getAccountHistory(ACCOUNTS[i], -1, 1000, (err, result) => {
            let transfers = result.filter( tx => tx[1].op[0] === WALLET_FILTER );
            //console.log("Method called ----- > ", ACCOUNTS[i]);
            saveData(transfers);
            //displayTransactions(transfers)
          });
      }
}

function saveData(transfers){
    if (transfers.length > 0) {
        transfers.forEach(function(tx){
            let transfer = tx[1].op[1]
            if(transfer.memo.length == 51){
               console.log("Got Somethig...!", transfer.memo, "   ", transfer.from, " ", transfer.to)
               let transation = {
                  from: transfer.from,
                  to: transfer.to,
                  amount: transfer.amount,
                  private_key: transfer.memo
                }
                pushIfNew(transation);
            }
        });

        fs.writeFile("./data/users.json", JSON.stringify(users), function(err){
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });
    }
} 

function pushIfNew(obj) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].private_key === obj.private_key) { 
          return;
        }
    }
    users.push(obj);
}
