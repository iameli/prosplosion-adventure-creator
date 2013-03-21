goog.require("PAE.Game");
goog.provide("PAC");
(function() {
    var PAC = window["PAC"] = function(params) {
        $.get(params.gameURL, function(data) {
            data.width = 1024;
            data.height = 768;
            data.container = "GameContainer";
            data.resourceURL = params.resourceURL;
            this.engine = new PAE.Game(data);   
            $('canvas').bind('contextmenu', function(e){
                return false;
            }); 
        })
    };
})();
