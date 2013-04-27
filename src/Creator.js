goog.require("PAE.Game");
goog.require("PAC.UI");
goog.provide("PAC.Creator");

/**
 * PAC.Creator is the base class for everything else. 
 * 
 * It takes as params a gameURL and something else probably.
 */
(function() {
    /**
     * A Prosplosion Adventure Creator. It maintains a PAE within it.
     */
    var Creator = PAC.Creator = function(params) {
        var self = this;
        PAC.getCreator = function() {return self};
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
        })
        $(document).ready(function() {
            self.ui = new PAC.UI("#GameAccordion", function() {
                self.initUI();
                PAE.EventMgr.on('creator-changed', function(e) {
                    self.initUI();
                })
            });
        })
    };
    /**
     * This guy makes buttons work. Also other things probably.
     */
    Creator.prototype.initUI = function() {
        var self = this;
        PAE.EventMgr.on('room-initalized', function(e) {
            self.ui.rebuildUI("#CurRoom");
        })
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
        $('#SaveGame').on('click', function(e) {
            var data = {data: self.engine.serialize()};
            $.ajax({method: "POST", data: data}).done(function(game) {
                $("#SaveGame").effect("highlight", {}, 500);
            })
        })
        $("#ButWalkablePath").on("PAE-Click", function(e) {
            self.engine.curRoom.walkableDebug(e.PAE_State);
        })
        $("#ButPathfindingData").on("PAE-Click", function(e) {
            self.engine.curRoom.pathingDebug(e.PAE_State);
        })
        $("#ButRebuildPathfindingData").on("PAE-Click", function(e) {
            self.engine.curRoom.rebuildPathfinding();
        })
        $(".butDynamicDrag").on("PAE-Click", function(e) {
            e.associate.setDraggable(e.PAE_State);
        })
        /**
         * New Layer creation.
         */
        $('#AddLayer').on("Modal-Submit", function(e) {
            try {
                var l = new PAE.Layer(e.params);
                var room = self.engine.getCurrentRoom();
                room.addLayer(l);
                $(this).modal('hide');
                self.ui.rebuildUI("#CurRoom");
            }
            catch(e) {
                PAC.errorElem($(this).find('.modal-title'), e);
            }
        })
    }
})();
