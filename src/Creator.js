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
            });
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
    }
})();
