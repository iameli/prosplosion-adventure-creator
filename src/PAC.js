goog.provide("PAC");
goog.require("PAC.Creator");
(function() {
    /**
     * Send an error effect to elem.
     */
    PAC.errorElem = function(elem, error) {
        elem = $(elem);
        console.error(error);
        elem.tooltip({trigger: 'manual', title: error}).tooltip('show');
        setTimeout(function() {
            elem.tooltip('destroy');
        }, 5000)
        elem.effect("shake", {});
    }
    PAC.Util = {};
    /**
     * Traverse the engine using gets and return the final thing.
     */
    PAC.Util.getEngine = function(obj, str) {
        if (typeof str == "string") {
            str = str.split('.');
        }
        while (str.length > 0) {
            var node = str.shift();
            var func = 'get' + PAE.Util.camelCase(node);
            try {
                obj = obj[func]();
            }
            catch(e) {
                throw ("Error in traversing object: " + obj + " has no method " + func + "()");
            }
        }
        return obj;
    }
    /**
     * Traverse the engine using gets and set the final thing to data.
     * @param {Object} obj
     * @param {Object} str
     * @param {Object} data
     */
    PAC.Util.setEngine = function(obj, str, data) {
        if (typeof str == "string") {
            str = str.split('.');
        }
        var finalNode = str.pop();
        var location = PAC.Util.getEngine(obj, str);
        var func = 'set' + PAE.Util.camelCase(finalNode)
        try {
            location[func](data);
        }
        catch(e) {
            throw ("Error in " + func + ": " + e);
        }
    }
})()
