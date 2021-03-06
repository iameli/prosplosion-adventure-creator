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
    var updatePane = function() {
        $('#AdminPanel').jScrollPane({
            hideFocus: true,
            contentWidth: '0px'
        });
    }
    var UI = PAC.UI = function(location, callback) {
        var self = this;
        self.idCount = 0;
        self.defIndex = {};
        self.codeIndex = {};
        updatePane();
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
        $('.willBeCode').each(function(idx, codeDiv) {
            var old = $(codeDiv);
            var code = old.html();
            var parent = old.attr('data-parent');
            old.html("");
            var codeMirror = CodeMirror(function(elt) {
              codeDiv.parentNode.replaceChild(elt, codeDiv);
            }, {value: code, mode: 'javascript'});
            self.codeIndex[parent] = codeMirror;
        })
    }
    
    /**
     * Register all of the first-responder callbacks.
     * UI logic lives here. We handle the initial logic, like a toggle button
     * toggling, then trigger the second-responder events with the relevant information. 
     */
    UI.prototype.callbacks = function(location) {
        var self = this;
        var engine = PAC.getCreator().engine;
         /**
         * Update the scrollbar when the size of the  div changes.
         */
        $('body').on('shown', '.accordion-body', function(e) {
            $(this).css('overflow', 'visible');
            updatePane();
        })
        .on('hide', '.accordion-body', function(e) {
            $(this).css('overflow', 'hidden');
            updatePane();
        })
        .on('hidden', '.accordion-body', function(e) {
            updatePane();
        })
        .on('shown', '.modal', function() {
            $(this).find('.codeLivesHere').each(function(idx, div) {
                var id = $(div).attr('id');
                self.codeIndex[id].refresh();
            })
        })
        /**
         * Validate input when you change something.
         */
        .on('change', 'input', function(e) {
            var elem = $(this);
            var id = elem.attr('id');
            var def = self.defIndex[id];
            elem.tooltip('destroy');
            var engine = def.associate;
            if (def.src) {
                try {
                    PAC.Util.setEngine(engine, def.src, elem.val());
                    elem.effect("highlight", {});
                }
                catch(e) {
                    PAC.errorElem(elem, "Error while trying to change " + def.src + ": " + e);
                }
                finally {
                    elem.val(PAC.Util.getEngine(engine, def.src));
                }
            }
        })
        /**
         * Destroy error tooltips when you click on text boxes.
         */
        .on('click', 'input', function(e) {
            $(this).tooltip('destroy');
        })
        /**
         * Button functionality. 
         */
        .on('click', 'button', function(e) {
            var target = $(e.target);
            var id = target.attr('id');
            var def = self.defIndex[id];
            var state = null;
            if (def && def.states) {
                var stateNum = parseInt(target.attr("data-state"));
                state = def.states[stateNum][0];
                var newStateNum = stateNum + 1;
                if (!def.states[newStateNum]) newStateNum = 0;
                var newState = def.states[newStateNum];
                target.attr("data-state", newStateNum);
                target.html(newState[1]);
            }
            var associate = null;
            if (def && def.associate) {
                associate = def.associate
            }
            target.trigger({
                type: "PAE-Click",
                PAE_State: state,
                associate: associate
            });
        })
        /**
         * Modal form submission.
         */
        .on('click', '.modal-done', function(e) {
            var modal = $($(this).attr('data-parent'));
            var obj = {};
            var getParams = function() {
                var elem = $(this);
                if (elem.attr('data-param') && elem.val() != "") {
                    obj[elem.attr('data-param')] = elem.val();
                }
            }
            modal.find('input').each(getParams);
            modal.find('select').each(getParams);
            /**
             * If this modal has us editing code, some different shit happens.
             */
            if (modal.hasClass('codeEditor')) {
                var containers = modal.find('.codeLivesHere');
                _.forEach(containers, function(container) {
                    var container = $(container);
                    var id = container.attr('id');
                    var editor = self.codeIndex[id];
                    var def = self.defIndex[id];
                    var output = editor.getDoc().getValue();
                    output = "var func = " + output;
                    try {
                        eval(output);
                        PAC.Util.setEngine(def.associate, def.src, func);
                        modal.modal('hide');
                    }
                    catch(e) {
                        console.error(e);
                        PAC.errorElem(modal.find('.modal-title'), e);
                    }
                })
            }
            modal.trigger({
                type: "Modal-Submit",
                params: obj
            })
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
        //Something that cycles through states like a button
        if (me.states) { 
            me.state = 0;
            me.title = me.states[0][1];
        }
        // If we coorespond to something to change, get at that thing.
        if (me.src) {
            var val = null;
            try {
                val = PAC.Util.getEngine(engine, me.src);
            }
            catch(e) {
                console.log("Errored when trying to getEngine for %s, assuming deferred render and ignoring.", me.src, e);
            }
            if (typeof val == 'function') val = val.toString();
            me.state = val;
            if (!me.title) {
                me.title = me.state;
            }
        }
        //If we get options from somewhere, do that.
        if (me.options) {
            var val = [];
            try {
                var optObjects = PAC.Util.getEngine(engine, me.options[0]);
                _.forEach(optObjects, function(obj) {
                    var func = 'get' + PAE.Util.camelCase(me.options[1]);
                    val.push(obj[func]());
                })
            }
            catch(e) {
                console.log("Errored when trying to options for %s, assuming deferred render and ignoring.", me.options, e);
            }
            me.options = val;
        }
        // Render any children.
        var childData = "";
        if (me.children) {
            me.children.forEach(function(child) {
                childData += self.renderUI(child, engine);
            })
        }
        if (me.each) {
            try {
                _.forEach(me.state, function(child) {
                    var thisNode = _.clone(me.each);
                    childData += self.renderUI(thisNode, child);
                })
            }
            catch(e) {
                console.log("Errored when trying to enumerate over %s, assuming deferred render and ignoring.", me.src, e);
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

var e = function(e) {
    if (e.item === null) {
        this.dynamic.playText({
            text : "Hiii, I'm Skepto the ghost. Thanks for helping me on my adventures!"
        });
    } else if (e.item == 'snake') {
        this.dynamic.playText({
            text : "That's my favorite snake, Dr. Hiss!"
        });
    } else {
        this.dynamic.playText({
            text : "I'm not sure what to make of that."
        });
    }
}

})();