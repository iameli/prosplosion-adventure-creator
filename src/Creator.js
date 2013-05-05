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
                PAE.EventMgr.on('room-initalized', function(e) {
                    self.ui.rebuildUI("#CurRoom");
                })
            });
        })
    };
    /**
     * This guy makes buttons work. Also other things probably.
     */
    Creator.prototype.initUI = function() {
        var self = this;
        $("body")
        .on('click', '#ShowAdmin', function(e) {
            $("#ShowAdmin").css('display', 'none');
            $("#AdminPanel").css('display', 'block');
            $("#GameBorder").addClass('right');
        })
        .on('click', '#HideAdmin', function(e) {
            $("#AdminPanel").css('display', 'none');
            $("#ShowAdmin").css('display', 'block');
            $("#GameBorder").removeClass('right');
        })
        .on('click', '#SaveGame', function(e) {
            var data = {data: self.engine.serialize()};
            $.ajax({method: "POST", data: data}).done(function(game) {
                $("#SaveGame").effect("highlight", {}, 500);
            })
        })
        .on("PAE-Click", '#ButWalkablePath', function(e) {
            self.engine.curRoom.walkableDebug(e.PAE_State);
        })
        .on("PAE-Click", '#ButPathfindingData', function(e) {
            self.engine.curRoom.pathingDebug(e.PAE_State);
        })
        .on("PAE-Click", '#ButRebuildPathfindingData', function(e) {
            self.engine.curRoom.rebuildPathfinding();
        })
        .on("PAE-Click", ".butDynamicDrag", function(e) {
            e.associate.setDraggable(e.PAE_State);
        })
        .on("PAE-Click", ".butSavePosition", function(e) {
            e.associate.savePosition();
            $(this).effect("highlight", {}, 500);
        })
        /**
         * New Layer creation.
         */
        .on("Modal-Submit", '#AddLayer', function(e) {
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
        /**
         * Layer deletion
         */
        .on("PAE-Click", '.deleteLayer', function(e) {
            try {
                var name = e.associate.getName();
                var room = self.engine.getCurrentRoom();
                room.removeLayer(name);
                self.ui.rebuildUI("#CurRoom");
            }
            catch(e) {
                PAC.errorElem($(this), e);
            }
        })
        /**
         * New Dynamic creation
         */
        .on("Modal-Submit", '#AddDynamic', function(e) {
            try {
                var attrs = e.params;
                var room = self.engine.getCurrentRoom();
                var coords = room.getMid();
                attrs.x = coords.x;
                attrs.y = coords.y;
                room.addDynamic(attrs, true);
                $(this).modal('hide');
                self.ui.rebuildUI("#CurRoom");
            }
            catch(e) {
                PAC.errorElem($(this).find('.modal-title'), e);
            }
        })
        /**
         * Dynamic deletion
         */
        .on("PAE-Click", '.deleteDynamic', function(e) {
            try {
                var name = e.associate.getName();
                var room = self.engine.getCurrentRoom();
                room.removeDynamic(name);
                self.ui.rebuildUI("#CurRoom");
            }
            catch(e) {
                PAC.errorElem($(this), e);
            }
        })
        /**
         * New Dynamic creation
         */
        .on("Modal-Submit", '.codeEditor', function(e) {
            try {
                var id = $(this).find('.codeLivesHere');
            }
            catch(e) {
                PAC.errorElem($(this).find('.modal-title'), e);
            }
        })
    }
})();
