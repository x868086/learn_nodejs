const { open } = require('fs/promises')
const URL = require('url').URL
const path = require('path')
const ejs = require('ejs')
const { getMimeType } = require('../utils/common')



// 将处理路由的业务逻辑封装到app对象并导出
let app = {
    staticFile: async function (filepath, req, res) {
        let urlObj = new URL(req.url, `http://${req.headers.host}`);
        // 1.1获取path,将没有具体指向的/指向到/index.html首页
        let pathName = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;

        // 1.2获取path中路径的扩展名，根据扩展名调用自定义的getMimeType方法，来确定向请求端返回何种格式的文件
        let fileExtname = path.extname(pathName)
        let mimeType = await getMimeType(fileExtname)
        try {
            let fileHandle = await open(`./${filepath}/${pathName}`, 'r')
            let file = await fileHandle.readFile()
            fileHandle.close()

            res.writeHead(200, { "Content-Type": `${mimeType};charset='utf-8'` })
            res.write(file)
            res.end()
            // 1.3 如果获取文件失败，则返回404静态页面
        } catch (error) {
            let fileHandle = await open(`${process.cwd()}/${filepath}/404.html`, 'r')
            let file = await fileHandle.readFile()
            fileHandle.close()
            res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
            res.write(file)
            res.end()

        }
    },
    login: (req, res) => {
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
        ejs.renderFile(`${process.cwd()}/views/login.ejs`, { msg: msg, item: item }, (err, str) => {
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.write(str)
            res.end()
        })
    },
    doLogin: (req, res) => {
        let postData = ''
        req.on('data', (chunk) => {
            postData += chunk
        });
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.write(postData)
            res.write(`请求方法是：${req.method}`)
            res.end()
        })
    },
    news: function (req, res) {
        // /news?page=1&name=5
        let urlObj = new URL(req.url, `http://${req.headers.host}`);
        let querySearch = urlObj
        ejs.renderFile(`${process.cwd()}/views/form.ejs`, {}, (err, str) => {
            console.log(__dirname)
            console.log(__filename)
            console.log(process.cwd())
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.write(str)
            // 获取/news?page=1&name=5 的get传值
            res.write(`Param1:  ${querySearch.searchParams.get('page')} `)
            res.write(`Param2:  ${querySearch.searchParams.get('name')} `)
            res.end()
        })
    },
    error: async (req, res) => {
        let fileHandle = await open(`${process.cwd()}/static/404.html`, 'r')
        let file = await fileHandle.readFile()
        fileHandle.close()
        res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
        res.write(file)
        res.end()
    }
}

module.exports = app