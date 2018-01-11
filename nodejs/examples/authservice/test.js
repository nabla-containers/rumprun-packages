process.chdir(__dirname)

var express = require('express');
console.log('test authservice')

var fs = require('fs');
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser')

var app = express(); 				
var router = express.Router();
var jsonParser = bodyParser.json();//create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });//create application/x-www-form-urlencoded parser


