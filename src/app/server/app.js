var express = require('express');
var errorhandler = require('errorhandler')
var config = require('./config');
var http = require('http');
var path = require('path');
var log = require('./libs/log')(module);
var mongoose = require('./libs/mongoose');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var cookieParser = require('cookie-parser');
app.use(cookieParser())

var session = require('express-session');
var MongoStore = require('connect-mongodb-session')(session);

app.use(session({
    secret: config.get("session:secret"),
    keys: [config.get("session:key")],
    cookie: config.get("session:cookie"),
    store: new MongoStore({ uri: config.get('mongoose:uri'), collection: "sessions"})
}));

// app.use(function(req, res, next){
//     req.session.numberOfVisist = req.session.numberOfVisist + 1 || 1;
//     res.send("Visits: " + req.session.numberOfVisist);
// });


http.createServer(app).listen(config.get('port'), function(){
    log.info('Express server is listining on port ' + config.get('port'));
});

// Midleware

var services = require('./db/allmodels');
app.get('/getUser/:name', function(req, res, next){
    services.getUserByName(req, res, next);
});

app.get('/checkPassword/:name/:password', function(req, res, next){
    services.checkUserPassword(req, res, next);
});

app.post('/addUser', function(req, res, next){
    services.addUser(req, res, next);
});

app.get('/getProjects/:name', function(req, res, next){
    services.getProjects(req, res, next);
});

app.post('/addProject', function(req, res, next){
    services.addProject(req, res, next);
});

app.post('/editProject', function(req, res, next){
    services.editProject(req, res, next);
});

app.get('/removeProject/:project_id', function(req, res, next){
    services.removeProject(req, res, next);
});

app.get('/removeProjectAndTasks/:project_id', function(req, res, next){
    services.removeProjectAndTasks(req, res, next);
});

app.post('/addTask', function(req, res, next){
    services.addTask(req, res, next);
});

app.post('/editTask', function(req, res, next){
    services.editTask(req, res, next);
});

app.get('/removeTask/:task_id', function(req, res, next){
    services.removeTask(req, res, next);
});

app.get('/getTasksList/:username/:project_id/:date', function(req, res, next){
    services.getTasksList(req, res, next);
});

app.get('/completeTask/:task_id', function(req, res, next){
    services.completeTask(req, res, next);
});

app.get('/getTaskProgress/:name', function(req, res, next){
    services.getTaskProgress(req, res, next);
});

// обработчик ошибки
app.use(function(err, req, res, next) {
    if (app.get('env') == 'development') {
        var errorHandler = errorhandler();
        errorHandler(err, req, res, next);
    } else {
        res.send(500);
    }
});

