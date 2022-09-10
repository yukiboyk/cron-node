const express = require('express');
const app = express();
const http = require('http');
var request = require('request');
var CronJob = require('cron').CronJob;
var fs = require('fs');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

var lemanh = function () {

    this.coTheCron        = true; // có thể không
    this.listCron      = []; //


    this.putCron = function(url,delay){
        // nếu đang trong thời gian chờ (coTheDatCuoc == false)
        if (this.coTheCron == false){
            return {
                status  : 'error',
                error   : 'Sever dang bao tri, vui lòng chờ giây lát'
            };
       
        }
        if (delay >= 61){
            return {
                status  : 'error',
                error   : 'khong the lon hon 1 phut'
            };
        }
        this.listCron.push({
            url  : url,
            delay  : delay,
        });

        this.listCron.forEach(element => {
            var time = element.delay
            var url = element.url
        var job2 = new CronJob('*/'+time+' * * * * *',function() {
            request.post(
                {
                    url: url,
                    body: "auth=yukiboyk"
                },(err, res) =>
                 {
                  
                     if(err){
                        console.log('Cron that bai - '+url)
                     }
                        console.log('Cron thanh cong - '+url)
                        content = 'Cron thanh cong - '+url+'\n'
                        // fs.writeFile('test.txt', content, { flag: 'a+' }, err => {});
                        io.on('connection', (socket) => {
                            socket.emit('logs', content);
                        });
                 }
                 );
        },null,true,'America/Los_Angeles'
     );
   job2.start();
});
       
        return {
            'status' : 'success',
            'data' :  this.listCron,
        }
       
    }

}
var tx = new lemanh();

io.on('connection', (socket) => {
  console.log('a user connected ID: '+socket.id);
  socket.on('disconnect', function(){
    console.log(socket.id+' vua ngat ket noi');
  })

  socket.on('pull', function (data) {
    console.log(data)
    msg = tx.putCron(data.url,data.delay);
    socket.emit('pull', msg);
});
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});