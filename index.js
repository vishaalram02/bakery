const express = require('express')
const path = require('path');
const app = express()
const port = 3000

app.listen(port)
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')));
app.get('/u/:uname', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!'})
})