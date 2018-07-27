var ws = require('nodejs-websocket');
var PORT = 3000;

var userName = '';
var count = 0;
var isFirst = true;
var users = [];

var createWs = function(){

  function broadcast(str) {
    server.connections.forEach(function (connection) {
      connection.sendText(str)
    })
  }

  function getTime() {
    var time = new Date();
    var h = time.getHours() < 10 ? ('0' + time.getHours()) : time.getHours();
    var m = time.getMinutes() < 10 ? ('0' + time.getMinutes()) : time.getMinutes();
    return h + ' : ' + m;
  }

  var server = ws.createServer(function(conn){
    isFirst = false;
    conn.on('text',function (str) {
      var obj = JSON.parse(str);
      var msg;
      if(obj.type == 'join'){
        var tempArr = users.filter(function(v){
          return v == obj.content;
        })
        if(tempArr.length == 0) {
          users.push(obj.content)
          var msg = {
            type: 'join',
            content: getTime() + ' ' + obj.content + '加入聊天',
            from: obj.from,
            count: count
          }
          count++;
        }
        broadcast(JSON.stringify({
          type: 'count',
          content: count,
          from: userName
        }))
        userName = obj.from;
      }else {
        msg = {
          type: 'text',
          content: obj.content,
          from: obj.from,
          count: count
        }
      } 
      broadcast(JSON.stringify(msg));
    })
    conn.on('close',function(code,reason){
      users = users.filter(function (v) {
        return v !== userName;
      })
      count--;
      // isFirst = count == 0;
      cout = count <= 0 ? 1 : count;
      broadcast(JSON.stringify({
        type: 'count',
        content: count,
        from: userName
      }))
      var msg = {
        type: 'leave',
        content: userName + '离开',
        from: userName,
        count: count
      }
      broadcast(JSON.stringify(msg))
    })
    conn.on('error',function(err){
      console.log('this is a error ',err)
    })
    if(isFirst){
      setInterval(function(){
        var msg = {
          type: 'time',
          content: getTime(),
          from: userName,
          count: count
        }
        broadcast(JSON.stringify(msg));
      },2 * 60 * 1000)
    }
    
  }).listen(PORT)
  console.log('websocket server is ready');
  
}

module.exports = createWs;