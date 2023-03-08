// const http = require('http');
// const URL = require('url').URL
// let httpServer = http.createServer()
// httpServer.on('request',(req, res)=>{
//     // console.log(url.parse(req.url))
//     console.log(new URL(req.url,'http://localhost:3000'))
//     res.writeHead(200,{'content-type':'text/html;charset=""utf-8'})
//     res.write('<h2>hello world</h2>');
//     res.write('abcde');
//     res.end()
// })

// httpServer.listen(3000);

const http=require('http')
const URL = require('url').URL
const url = require('url')
const fs = require('fs')

let httpServer = http.createServer()
httpServer.on('request',(req, res) => {
    if(req.url !=='/favicon.ico'){
        let pathName = req.url==='/'?'index.html':req.url
        // console.log(req)
        // console.log(url.parse(req.url))
        console.log(new URL(req.url,`http://${req.headers.host}`))

        let p = new Promise((resolve,reject)=>{
            fs.readFile(`./${pathName}`,(err, data)=>{
                if(err){
                    reject(err)
                }
                if(data) {
                    resolve(data)
                }

            })            
        })

        p.then((data)=>{
            res.writeHead(200,{'content-type':'text/html;charset="utf-8"'})
            res.write(data)
            // console.log(data)
            res.end()
        }).catch(()=>{
            res.writeHead(400,{'content-type':'text/html;charset="utf-8"'})
            res.write('页面地址错误','utf-8')
            res.end()
        })




    }
    
})

httpServer.listen(3000)