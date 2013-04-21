goog.provide("PAC.UIStructure");
PAC.UIStructure = {
    children : [{
        type : 'section',
        title : 'Game Properties',
        children : [
            {
                type : "text",
                src : "name", //engine is the root.
                title : "Game Name"
            },
            {
                type : "text",
                src : "shortName", //engine is the root.
                title : "Short Name"
            },
            {
                type : "text",
                src : "startRoom", //engine is the root.
                title : "Starting Room"
            }
        ]
    }, {
        type : "section",
        title : "Current Room",
        children : [{
            type : "button",
            id : "ButWalkablePath",
            states : [[true, "Show Walkable Path"], [false, "Hide Walkable Path"]]
        }, {
            type : "button",
            id : "ButPathfindingData",
            states : [[true, "Show Pathfinding Data"], [false, "Hide Pathfinding Data"]]
        }, {
            type : "button",
            id : "ButRebuildPathfindingData",
            title : "Rebuild Pathfinding Data"
        }]
    }]
}