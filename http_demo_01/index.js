const http = require('http')
const URL = require('url').URL
const path = require('path')
const ejs = require('ejs')
const {open} = require('fs/promises')
const routers = require('./routers/index.js')



let httpServer = http.createServer()

httpServer.on('request', async (req, res) => {
    // 1.调用自定义staticFile方法，根据url请求中的path来确定是否读取静态文件并返回给请求端
    routers.staticFile('static', req, res)
    let urlObj = new URL(req.url, `http://${req.headers.host}`);
    let pathName = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
    let fileExtname = path.extname(pathName) 
    // 2.如果url的path中不带文件后缀名，则读取path对应ejs模板
    if(!fileExtname){
        if (pathName === '/login'){
            let msg = "数据库里面获取的数据";
            let item = [
                {
                    title: '新闻111'
                },
                {
                    title: '新闻222'
                },
                {
                    title: '新闻3333'
                },
                {
                    title: '新闻4444'
                }, {
                    title: '新闻5555'
                }
            ]
            ejs.renderFile('./views/login.ejs',{msg:msg,item:item},(err, str)=>{
                res.writeHead(200,{'Content-Type':'text/html;charset="utf-8"'});
                res.write(str)
                res.end()
            })
        }else if (pathName == '/news') {
                // /news?page=1&name=5
                let querySearch = urlObj
            ejs.renderFile('./views/form.ejs',{},(err, str)=>{
                res.writeHead(200,{'Content-Type':'text/html;charset="utf-8"'});
                res.write(str)
                // 获取/news?page=1&name=5 的get传值
                res.write(`Param1:  ${querySearch.searchParams.get('page')} `)
                res.write(`Param2:  ${querySearch.searchParams.get('name')} `)
                res.end()
            })
        } else if (pathName == '/doLogin') {
            let postData =''
            req.on('data',(chunk)=>{
                postData += chunk
            });
            req.on('end',()=>{
                res.writeHead(200,{'Content-Type':'text/html;charset="utf-8"'});
                res.write(postData)
                res.write(`请求方法是：${req.method}`)
                res.end()
            })

        } else {
            let fileHandle = await open(`./static/404.html`, 'r')
            let file = await fileHandle.readFile()
            fileHandle.close()
            res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
            res.write(file)
            res.end()
        }
    }
})



httpServer.listen(3000)