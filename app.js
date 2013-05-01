/**
 * This is a fairly simple server for now. Serves up the editor. You can load and save games. 
 * 
 * I'm not sure how to handle resources yet. 
 */

var express = require("express");
var fs = require("fs");
var mustache = require("mustache");
var async = require('async');
var url = require('url');
var spawn = require('child_process').spawn;
var http = require("http");

var app = express();

var argv = require('optimist')
    .default('mode', 'production')
    .describe('mode', 'development or production')
    .argv

var DEVELOPMENT;
if (argv.mode == 'development') {
    DEVELOPMENT = true;
}
else if (argv.mode == 'production') {
    DEVELOPMENT = false;
}
else {
    console.log("Unknown option: " + argv.mode);
    process.exit(1);
}
console.log("Prosplosion Adventure Creator starting in %s mode.", argv.mode);

var timestamp = function(callback) {
    var pad = function(n) {return n<10 ? '0'+n : n}
    var d = new Date();
    return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
}

var plovr = function(callback) {
    var command = 'build';
    var called = false;
    var out = '';
    if (DEVELOPMENT) command = 'serve';
    var ps = spawn('plovr', [command, 'plovr-config.json']);

    ps.stdout.on('data', function(data) {
        out += data;
        if (!called && DEVELOPMENT) {
            called = true;
            callback && callback();
        }
    });
// 
    ps.stderr.on('data', function(data) {
        if (!called && DEVELOPMENT) {
            called = true;
            callback && callback();
        }
    });

    ps.on('close', function(code) {
        if (code == 127) {
            console.log("Hmm, plovr doesn't appear to be installed. Try npm install -g plovr. Alternately install it however you like and put it in your PATH.")
            process.exit(1);
        }
        if (!DEVELOPMENT) callback && callback(out);
    });
}

/**
 * Render the mustache file using params then callback. 
 */
var growMustache = function(file, params, callback) {
    fs.readFile('templates/' + file, function(err, data) {
        if (err) return console.error(err);
        var output = mustache.render(data.toString(), params);
        callback(output);
    })
}

/**
 * Shortcut to growMustache then res.end
 */
var template = function(file, params, res) {
    growMustache(file, params, function(page) {
        res.end(page);
    })
}
app.use(express.bodyParser());

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.use("/static", express.static('static'));
app.use("/engine", express.static('engine'));
app.use("/games", express.static('games'));
/**
 * Display the creator for a game.
 */
app.get('/creator/:game', function(req, res) {
    var game = req.params.game;
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var params = {game: game}
    if (query.fullscreen == 'true') {
        params.fullscreen = true;
    }
    template('creator.html.mustache', params, res);
})


/**
 * Get all the required mustache partials.
 */
app.get('/partials.json', function(req, res) {
    var response = {};
    async.auto({
        names: function(callback) { fs.readdir('templates/partials', callback) },
        files: ["names", function(callback, results) { 
            var eatFile = function(file, callback) { fs.readFile('templates/partials/' + file, 'utf8', callback); }
            async.map(results.names, eatFile, callback) 
        }],
        namedTemplates: ['names', 'files', function(callback, results) {
            var res = {};
            results.names.forEach(function(file, idx) {
                var name = file.slice(0, file.indexOf('.'));
                res[name] = results.files[idx];
            })
            callback(null, res);
        }]
    }, function(err, results) {
        if (err) return console.error(err);
        res.json(results.namedTemplates);
    })
    // async.auto({
        // games: function(callback) { fs.readdir('games', callback) },
        // jsons: ['games', function(callback, results) {
            // async.map(results.games, function(game, callback) { fs.readFile('games/' + game + '/game.json', callback)}, callback);
        // }]}
})

/**
 * We just got the JSON for a game! Update it and save in a new folder.
 */
app.post('/creator/:game', function(req, res) {
    var game = req.params.game;
    var json = req.body.data;
    var ts = timestamp();
    var gameFile = 'games/'+ game +'/game.json';
    var newDir = 'games/'+ game +'/' + ts;
    try {
        JSON.parse(json);
    }
    catch(e) {
        res.writeHead(500);
        res.end();
        return;
    }
    async.series([
        function(callback){fs.unlink(gameFile, callback)},
        function(callback){fs.writeFile(gameFile, json, {}, callback)},
        function(callback){fs.mkdir(newDir, undefined, callback)},
        function(callback){fs.writeFile(newDir + '/game.json', json, {}, callback)}
    ],
        function(err) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end();
            }
            else {
                console.log(game + " saved.")
                res.writeHead(200);
                res.end();
            }
        }
    )
})

/**
 * Get the index of all games installed here. 
 */
app.get('/', function(req, res) {
    console.log("GET /")
    async.auto({
        games: function(callback) { fs.readdir('games', callback) },
        jsons: ['games', function(callback, results) {
            async.map(results.games, function(game, callback) { fs.readFile('games/' + game + '/game.json', callback)}, callback);
        }]}, function(err, results) {
            if (err) return console.log(err);
            var output = [];
            results.jsons.forEach(function(json, idx) {
                var obj = JSON.parse(json);
                var fileName = results.games[idx];
                var name = obj.shortName;
                if (!name) name = fileName;
                var title = obj.name;
                if (!title) title = name;
                output.push({id: name, title: title});
            })
            var params = {games: output};
            template("home.html.mustache", params, res);
        }
    )
})



/**
 * Get the engine either from our cache or the proxy.
 */
plovr(function(out) {
    app.get('/compiled.js', function(req, user_res) {
        if (DEVELOPMENT) {
            var options = {
                host: 'localhost',
                port: 9810,
                path: '/compile?id=main',
                method: 'GET'
            }
            var connection = http.request(options, function(proxy_res) {
                proxy_res.pipe(user_res, {end: true});
            });
            connection.end();
        }
        else {
            user_res.end(out);
        }
    })
    console.log("App listening on port 8080.")
    app.listen(8080);
});


