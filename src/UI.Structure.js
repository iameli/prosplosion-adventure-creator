goog.provide("PAC.UIStructure");
PAC.UIStructure = {
    children : [{
        type : 'section',
        title : 'Game Properties',
        children : [{
            type : "text",
            src : "name", //engine is the root.
            title : "Game Name"
        }]
    }, {
        type : "section",
        title : "Current Room",
        children : [{
            type : "button",
            id : "ButWalkablePath",
            states : [[true, "Show Walkable Path"], [false, "Hide Walkable Path"]]
        }, {
            type : "button",
            id : "ButShowPathfindingData",
            states : [[true, "Show Pathfinding Data"], [false, "Hide Pathfinding Data"]]
        }, {
            type : "button",
            id : "ButRebuildPathfindingData",
            title : "Rebuild Pathfinding Data"
        }]
    }]
}