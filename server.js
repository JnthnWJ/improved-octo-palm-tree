const express = require('express')
const morgan = require('morgan')
const path = require('path')

// init app
const app = express()

// log everything
app.use(morgan('dev'))

// serve from `./app`
app.use(express.static(__dirname))

// listen for requests
app.listen(process.env.PORT || 3000)
