/**
 * Takes care of rendering our controls form the mustache templates, and is the first 
 * responder to events triggered on the control panel. 
 */
goog.require("Mustache");
goog.provide("PAC.UI");
(function() {
    /**
     * Instance a new UI that will fill $(location).html
     */
    var UI = PAC.UI = function(location) {
        var self = this;
        self.idCount = 0;
        $.get('/partials.json', function(data) { //TODO: Error checking here
            self.templates = data;
            var html = self.renderUI(self.structure);
            $(location).html(html);
        })
        self.structure = {children: [
            {
                type: 'section',
                title: 'Game Properties',
                children: [
                    { type: "text", src: "name", title: "Game Name" }
                ]
            },
            {
                type: "section",
                title: "Current Room",
                children: [
                    {
                        type: "button",
                        id: "ButWalkablePath",
                        states: [
                            [true,  "Show Walkable Path"],
                            [false, "Hide Walkable Path"]
                        ]
                    },
                    {
                        type: "button",
                        id: "ButShowPathfindingData",
                        states: [
                            [true,  "Show Pathfinding Data"],
                            [false, "Hide Pathfinding Data"]
                        ]
                    },
                    {
                        type: "button",
                        id: "ButRebuildPathfindingData"

                    }
                ]
            }
        ]}
    }
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
            me.state = me.states[0][0];
            me.title = me.states[0][1];
        }
        if (!me.id) { //Sometimes we don't care, yo. But everything needs an id.
            me.id = "UI_" + self.idCount;
            self.idCount += 1;
        }
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