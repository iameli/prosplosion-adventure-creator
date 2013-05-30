/**
 * Series of utils useful for hacking games together while the engine is still under construction.
 */
var argv = require('optimist')
    .demand(['action', 'game'])
    .describe('action', 'resources, gen_def')
    .describe('game', 'game to act on')
    .describe('file', 'gen_def only: svg file into which we peek')
    .argv
var path = require('path')
var fs = require('fs')
var parseString = require('xml2js').parseString;

var gameDir = path.resolve('games', argv.game);
if (argv.action == 'resources') {
    var files = fs.readdirSync(path.resolve(gameDir, 'resources'));
    var svgs = [];
    var audios = []
    files.forEach(function(file) {
        var ext = file.split('.').pop();
        if (ext.toLowerCase() == 'svg') svgs.push(file);
        else if (ext.toLowerCase() == 'ogg') audios.push(file);
    })
    var obj = {svgs: svgs, audios: audios};
    console.log(JSON.stringify(obj));
}
else if (argv.action == 'gen_def') {
    var content = fs.readFileSync(path.resolve(gameDir, 'resources', argv.file), 'utf8');
    parseString(content, function (err, xml) {
        var obj = {
            "width": 3440,
            "height": 810,
            "defaultAnimation": "idle",
            "frameRate": 1,
            "vectorAnimations": {
                "idle": []
            },
            "talkNoises": [],
            "speed": 100,
            "listening": false,
            "onClick": {
                "__serializedFunction": true,
                "func": "function (e) {}"
            }
        }
        obj.name = argv.file.split('.')[0];
        obj.vectorAnimations.idle.push(argv.file);
        obj.width = parseInt(xml.svg.$.width)
        obj.height = parseInt(xml.svg.$.height)
        console.log(JSON.stringify(obj));
    });
}
