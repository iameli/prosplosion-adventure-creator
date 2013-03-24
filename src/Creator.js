goog.require("PAE.Game");
goog.provide("PAC.Creator");

(function() {
    var Creator = PAC.Creator = function(params) {
        var self = this;
        $.ajax({url: params.gameURL, dataType: "text"}).done(function(game) {
            data = {};
            data.width = 1024;
            data.height = 768;
            data.container = "GameContainer";
            data.resourceURL = params.resourceURL;
            self.engine = new PAE.Game(game, data);   
            $('canvas').bind('contextmenu', function(e){
                return false;
            }); 
            self.initUI();
        })
        $(document).ready(function() {
            console.log("Ready!")
        })
    };
    Creator.prototype.initUI = function() {
        var self = this;
        $("#ShowAdmin").on('click', function(e) {
            $("#ShowAdmin").css('display', 'none');
            $("#AdminPanel").css('display', 'block');
            $("#GameBorder").addClass('right');
        })
        $("#HideAdmin").on('click', function(e) {
            $("#AdminPanel").css('display', 'none');
            $("#ShowAdmin").css('display', 'block');
            $("#GameBorder").removeClass('right');
        })
        $('#showWalkable').on('click', function(e) {
            var btn = $('#showWalkable');
            var doThing = btn.attr("data-toggle");
            if (doThing == 'true') {
                PAE.curGame.curRoom.walkableDebug(true);
                btn.attr('data-toggle', "false");
                btn.html("Hide Walkable Path");
            } else {
                PAE.curGame.curRoom.walkableDebug(false);
                btn.attr('data-toggle', "true");
                btn.html("Show Walkable Path");
            }
        })
        $('#showPathing').on('click', function(e) {
            var btn = $('#showPathing');
            var doThing = btn.attr("data-toggle");
            if (doThing == 'true') {
                PAE.curGame.curRoom.pathingDebug(true);
                btn.attr('data-toggle', "false");
                btn.html("Hide Pathfinding Data");
            } else {
                PAE.curGame.curRoom.pathingDebug(false);
                btn.attr('data-toggle', "true");
                btn.html("Show Pathfinding Data");
            }
        })
        $('#rebuildPathing').on('click', function(e) {
            PAE.curGame.curRoom.walkable.buildWalkGraph();
        })
        $('#SaveGame').on('click', function(e) {
            var data = {data: self.engine.serialize()};
            $.ajax({method: "POST", data: data}).done(function(game) {
                
            })
        })
    }
})();
