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
        self.defIndex = {};
        $.get('/partials.json', function(data) { //TODO: Error checking here
            var engine = self.engine = PAC.getCreator().engine;
            self.templates = data;
            var html = self.renderUI(self.structure, engine);
            $(location).html(html);
            self.callbacks(location);
            callback && callback();
        })
        self.structure = PAC.UIStructure;
    }
    /**
     * Rebuild the UI of this creator into $(location).
     */
    UI.prototype.rebuildUI = function(location) {
        var self = this;
        var elem = $(location);
        var def = self.defIndex[elem.attr('id')];
        var html = self.renderUI(def, self.engine);
        elem.replaceWith(html); 
        self.callbacks(location);
    }
    /**
     * Register all of the first-responder callbacks.
     * UI logic lives here. We handle the initial logic, like a toggle button
     * toggling, then trigger the second-responder events with the relevant information. 
     */
    UI.prototype.callbacks = function(location) {
        var self = this;
        var engine = PAC.getCreator().engine;
        $(location).find('input').each(function(idx, elem) {
            elem = $(elem);
            var id = elem.attr('id');
            var def = self.defIndex[id];
            elem.on('change', function(e) {
                if (def.src) {
                    try {
                        PAC.Util.setEngine(engine, def.src, elem.val());
                    }
                    catch(e) {
                        console.error("Error while trying to change %s: %s", def.src, e);
                    }
                }
            })
        })
        /**
         * Button functionality. 
         */
        $(location).find('button').on('click', function(e) {
            var target = $(e.target);
            var id = target.attr('id');
            var def = self.defIndex[id];
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
            var associate = null;
            if (def.associate) {
                associate = def.associate
            }
            target.trigger({
                type: "PAE-Click",
                PAE_State: state,
                associate: associate
            });
        })
        PAE.EventMgr.trigger(new PAE.Event({
            name: 'creator-changed'
        }))
    }
    /**
     * Recursive function to build the HTML of the page based on all the nodes in the structure.
     * @param {Object} node
     */
    UI.prototype.renderUI = function(startNode, engine) {
        var self = this;
        var node = _.clone(startNode);
        if (!node.id) { //Sometimes we don't care, yo. But everything needs an id.
            node.id = "UI_" + self.idCount;
            self.idCount += 1;
        }
        node.associate = engine;
        self.defIndex[node.id] = node;
        var me = _.clone(node);
        if (me.states) { //Something that cycles through states like a button
            me.state = 0;
            me.title = me.states[0][1];
        }
        if (me.src) {
            var val = null;
            try {
                val = PAC.Util.getEngine(engine, me.src);
            }
            catch(e) {
                console.log("Errored when trying to getEngine for %s, assuming deferred render and ignoring.", me.src);
            }
            me.state = val;
            if (!me.title) {
                me.title = me.state;
            }
        }
        var childData = "";
        if (me.children) {
            me.children.forEach(function(child) {
                childData += self.renderUI(child, engine);
            })
        }
        if (me.each) {
            try {
                me.state.forEach(function(child) {
                    var thisNode = _.clone(me.each);
                    childData += self.renderUI(thisNode, child);
                })
            }
            catch(e) {
                console.log("Errored when trying to enumerate over %s, assuming deferred render and ignoring.", me.src);
            }
        }
        me.children = childData;
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