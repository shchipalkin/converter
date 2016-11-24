const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// templates
var index = require('./routes/index');
var users = require('./routes/users');

// arguments parser
var options = require("yargs")
    .usage("Usage: $0 [--proxy \"proxy address:port\"]")
    .option("b", {alias: "bounds", describe: "PhantomJS port bounds in format 'bottom:top'", type: "string"})
    .option("p", {alias: "proxy", describe: "Proxy address:port", type: "string"})
    .option("c", {alias: "context", describe: "Web app context to listen on, /gen by default", type: "string"})
    .help("?")
    .alias("?", "help")
    .example("$0 ", "Running app simpliest way")
    .example("$0 --browserPorts=7000:7010", "Running app with browser's port bounds")
    .example("$0 --proxy=10.10.0.120:8080", "Running app using proxy 10.10.0.120:8080")
    .epilog("Copyright 2016 CardsPro.")
    .argv;

// html-2-pdf converter conversion config
var conversion = require("phantom-html-to-pdf")({
    numberOfWorkers: 2,
    timeout: 10000,
    tmpDir: "./reports",
    portLeftBoundary: options.bounds.split(':')[0] || null,
    portRightBoundary: options.bounds.split(':')[1] || null,
    host: '127.0.0.1',
    strategy: "dedicated-process",
    maxLogEntrySize: 1000,
    proxy: options.proxy,
    "proxy-type": options.proxy ? "html" : null
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// converter logic
app.get(options.context || '/gen', function (req, res) {
    console.log(`Start converting from request: ${req.localAddress} ${new Date()}`);
    conversion({html: req.body}, function (err, pdf) {
        console.log(pdf.logs);
        console.log(pdf.numberOfPages);
        pdf.stream.pipe(res);
    });
    console.log(`End converting from request: ${req.localAddress} ${new Date()}`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
