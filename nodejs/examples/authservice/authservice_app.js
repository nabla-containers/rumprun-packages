/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
//var express = require('../../');
console.log('cwd:');
console.log(process.cwd())

process.chdir(__dirname)

console.log('cwd:');
console.log(process.cwd())

var fs = require('fs');
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser')

var app = express(); 				
var router = express.Router();
var jsonParser = bodyParser.json();//create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });//create application/x-www-form-urlencoded parser

var  log4js = require('log4js');
log4js.configure('log4js.json', {});
var logger = log4js.getLogger('authservice_app');
logger.setLevel(settings.loggerLevel);

var morgan = require('morgan');
if (settings.useDevLogger)
	app.use(morgan('dev'));// log every request to the console
app.use(jsonParser);
app.use(urlencodedParser);
app.use(bodyParser.text({ type: 'text/html' }));//parse an HTML body into a string
app.use(methodOverride());// simulate DELETE and PUT
app.use(cookieParser());// parse cookie


// XXX: this is needed when loaded as an in memory FS using cookfs. For some reason
// we need to read all in sync or some parts of the files are not completely accessible
// when reading by parts later. Don't know exactly what's the isseu on the FS or cookfs side.
// but it's not advisable to build larger than 10k mem FSes.
//
// read content of /authservice/node_modules/iconv-lite/encodings
const testFolder = '/authservice/node_modules/iconv-lite/encodings';
fs.readdirSync(testFolder).forEach(file => {
  console.log(file);
  if (!fs.statSync('/authservice/node_modules/iconv-lite/encodings/'+file).isDirectory()) {
      var contents = fs.readFileSync('/authservice/node_modules/iconv-lite/encodings/'+file, 'utf8');
  }
})


var port = (process.env.PORT || process.env.VCAP_APP_PORT || settings.authservice_port);
var dbtype = process.env.dbtype || "mongo";
var routes = new require('./authservice/routes/index.js')(dbtype, settings); 
var initialized = false;
var serverStarted = false;

logger.info("port==" + port);
logger.info("db type==" + dbtype);

router.get('/', checkStatus);
router.post('/data', getData);
router.post('/login', routes.login);
router.get('/service', serviceName);
router.get('/config/runtime', routes.getRuntimeInfo);

//REGISTER OUR ROUTES so that all of routes will have prefix 
app.use(settings.authContextRoot, router);

startServer();

function startServer() {
	if (serverStarted ) return;
	serverStarted = true;
	app.listen(port);
	console.log('Application started port ' + port);
}

function checkStatus(req, res){
        res.status(200).send('OK');
}

function getData(req, res) {
	var len = parseInt(req.param('size', 1000), 10);
	var str = new Array(len + 1).join('x');
	res.status(200).send(str);
}

function serviceName(req, res){
	res.status(200).send('Auth Service');
}
