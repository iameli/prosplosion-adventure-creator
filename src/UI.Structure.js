goog.provide("PAC.UIStructure");
PAC.UIStructure = {
    type : 'blank',
    id : 'MegaRoot',
    children : [{
        type : 'section',
        title : 'Game Properties',
        children : [{
            type : "text",
            src : "name", //engine is the root.
            title : "Game Name"
        }, {
            type : "text",
            src : "shortName", //engine is the root.
            title : "Short Name"
        }, {
            type : "text",
            src : "startRoom", //engine is the root.
            title : "Starting Room"
        }]
    }, {
        type : "section",
        id : "DynDefs",
        title : "Dynamic Definitions",
        src : "dynamicDefinitions",
        each : {
            type : "section",
            src : "name",
            children: [{
                type: "text",
                src: "defaultAnimation",
                title: "Default Animation"
            }]
        }
    }, {
        type : "section",
        id : "CurRoom",
        title : "Current Room",
        children : [{
            type : "text",
            src : "currentRoom.name",
            title : "Room Name"
        }, {
            type : "section",
            src : "currentRoom.dynamics",
            title : "Dynamics",
            each : {
                type : 'section',
                src : "name",
                children : [{
                    type : 'image',
                    src : 'image',
                    title : 'image'
                }, {
                    type : 'text',
                    src : 'id',
                    title : 'Dynamic ID'
                }, {
                    type : 'text',
                    src : 'scale',
                    title : 'Scale'
                }, {
                    type : 'modal',
                    classes : ['codeEditor'],
                    success_title : 'Save',
                    title : 'Edit onClick',
                    children : [{
                        type : 'code',
                        src : 'onClick',
                        param : 'onclick'
                    }]
                }, {
                    type : "button",
                    classes : ["butDynamicDrag"],
                    states : [[true, "Drag"], [false, "Stop Dragging"]]
                }, {
                    type : "button",
                    classes : ["butSavePosition"],
                    title : "Save Position"
                }, {
                    type : 'section',
                    title : 'Delete?',
                    children : [{
                        type : 'button',
                        classes : ['btn-danger', 'deleteDynamic'],
                        title : 'Delete Dynamic'
                    }]
                }]
            },
            children : [{
                type : 'modal',
                id : "AddDynamic",
                title : 'Add Dynamic',
                success_title : 'Add Dynamic',
                children : [{
                    type : 'text',
                    title : 'Name',
                    param : 'name'
                }, {
                    type : 'dropdown',
                    title : 'Definition',
                    options : ['dynamicDefinitions', 'name'],
                    param : 'id'
                }, {
                    type : 'dropdown',
                    title : 'Layer',
                    param : 'layer',
                    options : ['currentRoom.layers', 'name']
                }]
            }]
        }, {
            type : "section",
            src : "currentRoom.layers",
            title : "Layers",
            each : {
                type : 'section',
                src : "name",
                children : [{
                    type : 'text',
                    src : 'scrollSpeed',
                    title : 'Scroll Speed'
                }, {
                    type : 'text',
                    src : 'zIndex',
                    title : 'Z-Index'
                }, {
                    type : 'section',
                    title : 'Delete?',
                    children : [{
                        type : 'button',
                        classes : ['btn-danger', 'deleteLayer'],
                        title : 'Delete Layer'
                    }]
                }]
            },
            children : [{
                type : 'modal',
                id : "AddLayer",
                title : 'Add Layer',
                success_title : 'Add Layer',
                children : [{
                    type : 'text',
                    title : 'Name',
                    param : 'name'
                }, {
                    type : 'text',
                    title : 'Scroll Speed',
                    param : 'scrollSpeed'
                }, {
                    type : 'text',
                    title : 'Z-Index',
                    param : 'zIndex'
                }]
            }]
        }, {
            type : 'section',
            title : 'Pathfinding',
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
    }]
}