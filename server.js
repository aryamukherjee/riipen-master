var express = require('express');
var redis = require('redis'); 
var mysql = require('mysql');
var port = process.env.PORT || 8080;

var morgan = require('morgan'); 
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override'); 

var app = express(); 
var rclient = redis.createClient();

//connect to mysql
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'riipen_master'
});

conn.connect(function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log('Connected to MySQL');
    }
});

rclient.on('connect', function(res){
    console.log('Connected to redis!');
});

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({'extended':'true'})); 
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

require('./routes/routes.js')(app, rclient, conn);

app.listen(port);
console.log("Server listening on port " + port);