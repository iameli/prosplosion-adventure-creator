/**
 * Takes care of rendering our controls form the mustache templates, and is the first 
 * responder to events triggered on the control panel. 
 */
goog.require("Mustache");
goog.require("PAC.UIStructure")
goog.provide("PAC.UI");
(function() {
    /**
     * Instance a new UI that will fill $(location).html
     */
    var UI = PAC.UI = function(location, callback) {
        var self = this;
        self.idCount = 0;
        $.get('/partials.json', function(data) { //TODO: Error checking here
            self.templates = data;
            self.rebuildUI(location);
            callback && callback();
        })
        self.structure = PAC.UIStructure;
    }
    /**
     * Rebuild the UI of this creator into $(location).
     */
    UI.prototype.rebuildUI = function(location) {
        var self = this;
        self.defIndex = {};
        var html = self.renderUI(self.structure);
        $(location).html(html);
        self.callbacks(location);
    }
    /**
     * Register all of the first-responder callbacks.
     * UI logic lives here. We handle the initial logic, like a toggle button
     * toggling, then trigger the second-responder events with the relevant information. 
     */
    UI.prototype.callbacks = function(location) {
        var self = this;
        $(location).find('button').on('click', function(e) {
            var target = $(e.target);
            var id = target.attr('id');
            var def = self.getDef(id);
            var state = null;
            if (def.states) {
                var stateNum = parseInt(target.attr("data-state"));
                state = def.states[stateNum][0];
                var newStateNum = stateNum + 1;
                if (!def.states[newStateNum]) newStateNum = 0;
                var newState = def.states[newStateNum];
                target.attr("data-state", newStateNum);
                target.html(newState[1]);
            }
            target.trigger({
                type: "PAE-Click",
                PAE_State: state
            });
        })
    }
    /**
     * Get the UI definition for a given ID.
     */
    UI.prototype.getDef = function(id) {
        var self = this;
        return self.defIndex[id];
    }
    /**
     * Recursive function to build the HTML of the page based on all the nodes in the structure.
     * @param {Object} node
     */
    UI.prototype.renderUI = function(node) {
        var self = this;
        var me = _.clone(node);
        var childData = "";
        if (me.children) {
            me.children.forEach(function(child) {
                childData += self.renderUI(child);
            })
        }
        me.children = childData;
        if (me.states) { //Something that cycles through states like a button
            me.state = 0;
            me.title = me.states[0][1];
        }
        if (!me.id) { //Sometimes we don't care, yo. But everything needs an id.
            me.id = "UI_" + self.idCount;
            self.idCount += 1;
        }
        self.defIndex[me.id] = me;
        var output;
        if (self.templates[me.type]) {
            output = Mustache.render(self.templates[me.type], me);
        }
        else { //We can have harmless nodes with children, like the root node.
            output = childData;
        }
        return output;
    }
    
})();