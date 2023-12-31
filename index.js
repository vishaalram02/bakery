const express = require('express')
const crypto = require('crypto')
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer')
const multer = require('multer')
const nocache = require('nocache')
const cors = require('cors')
const path = require('path')
const app = express()
const port = 5000

var secret = "bakersgonnabake"

var uname = (username) => {
    var hash = crypto.createHash('sha256')
    hash.update(encodeURI(username))
    hash.update(encodeURI(secret))
    hash.update(encodeURI("UNAME_HASH"))
    return `/u/${username}_${hash.digest('hex').substring(0,6)}`
}

app.listen(port, function() {
    console.log("server started on port", port)
})
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(nocache());
var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, path.join(__dirname, '/public/images/uploads'))
    }, 
    filename: function (req, file, cb) {
        username = req.body.uname.substring(3,req.body.uname.lastIndexOf('_'))
        if(req.body.uname != uname(username)){
            cb(new Error('invalid uname'), false)
        } else {
            var hash = crypto.createHash('sha256')
    	    hash = hash.update(encodeURI(file.originalname)).digest('hex').substring(0,6)
            cb(null, req.body.uname.substring(3) + hash + path.extname(file.originalname))
        }
    },
 })

const upload = multer({
    storage: storage,
    limits : {fileSize : 1000000},
    fileFilter: function(req, file, cb){
        const filetypes = /jpeg|jpg|png|svg|gif/
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = filetypes.test(file.mimetype)
        if(mimetype && extname){
            return cb(null, true)
        } else {
            return cb(new Error('file is not allowed'), false)
        }
    },
})


app.get('/u/:user', (req, res) => {
    user = req.params.user
    username = user.substring(0,user.lastIndexOf('_'))
    if(`/u/${user}` != uname(username)) res.status(400).send({error: "Invalid user URL"})
    else{
        res.render('index', { username: username })
    }
})

app.post('/preview', (req, res) => {
    upload.single('design')(req, res, function(err){
        if(err){
            console.log(err)
            res.status(400).send({error: err.message})
        } else {
            var design = req.file ? req.file.filename : 'hbday.png'
            if(!req.body.first) req.body.first = "none :("
            if(!req.body.date) req.body.date = "none :("
            if(!req.body.size) req.body.size = "none :("
	    if (!req.body.uname) {
	    	res.status(400).send({error: 'No username provided in body'});
	    } else {
            	var data = {username: req.body.uname.substring(3), design: design, ...req.body}
            	const u = new URLSearchParams(data).toString()
            	visitpage('https://bakery.hackxgpt.com/secretflagendpointbakersonly?' + u)
            	res.render('preview', data)
	    }
        }
    })
})

app.get('/secretflagendpointbakersonly', (req, res) => {
    var hash = crypto.createHash('sha256')
    hash.update(encodeURI(secret + "_" + req.query.username))

    res.cookie('flag', hash.digest('hex'), {overwrite: true})
    res.render('preview', req.query)
})

async function visitpage (url) {
    const browser = await puppeteer.launch({headless: "new", executablePath: '/usr/bin/chromium-browser'})
    const page = await browser.newPage()
    console.log(url)
    page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))
    await page.goto(url)

    await new Promise(resolve => {setTimeout(resolve, 1000)})
    browser.close()
}
