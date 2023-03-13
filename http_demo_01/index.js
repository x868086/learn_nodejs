const http = require('http')
const URL = require('url').URL
const path = require('path')
const { open } = require('fs/promises')
const routers = require('./routers/index.js')




let httpServer = http.createServer()

httpServer.on('request', async (req, res) => {

    let urlObj = new URL(req.url, `http://${req.headers.host}`);
    let pathName = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
    let fileExtname = path.extname(pathName)

    // 1.调用自定义staticFile方法，根据url请求中的path判断请求是否是带后缀名的静态文件
    // 如果是指向静态文件则调用staticFile方法
    if (fileExtname) {
        await routers.staticFile('static', req, res)
    } else {
        // 2.如果url的path中不带文件后缀名，则调用router模块封装的方法，根据pathName来匹配对应的路由
        // let pathstr = pathName.replace("/", "")
        try {
            routers(req, res)
        } catch (error) {
            let fileHandle = await open(`${process.cwd()}/static/404.html`, 'r')
            let file = await fileHandle.readFile()
            fileHandle.close()
            res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
            res.write(file)
            res.end()
        }
    }

})



httpServer.listen(3000)