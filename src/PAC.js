goog.provide("PAC");
goog.require("PAC.Creator");
(function() {
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
                console.error("Error in traversing object: %s has no method %s.", obj, func);
                return null;
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
            console.error("Error in %s: %s", func, e);
        }
    }
})()
