const http = require('http')
const fs = require('fs')

const port = 8080

fs.readFile('./index.html', (err, data) => {
    if (err) throw err;

    http.createServer(function(req, res){
        res.writeHeader(200,{"Content-Type": "text/html"})
        res.write('html')
        res.end()
    }).listen(port)
  })