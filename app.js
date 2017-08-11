
var express = require('express')
    , http = require('http')
    , proxy = require('express-http-proxy');

var config = require('./config/config.json');

var app = express();


app.configure(function () {
    app.set('port', process.env.PORT || 3344)
    // app.use(express.bodyParser());
    // app.use(express.methodOverride());

    app.all('/api/*', proxy(config.backend, {
        forwardPath: function (req, res) {
            return require('url').parse(req.url).path;
        }
    }));

    app.use(app.router);
    app.use(express.static(__dirname + "/app"));
    // app.use(express.static(__dirname + "/dist"));
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
