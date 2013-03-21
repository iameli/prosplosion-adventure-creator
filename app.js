/**
 * This is a fairly simple server for now. Serves up the editor. You can load and save games. 
 * 
 * I'm not sure how to handle resources yet. 
 */

var express = require("express");
var fs = require("fs");
var mustache = require("mustache");
var async = require('async');

var app = express();

var timestamp = function() {
    var pad = function(n) {return n<10 ? '0'+n : n}
    var d = new Date();
    return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
}

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
    template('creator.html.mustache', {game: game}, res);
})

/**
 * 
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
                var name = results.games[idx];
                output.push({id: name, title: name});
            })
            var params = {games: output};
            template("home.html.mustache", params, res);
        }
    )
})
app.listen(8080);