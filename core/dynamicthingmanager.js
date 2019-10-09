ig.module('game.core.dynamicthingmanager')
.requires()
.defines(function(){
"use strict";

window.DynamicThingManager = ig.Class.extend({

    maxCellsEver: 9,
    cellCommands: ['up', 'down', 'left', 'right', 'opacity', 'show', 'hide', 'bright', 'unbright', 'restart', 'playSound',
            'accelerateLeft', 'accelerateRight', 'accelerateUp', 'accelerateDown', 'light',
            'flipHorizontal', 'flipVertical', 'rotate', 'pivot', 'zIndex', 'crop', 'text', 'font',
            'secondsAngle', 'secondsAngleInSteps', 'minutesAngle', 'minutesAngleInSteps',
            'hoursAngle', 'hoursAngleInSteps', 'grab', 'ungrab'],
    paramFreeCommands: ['bright', 'unbright', 'flipHorizontal', 'flipVertical',
            'secondsAngle', 'secondsAngleInSteps', 'minutesAngle', 'minutesAngleInSteps',
            'hoursAngle', 'hoursAngleInSteps', 'grab', 'ungrab'],
    standAloneCommands: ['restart', 'playSound', 'say'],
    modes: ['default', 'move', 'action', 'rise', 'fall', 'mounted rise', 'mounted fall',
            'climb', 'swim', 'create', 'sit', 'lie', 'start',
            'state 0', 'state 1', 'state 2', 'state 3', 'state 4', 'state 5',
            'state 6', 'state 7', 'state 8', 'state 9', 'state 10',
            'odd state', 'even state', 'negative state', 'positive state', 'neutral state',
            'private', 'randomize', 'private randomize', 'moved',
            'every minute', 'every 2 minutes', 'every 3 minutes', 'every 4 minutes', 'every 5 minutes',
            'every 10 minutes', 'every 15 minutes', 'every 30 minutes', 'every hour',
            'every 3 hours', 'every 6 hours', 'every 12 hours', 'every day'],
    secondsMax: 15,
    secondsMaxInHolder: 60 * 60,
    framesPerSecond: 60,
    frameVariantsMax: 4,
    pivotMax: 200,
    otherMax: 600,
    rotationMax: 10000,
    accelerateMax: 2,
    degreesToAngleFactor: Math.PI / 180,
    lineBreakString: '[break]',
    commaString: '[comma]',
    colonString: '[colon]',
    prefixIfPlainText: '0: cell 1 opacity 1, font white, text ',

    getParsedFrameData: function(s, maxCells, infoByReference) {
        var data = { 'default' : {} };

        if (ig.game.speedWatcher.lastAverageFPS) {
            this.framesPerSecond = parseInt(ig.game.speedWatcher.lastAverageFPS).limit(10, 60);
        }

        if (s) {
            s = this.normalizeString(s);
            infoByReference.containsZIndexHandling = s.indexOf('zIndex') >= 0;
            infoByReference.containsGrabbing = s.indexOf(' grab') >= 0;
            infoByReference.containsLight = s.indexOf('light') >= 0;
            for (var modeI = 0; modeI < this.modes.length; modeI++) {
                var mode = this.modes[modeI];
                data[mode] = {};
                this.setParsedFrameDataOfNormalizedString(mode, s, data[mode], maxCells);
                if ( !data[mode] || ml.Misc.getObjectLength( data[mode] ) == 0 ) {
                    delete data[mode];
                }
            }

            var failedToInterpret = !data['default'];
            if (failedToInterpret) {
                s = ig.game.strings.replaceAll(s, "\n", this.lineBreakString);
                s = ig.game.strings.replaceAll(s, this.commaString, ',');
                s = ig.game.strings.replaceAll(s, ':', this.colonString);
                s = this.prefixIfPlainText + s;
                this.setParsedFrameDataOfNormalizedString('default', s, data['default'], maxCells);
            }
        }
        
        if ( !data['default'] ) { data['default'] = {}; }

        // console.log( JSON.stringify(data) );
        return data;
    },
    
    setParsedFrameDataOfNormalizedString: function(mode, s, dataOfMode, maxCells) {
        var lines = s.split("\n");
        var currentParseMode = 'default';
        
        for (var i = 0; i < lines.length; i++) {
            var line = ig.game.strings.trim( lines[i] );
            if (line && line != '') {
                if ( this.modes.indexOf(line) >= 0 ) {
                    currentParseMode = line;
                }
                else if ( line.length >= 2 && this.modes.indexOf( line.substr(0, line.length - 1) ) >= 0 ) {
                    currentParseMode = line.substr(0, line.length - 1);
                }
                else if (mode == currentParseMode) {
                    if (dataOfMode == null) { dataOfMode = {}; }
                    
                    var timeCommands = line.split(':');
                    if (timeCommands.length == 2) {
                        var times = timeCommands[0].split('-');
                        if ( times.length <= 2 && this.getIsNumber( times[0] ) ) {
                            var frame = parseInt( Number(times[0]) * this.framesPerSecond );
                            var frameName = 'f' + frame + '_1';
                            if ( dataOfMode[frameName] ) { frameName = 'f' + frame + '_2'; }
                            if ( dataOfMode[frameName] ) { frameName = 'f' + frame + '_3'; }

                            dataOfMode[frameName] = this.getCommands(timeCommands[1], maxCells);
                            
                            if (times.length == 2) {
                                var targetFrame = parseInt( Number(times[1]) * this.framesPerSecond );
                                dataOfMode[frameName].spreadOverFrames = targetFrame - frame;
                            }

                        }
                    }
                    
                }
            }
        }
    },
    
    getIsNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    normalizeString: function(s) {
        s = "\n" + s;
        s = s.toLowerCase();
        s = s.replace(/\r\n/g, "\n");
        s = ig.game.strings.removeComments(s);
        
        var interpretAsPlainText = s.indexOf(':') === -1;
        if (interpretAsPlainText) {
            s = ig.game.strings.replaceAll(s, "\n", this.lineBreakString);
            s = ig.game.strings.replaceAll(s, ",", this.commaString);
            s = ig.game.strings.replaceAll(s, ":", this.colonString);
            s = this.prefixIfPlainText + s;
        }
        else {
            s = ig.game.strings.replaceAll(s, '  ', ' ');
            s = ig.game.strings.replaceAll(s, ' :', ':');
            s = ig.game.strings.replaceAll(s, 's:', ':');
            s = ig.game.strings.replaceAll(s, 's-', '-');
            s = ig.game.strings.replaceAll(s, "\\,", this.commaString);
            s = ig.game.strings.replaceAll(s, "\\:", this.colonString);
            s = ig.game.strings.replaceAll(s, 'z-index', 'zIndex');
            s = ig.game.strings.replaceAll(s, 'z index', 'zIndex');
            s = ig.game.strings.replaceAll(s, 'flip horizontal', 'flipHorizontal');
            
            s = ig.game.strings.replaceAll(s, 'hours angle', 'hoursAngle');
            s = ig.game.strings.replaceAll(s, 'hour angle', 'hoursAngle');
            s = ig.game.strings.replaceAll(s, 'minutes angle', 'minutesAngle');
            s = ig.game.strings.replaceAll(s, 'minute angle', 'minutesAngle');
            s = ig.game.strings.replaceAll(s, 'seconds angle', 'secondsAngle');
            s = ig.game.strings.replaceAll(s, 'second angle', 'secondsAngle');
            s = ig.game.strings.replaceAll(s, 'secondsAngle in steps', 'secondsAngleInSteps');
            s = ig.game.strings.replaceAll(s, 'minutesAngle in steps', 'minutesAngleInSteps');
            s = ig.game.strings.replaceAll(s, 'hoursAngle in steps', 'hoursAngleInSteps');

            s = ig.game.strings.replaceAll(s, 'flip vertical', 'flipVertical');
            s = ig.game.strings.replaceAll(s, 'accelerate left', 'accelerateLeft');
            s = ig.game.strings.replaceAll(s, 'accelerate right', 'accelerateRight');
            s = ig.game.strings.replaceAll(s, 'accelerate up', 'accelerateUp');
            s = ig.game.strings.replaceAll(s, 'accelerate down', 'accelerateDown');
            s = ig.game.strings.replaceAll(s, 'plays sound', 'playSound');
            s = ig.game.strings.replaceAll(s, 'play sound', 'playSound');
            
            if ( s.indexOf(' text ') >= 0 ) {
                s = ig.game.strings.replaceAll(s, ', hide', ', opacity 0');
                s = ig.game.strings.replaceAll(s, ', show', ', opacity 1');
                s = ig.game.strings.replaceAll(s, 'cells hide', 'cells opacity 0');
                s = ig.game.strings.replaceAll(s, 'cells show', 'cells opacity 1');
                for (var i = 1; i <= this.maxCellsEver; i++) {
                    s = ig.game.strings.replaceAll(s, 'cell ' + i + ' hide', 'cell ' + i + ' opacity 0');
                    s = ig.game.strings.replaceAll(s, 'cell ' + i + ' show', 'cell ' + i + ' opacity 1');
                }
            }
            else {
                s = ig.game.strings.replaceAll(s, 'hide', 'opacity 0');
                s = ig.game.strings.replaceAll(s, 'show', 'opacity 1');
            }
        }
       
        return s;
    },

    getCommands: function(s, maxCells) {
        var commandsForThisCell = {};
        var cell = 'e1';

        var commands = s.split(',');
        var lastCellsToApplyToCommand = null;
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i].trim();

            var cellsToApplyTo = [];
            var commandAction = null;

            if ( command.indexOf('cells ') >= 0 ) {
                for (var j = 1; j <= maxCells; j++) {
                    cellsToApplyTo.push(j);
                }
                commandAction = command.substr('cells '.length);
                
            }
            else if ( command.indexOf('cell ') >= 0 ) {
                var thisCell = parseInt( command.substr('cell '.length, 1) );
                if (thisCell >= 1 && thisCell <= maxCells) {
                    cellsToApplyTo.push(thisCell);
                }
                commandAction = command.substr('cell n '.length);
            }
            else if ( command.indexOf('say ') === 0 ) {
                var text = command.substr('say '.length).trim().toLowerCase();
                if (text) {
                    text = ig.game.strings.replaceAll(text, this.commaString, ',');
                    text = ig.game.strings.replaceAll(text, this.colonString, ':');
                    commandsForThisCell.say = text;
                }
            }
            else if ( this.standAloneCommands.indexOf(command) >= 0 ) {
                commandsForThisCell[command] = true;
            }
            else if (lastCellsToApplyToCommand) {
                cellsToApplyTo = ig.game.cloneObject(lastCellsToApplyToCommand);
                commandAction = command;
            }

            if (commandAction && cellsToApplyTo && cellsToApplyTo.length >= 1) {
                
                commandAction = commandAction.trim();
                for (var cell = 0; cell < cellsToApplyTo.length; cell++) {
                    var firstSpace = commandAction.indexOf(' ');

                    if (firstSpace >= 1) {
                        var commandName = commandAction.substr(0, firstSpace);
                        if ( this.cellCommands.indexOf(commandName) >= 0 ) {

                            var commandParams = commandAction.substr(firstSpace + 1).trim();
                            var name = 'e' + cellsToApplyTo[cell];
                            if (!commandsForThisCell[name]) { commandsForThisCell[name] = {}; }

                            commandParams = this.getCommandParams(commandName, commandParams, maxCells);
                            if (commandParams != null) {
                                commandsForThisCell[name][commandName] = commandParams;
                            }

                        }

                    }
                    else {
                        commandParams = this.getCommandParams(commandAction, null, maxCells);
                        if (commandParams != null) {
                            var name = 'e' + cellsToApplyTo[cell];
                            if (!commandsForThisCell[name]) { commandsForThisCell[name] = {}; }
                            commandsForThisCell[name][commandAction] = commandParams;
                        }

                    }
                }
            }

            if (cellsToApplyTo) { lastCellsToApplyToCommand = ig.game.cloneObject(cellsToApplyTo); }
        }

        return commandsForThisCell;
    },
    
    getCommandParams: function(name, params, maxCells) {
        if (name == 'opacity') {
            if (params.length > '0.000'.length) {
                params = params.substr(0, '0.000'.length);
            }
            params = parseFloat(params);
            if (params < 0 || params > 1) { params = null; }

        }
        else if (name == 'text') {
            if (params == null) {
                params = '';
            }
            else {
                params = String(params);
                params = ig.game.strings.replaceAll(params, this.commaString, ',');
                params = ig.game.strings.replaceAll(params, this.colonString, ':');
                
                var parts = params.split(this.lineBreakString);
                for (var i = 0; i < parts.length; i++) {
                    parts[i] = ig.game.strings.cutStringLength( parts[i], 200, true );
                }
                params = parts.join(this.lineBreakString);
            }
        
        }
        else if (name == 'font') {
            params = String(params).trim().toLowerCase();
            if (params) {
                var isSmall =  params.indexOf('small') >= 0;
                var isBlack =  params.indexOf('black') >= 0;
                var isWhite =  params.indexOf('white') >= 0;
                params = ig.game.strings.replaceAll(params, 'small', '');
                params = ig.game.strings.replaceAll(params, 'black', '');
                params = ig.game.strings.replaceAll(params, 'white', '');
                if ( params.trim() == '' ) {
                    if      (isBlack && isSmall)  { params = 'blackSmallFont'; }
                    else if (isBlack)             { params = 'blackFont'; }
                    else if (isWhite && isSmall)  { params = 'whiteSmallFont'; }
                    else if (isWhite)             { params = 'whiteFont'; }
                    else                          { params = null; }
                }
                else {
                    params = null;
                }
            }
            else {
                params = null;
            }
        
        }
        else if ( name.indexOf('accelerate') === 0 ) {
            params = parseFloat(params);
            if ( Math.abs(params) > this.accelerateMax ) { params = parseInt(params).limit(-this.accelerateMax, this.accelerateMax); }

        }
        else if ( name.indexOf('light') === 0 ) {
            params = params.split(' ');
            if (params.length == 3) {
                for (var paramI = 0; paramI < params.length; paramI++) {
                    var thisParam = parseInt( params[paramI] );
                    if (thisParam >= 0 && thisParam <= 255) {
                        params[paramI] = thisParam;
                    }
                    else {
                        params = null;
                        break;
                    }
                }
            }

        }
        else if ( this.paramFreeCommands.indexOf(name) >= 0 ) {
            params = true;

        }
        else if ( params && params.indexOf(' ') >= 1 ) {
            params = params.split(' ');
            for (var paramI = 0; paramI < params.length; paramI++) {
                var thisParam = parseFloat( params[paramI] );

                if (name == 'pivot') {
                    if (thisParam >= -this.pivotMax && thisParam <= this.pivotMax) {
                        params[paramI] = thisParam;
                    }
                    else {
                        params = null;
                        break;
                    }
                }
                else if (name == 'crop') {
                    if (thisParam >= -this.otherMax && thisParam <= this.otherMax) {
                        params[paramI] = parseInt(thisParam);
                    }
                    else {
                        params = null;
                        break;
                    }
                }
                else {
                    if (thisParam >= 1 && thisParam <= maxCells) {
                        params[paramI] = thisParam;
                    }
                    else {
                        params = null;
                        break;
                    }
                }
            }

            if (name == 'crop' && params.length == 4) {
                var x1 = params[0], y1 = params[1], x2 = params[2], y2 = params[3];
                if (x1 >= x2 || y1 >= y2) {
                    params = null;
                }
                else {
                    params = [x1, y1, x2 - x1, y2 - y1];
                }
            }

        }
        else if ( name.indexOf('rotate') >= 0 ) {
            params = parseInt(params).limit(-this.rotationMax, this.rotationMax);
            params *= this.degreesToAngleFactor;

        }
        else {
            params = parseInt(params).limit(-this.otherMax, this.otherMax);
            
        }
        
        return params;
    },
    
    getHasPhysicallyAffectingAttributes: function(item) {
        return item.emitsId ||
                (item.attributes &&
                    (item.attributes.slowsFall || item.attributes.heavy ||
                    item.attributes.enablesDoubleJump || item.attributes.enablesTripleJump ||
                    item.attributes.higherJump
                    )
                );
    },

});

});