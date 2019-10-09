ig.module('game.core.interactingmanager')
.requires()
.defines(function(){
"use strict";

window.InteractingManager = ig.Class.extend({

    maxDaysToKeepStates: 7,
    touchMargin: 38,
    touchMarginMediumRange: 114,
    checkedForTooOldDataThisSession: false,
    specialChars: ['#', '/', ':', '>', '@'],
    maxAllowedSentenceLength: 60,
    interactingToInteractionReactionMax: 10,
    interactingToInteractionDistanceMax: 500,
    maxSecondsDefault: 15,
    definedActions: ['bumps', 'transports', 'throws', 'harms', 'heals', 'shows', 'plays', 'stops',
            'waits', 'rumbles', 'places', 'embeds', 'unembeds', 'limits',],
    sentenceSeparator: '  ',
    possibleInteractions:  ['approaches', 'nears', 'reaches', 'reached', 'enters', 'entered', 'gets',
            'hears', 'sees', 'touches', 'touched', 'line-touches', 'line-touched', 'ends', 'hits', 'views', 'viewed',
            'hears-notes'],
    possibleTypes: ['is', "isn't", 'has', "hasn't", 'currently', 'not_currently', 'in', 'not_in'],
    possibleTheyTypes: ["they_are", "they_aren't", "they_embody", "they_don't_embody", "they_mount", "they_don't_mount",
            "they_wear", "they_don't_wear", "they_hold", "they_don't_hold", "they_possess", "they_don't_possess",
            "they_have_attached", "they_don't_have_attached", "they_have_equipped", "they_don't_have_equipped", "they_move"],
    someoneVerbs: ['uses', 'mounts', 'unmounts', 'attaches', 'unattaches', 'wears', 'unwears', 'embodies', 'unembodies', 'says',
            'does', 'takes', 'throws', 'gathers', 'activates', 'emits', 'plays', 'plays-notes', 'shouts', 'consumes', 'sits_on', 'lies_on',
            'reads', 'writes', 'hits', 'catches', 'dies', 'selects', 'holder-selects', 'checks', 'touches', 'crumbles',
            'equips', 'unequips', 'finishes_countdown', 'at_countdown', 'kills'],
    someoneVerbsWithoutObject: ['arrives', 'acts', 'swims', 'jumps', 'harmed', 'climbs', 'transports', 'crumbles', 'bounces', 'dies',
            'finishes_countdown'],
    maxPlacements: 25 * 25,
    mapPlacements: {},
    currentEmbeddingInteract: null,
    focusRestoreTimer: null,
    mathMinNumber: -1000000000000,
    mathMaxNumber:  1000000000000,
    numberLimits: {},
    typesSupportedForShow: ['READABLE', 'WRITABLE', 'MEDIUM', 'HOLDER'],
    countdown: null,
    placesSoundTimer: null,
    ourPlayerLastEnteredTimer: null,

    init: function() {
        var i;
        for (i = 0; i < this.someoneVerbsWithoutObject.length; i++) {
            this.someoneVerbs.push(this.someoneVerbsWithoutObject[i]);
        }
        for (i = 0; i < this.someoneVerbs.length; i++) {
            this.possibleInteractions.unshift('someone_' + this.someoneVerbs[i]);
        }
        for (i = 0; i < this.possibleInteractions.length; i++) {
            this.possibleTypes.unshift(this.possibleInteractions[i]);
        }
        for (i = 0; i < this.possibleTheyTypes.length; i++) {
            this.possibleTypes.unshift(this.possibleTheyTypes[i]);
        }
    },
    
    receiveMessageFromExternal: function(event) {
        var data = event;
        if (ig.game.interactingManager.currentEmbeddingInteract && data) {
            ig.game.interactingManager.currentEmbeddingInteract.doReactToOtherInteractingOrEmbedding('sees', data, 'embedding');
            if (ig.game.interactingManager.currentEmbeddingInteract) {
                ig.game.interactingManager.currentEmbeddingInteract.doReactToOtherInteractingOrEmbedding('hears', data, 'embedding');
            }
            window.focus();
        }
    },
    
    removeCertainCommandCombinations: function(textData) {
        var lines = textData.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if ( line.indexOf('someone') >= 0 &&
                 line.indexOf('[heard]') >= 0 &&
                 line.indexOf('/embed') >= 0 ) {
                 lines[i] = '';
            }
        }
        return lines.join("\n"); 
    },

    getParsedData: function(textData, thingReferences) {
        var data = [];
        
        if ( !ig.game.areaClosed && (ig.game.ourPlayer && !ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) || ig.game.isPainting ) {

            var markerIndicator = '#';
            textData = this.normalizeTextData(textData);
            textData = this.removeCertainCommandCombinations(textData);
            
            var idCounter = {n: 0};

            var context = null;
            var contextCounter = 0;
            var isAutoContext = false;
            var upcomingAutoContext = null;

            var lines = textData.split("\n");
            for (var i = 0; i < lines.length; i++) {
                var line = ig.game.strings.trim(lines[i]);
                if (line && line != '') {

                    if (upcomingAutoContext) {
                        context = upcomingAutoContext;
                        upcomingAutoContext = null;
                        isAutoContext = true;
                    }
                    else if ( isAutoContext && !this.isContextual(line) ) {
                        context = null;
                        isAutoContext = false;
                    }
                    if ( i < lines.length - 1 && !this.isContextual(line) && this.isContextual(lines[i + 1]) ) {
                        upcomingAutoContext = ++contextCounter;
                        isAutoContext = true;
                    }

                    var part = {};

                    line = this.escapeUrlInLine(line);

                    if ( line.indexOf('-') === 0 ) { line = line.substr(1); }
                    line = ig.game.strings.trim(line);
                    if (line && line != '') {

                        if ( line.indexOf(markerIndicator) == 0 ) {
                            var markerAndLine = line.split(' ');
                            part.marker = markerAndLine[0].substr(1);
                            line = ml.Misc.joinRestOfArray(markerAndLine, ' ', 1);
                        }

                        if (line && line != '') {

                            var ifPart = null;
                            var urlLike = line.indexOf('://') >= 0;
                            if ( line.indexOf(':') >= 1 && !urlLike ) {
                                var ifClauseAndResult = line.split(':');
                                part.condition = ig.game.strings.trim( ifClauseAndResult[0].toLowerCase() );
                                if (part.condition) {
                                    if (part.condition.indexOf('someone ') === 0) {
                                        part.condition = ig.game.strings.replaceAll(part.condition, 'someone ', 'someone_');
                                    }

                                    for (var typeI = 0; typeI < this.possibleTheyTypes.length; typeI++) {
                                        var thisType = this.possibleTheyTypes[typeI];
                                        var thisTypeWithSpaces = ig.game.strings.replaceAll(thisType, '_', ' ');
                                        if ( part.condition.indexOf(thisTypeWithSpaces + ' ') >= 0 ) {
                                            part.condition = ig.game.strings.replaceAll(part.condition, thisTypeWithSpaces + ' ', thisType + ' ');
                                        }
                                    }

                                    part.condition = ig.game.strings.replaceAll(part.condition, 'they ', 'sees ');
                                }

                                if ( this.getIsInteractionBasedCondition(part.condition) ) {
                                    part.interactionBased = true;
                                }
            
                                line = ig.game.strings.trim( ml.Misc.joinRestOfArray(ifClauseAndResult, ':', 1) );
                            }
            
                            var results = [];
                            line = this.insertLineBreaksIfTooLong(line);
                            var resultParts = line.split(this.sentenceSeparator);
                            for (var j = 0; j < resultParts.length; j++) {
                                var resultPart = this.getParsedResult(resultParts[j], thingReferences, context, idCounter);
                                if (resultPart) {
                                    resultPart = this.rerverseReplaceEscapedCharsInResult(resultPart);
        
                                    if (upcomingAutoContext && !resultPart.setContext) {
                                        resultPart.setContext = upcomingAutoContext;
                                    }
                                    results.push(resultPart);
                                }
                            }
        
                            if (part.condition && results.length == 0) { results.push({}); }
            
                            if (results.length >= 1) {
                                if (context) { part.context = context; }
                                part.result = results;
                                data.push(part);
                            }

                        }

                    }

                }
            }

        }

        // console.log( JSON.stringify(data) );
        return data;
    },
    
    normalizeTextData: function(s) {
        s = "\n" + s;
        s = ig.game.strings.removeComments(s);
        s = this.toLowerCaseExceptUrls(s);
        s = s.replace(/\r\n/g, "\n");
        s = ig.game.strings.replaceAll(s, 'not currently', 'not_currently');
        s = ig.game.strings.replaceAll(s, '/clear countdown', '/clears countdown');
        s = this.replaceToAreaVariants(s);
        s = s.replace(/\nif /gi, "\nif ");
        s = this.escapeSomeEmoticons(s);
        s = this.replaceEscapedChars(s);
        
        s = ig.game.strings.replaceAll(s, "/they don't autoheal", "/they don't auto-heal");
        s = ig.game.strings.replaceAll(s, "/they autoheal", "/they auto-heal");
        
        s = ig.game.strings.replaceAll(s, "[age in seconds]", "[age_in_seconds]");
        s = ig.game.strings.replaceAll(s, "[age in days]", "[age_in_days]");
        
        s = ig.game.strings.replaceAll(s, "[main area]", "[main_area]");
        
        s = ig.game.strings.replaceAll(s, "/they auto-sets-spawnpoints", "/they auto-set-spawnpoints");
        s = ig.game.strings.replaceAll(s, "/they don't auto-sets-spawnpoints", "/they don't auto-set-spawnpoints");
        s = ig.game.strings.replaceAll(s, "/set spawnpoint", "/sets spawnpoint");
        s = ig.game.strings.replaceAll(s, "/set-spawnpoint", "/sets spawnpoint");
        s = ig.game.strings.replaceAll(s, "/sets-spawnpoint", "/sets spawnpoint");
        
        s = ig.game.strings.replaceAll(s, 'hear-notes', 'hears-notes');
        
        s = ig.game.strings.replaceAll(s, 'hears hi:', 'hears "hi":');
        s = ig.game.strings.replaceAll(s, 'hears hi ', 'hears "hi" ');
        s = ig.game.strings.replaceAll(s, 'transport here', 'transports here');
        s = ig.game.strings.replaceAll(s, 'someone detaches', 'someone unattaches');
        s = this.normalizeSomeoneVerbsInText(s);
        s = ig.game.strings.replaceAll(s, '/:', '/~');
        return s;
    },

    update: function() {
        this.handleCountdown();
        this.handleTemporaryMapPlacementsRemoval();
        this.handleFocusRestoreIfNeeded();
    },
    
    draw: function() {
        if (this.countdown && this.countdown.isVisible &&
                this.countdown.secondsLeft !== '') {
            ml.Misc.drawLabelFont(this.countdown.secondsLeft, ig.system.width / 2, 6);
        }
    },
    
    startCountdown: function(secondsEnds, isVisible) {
        this.countdown = {
                timer: new ml.Timer(),
                secondsEnds: secondsEnds,
                secondsLeft: '',
                isVisible: isVisible,
                ended: false,
                secondsToAdd: 0
                };
    },

    clearCountdown: function() {
        this.countdown = null;
    },
    
    addToCountdown: function(secondsToAdd) {
        if (this.countdown) {
            this.countdown.secondsToAdd += parseInt(secondsToAdd);
        }
    },

    handleCountdown: function() {
        if (this.countdown && this.countdown.timer && this.countdown.secondsEnds && !this.countdown.ended) {
            var secondsLeft = this.countdown.secondsEnds - this.countdown.timer.delta();
            secondsLeft += this.countdown.secondsToAdd;
            if (secondsLeft <= 0) { secondsLeft = 0; }
            var secondsLeftOld = this.countdown.secondsLeft;
            this.countdown.secondsLeft = Math.ceil(secondsLeft);

            if (secondsLeft == 0) {
                this.informSomeoneDid(ig.game.ourPlayer, 'finishes_countdown');
                if (this.countdown) {
                    this.countdown.timer = null;
                    this.countdown.ended = true;
                }
            }
            else if (this.countdown.secondsLeft != secondsLeftOld) {
                this.informSomeoneDid( ig.game.ourPlayer, 'at_countdown', String(this.countdown.secondsLeft) );
            }
        }
    },
    
    handleFocusRestoreIfNeeded: function() {
        if (this.currentEmbeddingInteract) {
            if (!this.focusRestoreTimer) { this.focusRestoreTimer = new ml.Timer(); }
            if ( this.focusRestoreTimer.delta() >= 1 ) {
                window.focus();
                this.focusRestoreTimer = new ml.Timer();
            }
        }
        else if (this.focusRestoreTimer) {
            this.focusRestoreTimer = null;
        }
    },

    replaceToAreaVariants: function(s) {
        var normalized = '/to_area_not_sub_area ';
        s = ig.game.strings.replaceAll(s, '/to http://manyland.com/', normalized);
        s = ig.game.strings.replaceAll(s, '/to manyland.com/', normalized);
        s = ig.game.strings.replaceAll(s, '/to /', normalized);
        return s;
    },

    toLowerCaseExceptUrls: function(str) {
        return str.replace(/[^\s]+/g, function (match) {
            return match.indexOf('http') === 0 ? match : match.toLowerCase();
        });
    },
    
    isBooleanOrBooleanString: function(v) {
        return v === true || v === false || v === 'true' || v === 'false';
    },

    escapeUrlInLine: function(s) {
        var index = s.indexOf('http://');
        if (index === - 1) { index = s.indexOf('https://'); }

        if (index >= 0) {
            var sNew = '', foundSpace = false;
            for (var i = 0; i < s.length; i++) {
                var part = s.substr(i, 1);
                if (i >= index) {
                    if (part == ' ') {
                        foundSpace = true;
                    }
                    else if (!foundSpace) {
                        if (part == ':') { part = "{{char2}}"; }
                        else if (part == '/') { part = "{{char1}}"; }
                    }
                }
                sNew += part;
            }
            s = sNew;
        }

        return s;
    },

    unescapeUrl: function(url) {
        url = ig.game.strings.replaceAll(url, '{{char1}}', '/');
        url = ig.game.strings.replaceAll(url, '{{char2}}', ':');
        return url;
    },

    getPlacesDataFromString: function(s) {
        var data = {};
        if (s) {
            var secondsVisualAudioPlacements = s.split('/');
            if (secondsVisualAudioPlacements.length == 4) {

                data.seconds = parseFloat( secondsVisualAudioPlacements[0] );
                data.usesVisual = secondsVisualAudioPlacements[1] == 'true';
                data.usesAudio = secondsVisualAudioPlacements[2] == 'true';
                var placements = secondsVisualAudioPlacements[3].trim().split(',');
                if (placements.length >= 1) {
                    for (var i = 0; i < placements.length; i++) {
                        var placement = placements[i].trim();
                        var params = placement.split(' ');
                        if (params.length == 3) {
                            var placementData = { itemId: params[0], offsetX: parseInt(params[1]), offsetY: parseInt(params[2]) };
                            if (!data.placements) { data.placements = []; }
                            data.placements.push(placementData);
                        }
                    }
                }

            }
        }
        return data;
    },

    currentlyHasTemporaryMapPlacements: function() {
        return this.containsObjects(this.mapPlacements);
    },

    triggerPlaces: function(interactingMapCoords, paramsString) {
        var placesData = this.getPlacesDataFromString(paramsString);
        if (placesData && placesData.placements && placesData.placements.length >= 1) {
            var max = this.maxPlacements - 1;
            for (var i = 0; i < placesData.placements.length && ml.Misc.getObjectLength(this.mapPlacements) < max; i++) {

                var placement = placesData.placements[i];

                var item = placement.itemId == 'nothing' ? null : ig.game.itemCache.getItem(placement.itemId, 'interacting__trigger_places');
                var coords = {
                        x: parseInt( parseInt(interactingMapCoords.x) + parseInt(placement.offsetX) ),
                        y: parseInt( parseInt(interactingMapCoords.y) + parseInt(placement.offsetY) )};
                var key = coords.x + '_' + coords.y;

                if ( this.mapPlacements[key] ) {
                    this.mapPlacements[key].removeInstantly = true;
                    this.handleTemporaryMapPlacementsRemoval();
                }

                if ( !this.mapPlacements[key] ) {

                    this.mapPlacements[key] = {timer: new ml.Timer(), maxSeconds: placesData.seconds,
                            itemId: placement.itemId,
                            usesVisual: placesData.usesVisual, usesAudio: placesData.usesAudio,
                            originalMapPosDef: ig.game.mapManager.getMapPositionDefAt(coords) };
    
                    var localOnly = true;

                    var mapPosDefToDelete = ig.game.mapManager.getMapPositionDefAndItemAt( {x: coords.x, y: coords.y} );
                    if (mapPosDefToDelete) {
                        ig.game.mapManager.deleteThingAt(coords.x, coords.y, localOnly);
                    }

                    if (placement.itemId == 'nothing') {
                        if (mapPosDefToDelete) {
                            if ( placesData.usesAudio &&
                                    ( !this.placesSoundTimer || this.placesSoundTimer.delta() >= .5 ) ) {
                                this.placesSoundTimer = new ml.Timer();
                                ig.game.sounds.shortWhoosh.play();
                            }
    
                            if (placesData.usesVisual) {
                                var gameCoords = ig.game.mapManager.convertMapCoordsToGameCoords(coords.x, coords.y);
                                ig.game.decorator.emitRemoveItemDust(gameCoords);
                            }
                        }
                        else {
                            delete this.mapPlacements[key];
                        }
                        
                        var fillerItem = ig.game.backgroundMaps[1].getGapFillerItemIfNeeded(coords.x, coords.y);
                        if (fillerItem) {
                            var mapPosDef = {tid: fillerItem.id, rotation: 0, flip: 0};
                            var isPlacedByInteracting = true;
                            ig.game.mapManager.placeThingAt(mapPosDef, coords, localOnly, isPlacedByInteracting);
                        }
                    }
                    else {
                        this.doPlace( ig.game.cloneObject(placement), ig.game.cloneObject(placesData),
                                ig.game.cloneObject(coords) );
                    }

                }

            }
        }
    },
    
    doPlace: function(placement, placesData, coords) {
        var self = this;
        var item = ig.game.itemCache.getItemBasic(placement.itemId, 'int_do_place');
        item.basicDataLoading.done(function() {

            var unplaceable = ['INTERMOT', 'MOTION', 'MIFT'];
            if ( unplaceable.indexOf(item.base) === -1 ) {
                var mapPosDef = {tid: placement.itemId, rotation: 0, flip: 0};
                ig.game.mapManager.placeThingAt(mapPosDef, coords, true, true);

                if (placesData.usesAudio &&
                        ( !self.placesSoundTimer || self.placesSoundTimer.delta() >= .5 ) ) {
                    self.placesSoundTimer = new ml.Timer();
                    if ( item && item.isLiquid() ) { ig.game.sounds.splash.play(); }
                    else                           { ig.game.sounds.putdown.play(); }
                }

                if (placesData.usesVisual) {
                    var gameCoords = ig.game.mapManager.convertMapCoordsToGameCoords(coords.x, coords.y);
                    ig.game.decorator.emitAddItemDust(gameCoords);
                }
            }

        });
    },

    handleTemporaryMapPlacementsRemoval: function() {
        var didPlaySound = false;
        for (var key in this.mapPlacements) {
            var placement = this.mapPlacements[key];
            if ( ( placement.timer && placement.timer.delta() > placement.maxSeconds ) || placement.removeInstantly ) {
                var coordsArr = key.split('_');
                var coords = { x: coordsArr[0], y: coordsArr[1] };
                var localOnly = true;
                var mapPosDefToDelete = ig.game.mapManager.getMapPositionDefAndItemAt( {x: coords.x, y: coords.y} );
                if (mapPosDefToDelete) { ig.game.mapManager.deleteThingAt(coords.x, coords.y, localOnly); }

                if (placement.originalMapPosDef) {
                    ig.game.mapManager.placeThingAt(placement.originalMapPosDef, coords, localOnly);
                }

                if (placement.usesVisual) {
                    var gameCoords = ig.game.mapManager.convertMapCoordsToGameCoords(coords.x, coords.y);
                    if (placement.itemId == 'nothing') {
                        ig.game.decorator.emitAddItemDust(gameCoords);
                    }
                    else {
                        ig.game.decorator.emitRemoveItemDust(gameCoords);
                    }
                }
                if ( (placement.usesAudio || placement.usesVisual) && !didPlaySound ) {
                    ig.game.sounds.shortWhoosh.play();
                    didPlaySound = true;
                }
                delete this.mapPlacements[key];
            }
        }
    },

    containsObjects: function(obj) {
        var foundObject = false;
        for (var key in obj) {
            if ( obj.hasOwnProperty(key) ) {
                foundObject = true;
                break;
            }
        }
        return foundObject;
    },

    insertLineBreaksIfTooLong: function(s) {
        var selfSpeakStartSymbold = '{';
        var isLikelySingleUrl = s.indexOf('://') === -1 && s.indexOf(' ') === -1;
        if ( s && s.length > this.maxAllowedSentenceLength && !isLikelySingleUrl &&
                s.indexOf('[') == -1 && s.indexOf(this.sentenceSeparator) == -1 &&
                s.indexOf(selfSpeakStartSymbold) == -1 && s.indexOf('/') == -1 ) {
            var arr = ig.game.strings.breakInPartsIfNeeded(s, this.maxAllowedSentenceLength);
            if (arr.length > 1) { s = arr.join(this.sentenceSeparator); }
        }
        return s;
    },

    escapeSomeEmoticons: function(s) {
        var replacements = [ [":)", "\\:)"], [":(", "\\:("], [":-)", "\\:-)"], [":-(", "\\:-("] ];
        for (var i = 0; i < replacements.length; i++) {
            var replacement = replacements[i];
            s = ig.game.strings.replaceAll(s, replacement[1], replacement[0]);
            s = ig.game.strings.replaceAll(s, replacement[0], replacement[1]);
        }
        return s;
    },

    rerverseReplaceEscapedCharsInResult: function(result) {
        var props = ['say', 'marker', 'toMarker'];
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            if (result[prop]) {
                result[prop] = this.replaceEscapedChars(result[prop], true);
            }
        }
        return result;
    },

    replaceEscapedChars: function(text, doReverse) {
        for (var i = 0; i < this.specialChars.length; i++) {
            var char = this.specialChars[i];
            var sIn = "\\" + char, sOut = '{{char' + i + '}}';
            if (doReverse) {
                sIn = sOut;
                sOut = char;
            }
            text = ig.game.strings.replaceAll(text, sIn, sOut);
        }
        return text;
    },

    isContextual: function(s) {
        var isIt = false;
        if (s) {
            s = ig.game.strings.trim(s);
            isIt = s.length >= 1 && s.substr(0, 1) == '-';
        }
        return isIt;
    },

    getParsedResult: function(text, thingReferences, context, idCounter) {
        var result = null;
        if (text != '') {
            text = ig.game.strings.trim(text);

            result = {};

            var continueIndicator = '>';
            var toMarker = null;

            if ( text.indexOf(continueIndicator) >= 0 ) {
                var leftRightOfIndicator = text.split(continueIndicator);
                if ( leftRightOfIndicator.length == 2 && ig.game.strings.trim(leftRightOfIndicator[1]) != '' ) {
                    result.toMarker = ig.game.strings.trim(leftRightOfIndicator[1]);
                    text = leftRightOfIndicator[0];
                }

                text = ig.game.strings.trim( ig.game.strings.replaceAll(text, continueIndicator, '') );

                if (context) { result.setContext = ''; }
                else { result.autoContinue = true; }
            }

            var actions = [];
            var sayText = this.getSayTextAndSetActionsFromString(text, actions);
            
            if (sayText) {
                if ( sayText.indexOf('://') >= 0 ) {
                    result.say = ig.game.strings.cutStringLength(sayText, this.maxAllowedSentenceLength * 5);
                }
                else if ( sayText.indexOf('[') >= 0 ) {
                    result.say = sayText;
                }
                else {
                    result.say = ig.game.strings.cutStringLength(sayText, this.maxAllowedSentenceLength + 20);
                }
            }

            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                if (!action) { continue; }
                
                var lowerCaseAction = action.toLowerCase();
                if ( lowerCaseAction.indexOf('embed') === -1 && lowerCaseAction.indexOf('http') === -1 ) {
                    action = lowerCaseAction;
                }

                var isMathExpression = this.handleMathExpression(result, action, thingReferences);
                if (isMathExpression) { continue; }

                if ( action.indexOf('gives ') === 0 ) {
                    result.gives = action.substr('gives '.length);
                }
                else if ( action.indexOf('removes ') === 0 ) {
                    var removes = this.getValidRemovesSlot( action.substr('removes '.length) )
                    if (removes) { result.removes = removes; }
                }
                else if ( action.indexOf('harms ') === 0 ) {
                    result.harms = this.getPercentInteger( action.substr('harms '.length) );
                }
                else if ( action.indexOf('heals ') === 0 &&
                        this.getPercentInteger( action.substr('heals '.length) ) == action.substr('heals '.length) ) {
                    result.heals = this.getPercentInteger( action.substr('heals '.length) );
                }
                else if ( action.indexOf('limits ') === 0 ) {
                    this.handleLimitsExpression(result, action, thingReferences);
                }

                else if (action == "they focus here") {
                    result.theyFocusHere = true;
                }
                else if (action == "they don't focus here") {
                    result.theyFocusHere = false;
                }
                
                else if ( action.indexOf('relocations go to ') === 0 ) {
                    result.relocationsGoTo = action.substr('relocations go to '.length).toLowerCase().trim();
                }
                else if ( action.indexOf('lock 15 minutes') === 0 ) {
                    result.areaBanForNMinutes = 15;
                }
                else if ( action.indexOf('lock 1 day') === 0 ) {
                    result.areaBanForNMinutes = 24 * 60;
                }

                else if ( action.indexOf('is ') === 0 ) {
                    if (!result.commands) { result.commands = []; }
                    result.commands.push( { is: action.substr('is '.length) } );
                }
                else if ( action.indexOf('_is ') === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { is: action.substr('_is '.length) } );
                }
                else if ( action.indexOf("isn't ") === 0 ) {
                    if (!result.commands) { result.commands = []; }
                    result.commands.push( { isnt: action.substr("isn't ".length) } );
                }
                else if ( action.indexOf("_isn't ") === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { isnt: action.substr("_isn;t ".length) } );
                }

                else if ( action.indexOf("they are ") === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { theyAre: action.substr("they are ".length) } );
                }
                else if ( action.indexOf("they aren't ") === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { theyArent: action.substr("they aren't ".length) } );
                }
                
                else if ( action.indexOf("they auto-heal") === 0 ) {
                    result.theyAutoHeal = true;
                }
                else if ( action.indexOf("they don't auto-heal") === 0 ) {
                    result.theyAutoHeal = false;
                }
                
                else if ( action.indexOf("they can drown") === 0 ) {
                    result.theyCanDrown = true;
                }
                else if ( action.indexOf("they can't drown") === 0 ) {
                    result.theyCanDrown = false;
                }

                else if ( action.indexOf("they can boost") === 0 ) {
                    result.theyCanBoost = true;
                }
                else if ( action.indexOf("they can't boost") === 0 ) {
                    result.theyCanBoost = false;
                }
                
                else if ( action.indexOf("they can use all boosts") === 0 ) {
                    result.theyCanUseAllBoosts = true;
                }
                else if ( action.indexOf("they can't use all boosts") === 0 ) {
                    result.theyCanUseAllBoosts = false;
                }
                
                else if ( action.indexOf("they can see name tags") === 0 ) {
                    result.theyCanSeeNameTags = true;
                }
                else if ( action.indexOf("they can't see name tags") === 0 ) {
                    result.theyCanSeeNameTags = false;
                }
                
                else if ( action.indexOf("they can paste") === 0 ) {
                    result.theyCanPaste = true;
                }
                else if ( action.indexOf("they can't paste") === 0 ) {
                    result.theyCanPaste = false;
                }
                
                else if ( action.indexOf("they always see instrument note labels") === 0 ) {
                    result.theyAlwaysSeeInstrumentNoteLabels = true;
                }
                else if ( action.indexOf("they don't always see instrument note labels") === 0 ) {
                    result.theyAlwaysSeeInstrumentNoteLabels = false;
                }
                
                else if ( action.indexOf("they can open map") === 0 ) {
                    result.theyCanOpenMap = true;
                }
                else if ( action.indexOf("they can't open map") === 0 ) {
                    result.theyCanOpenMap = false;
                }
                
                else if ( action.indexOf("they can be affected by non-friends") === 0 ) {
                    result.theyCanBeAffectedByNonFriends = true;
                }
                else if ( action.indexOf("they can't be affected by non-friends") === 0 ) {
                    result.theyCanBeAffectedByNonFriends = false;
                }
                
                else if ( action.indexOf("they can be affected by friends") === 0 ) {
                    result.theyCanBeAffectedByFriends = true;
                }
                else if ( action.indexOf("they can't be affected by friends") === 0 ) {
                    result.theyCanBeAffectedByFriends = false;
                }
                
                else if ( action.indexOf("they can map-transport") === 0 ) {
                    result.theyCanMapTeleport = true;
                }
                else if ( action.indexOf("they can't map-transport") === 0 ) {
                    result.theyCanMapTeleport = false;
                }
                
                else if ( action.indexOf("they can remove dynamic") === 0 ) {
                    result.theyCanRemoveDynamic = true;
                }
                else if ( action.indexOf("they can't remove dynamic") === 0 ) {
                    result.theyCanRemoveDynamic = false;
                }
                
                else if ( action.indexOf("they can remove holdable") === 0 ) {
                    result.theyCanRemoveHoldable = true;
                }
                else if ( action.indexOf("they can't remove holdable") === 0 ) {
                    result.theyCanRemoveHoldable = false;
                }
                
                else if ( action.indexOf("they can remove wearable") === 0 ) {
                    result.theyCanRemoveWearable = true;
                }
                else if ( action.indexOf("they can't remove wearable") === 0 ) {
                    result.theyCanRemoveWearable = false;
                }
                
                else if ( action.indexOf("they can remove mountable") === 0 ) {
                    result.theyCanRemoveMountable = true;
                }
                else if ( action.indexOf("they can't remove mountable") === 0 ) {
                    result.theyCanRemoveMountable = false;
                }
                
                else if ( action.indexOf("they can remove brain") === 0 ) {
                    result.theyCanRemoveBrain = true;
                }
                else if ( action.indexOf("they can't remove brain") === 0 ) {
                    result.theyCanRemoveBrain = false;
                }
                
                else if ( action.indexOf("they can be affected by non-logged-ins") === 0 ) {
                    result.theyCanBeAffectedByNonFullAccounts = true;
                }
                else if ( action.indexOf("they can't be affected by non-logged-ins") === 0 ) {
                    result.theyCanBeAffectedByNonFullAccounts = false;
                }
                
                else if ( action.indexOf("they can be affected by brain-equippers") === 0 ) {
                    result.theyCanBeAffectedByBrainEquippers = true;
                }
                else if ( action.indexOf("they can't be affected by brain-equippers") === 0 ) {
                    result.theyCanBeAffectedByBrainEquippers = false;
                }

                if ( action.indexOf("sets spawnpoint") === 0 ) {
                    result.setSpawnPoint = true;
                }                
                else if ( action.indexOf("they auto-set-spawnpoints") === 0 ) {
                    result.theyAutoSetSpawnpoints = true;
                }
                else if ( action.indexOf("they don't auto-set-spawnpoints") === 0 ) {
                    result.theyAutoSetSpawnpoints = false;
                }

                else if ( action.indexOf("they possess ") === 0 ) {
                    var possessionList = action.substr("they possess ".length).split(' and ');
                    var possessionIds = [];
                    for (var possessionI = 0; possessionI < possessionList.length; possessionI++) {
                        var possession = possessionList[possessionI];
                        var possessionId = this.replaceThingReferences(possession, thingReferences);
                        if (possession != possessionId) { possessionIds.push(possessionId); }
                    }
                    if (possessionIds.length >= 1) {
                        if (!result.privateCommands) { result.privateCommands = []; }
                        result.privateCommands.push( { addAreaPossession: possessionIds.join(',') } );
                    }
                }
                else if ( action.indexOf("they don't possess *") === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { removeAllAreaPossessions: true } );
                }
                else if ( action.indexOf("they don't possess ") === 0 ) {
                    if (!result.privateCommands) { result.privateCommands = []; }
                    result.privateCommands.push( { removeAreaPossession: action.substr("they don't possess ".length) } );
                }
                
                else if ( action.indexOf("hasn't ") === 0 ) {
                    result.hasnt = action.substr("hasn't ".length);
                }

                else if (action == 'timer') {
                    result.timer = true;
                }

                else if ( action.indexOf('embeds ') === 0 ) {
                    var url = this.unescapeUrl( action.substr('embeds '.length) );
                    if (url) {
                        if ( url.indexOf('manyland.com') === -1 || url.indexOf('manyland.com/info') >= 0 ) {
                            if ( url.indexOf('://') === -1 ) { url = 'http://' + url; }
                            result.embedUrl = String(url);
                        }
                    }
                }
                else if (action == 'unembeds') {
                    result.removeEmbedding = true;
                }

                else if ( action.indexOf('bumps ') === 0 ) {
                    var bumps = this.getValidBumpsParamString( action.substr('bumps '.length) );
                    if (bumps) { result.bumps = bumps; }
                }
                else if ( action.indexOf('places ') === 0 ) {
                    var params = action.substr('places '.length);
                    params = this.getValidPlacesString(params, thingReferences);
                    if (params) {
                        result.id = ++idCounter.n;
                        result.places = params;
                    }
                }
                else if ( action.indexOf('rumbles ') === 0 ) {
                    var rumblesSeconds = action.substr('rumbles '.length);
                    rumblesSeconds = ig.game.strings.replaceAll( String(rumblesSeconds).toLowerCase(), 's', '' );
                    if ( rumblesSeconds == parseInt(rumblesSeconds) ) {
                        rumblesSeconds = parseInt(rumblesSeconds);
                        if (rumblesSeconds >= 1 && rumblesSeconds <= this.maxSecondsDefault) {
                            result.rumblesSeconds = rumblesSeconds;
                        }
                    }
                }
                else if ( action.indexOf('transports here') === 0 ) {
                    result.transportToHere = true;
                }
                else if ( action.indexOf('to_area_not_sub_area ') === 0 ) {
                    result.to = action.substr('to_area_not_sub_area '.length);
                    result.toDoesExcludeSubAreas = true;
                }
                else if ( action.indexOf('to ') === 0 ) {
                    result.to = action.substr('to '.length);
                }
                else if ( action.indexOf('transports ') === 0 ) {
                    var transports = this.getValidTransportsParamString( action.substr('transports '.length) );
                    if (transports) { result.transports = transports; }
                }
                else if ( action.indexOf('throws ') === 0 ) {
                    var throws = this.getValidThrowsParamString( action.substr('throws '.length), thingReferences );
                    if (throws) { result.throws = throws; }
                }
                else if ( action.indexOf('plays ') === 0 ) {
                    var soundId = this.replaceThingReferences(action, thingReferences, 'plays');
                    if (action != soundId) { result.playsSoundId = soundId; }
                }
                else if ( action.indexOf('waits ') === 0 ) {
                    var seconds = action.substr('waits '.length);
                    seconds = ig.game.strings.replaceAll( String(seconds).toLowerCase(), 's', '' );
                    if ( seconds && parseFloat(seconds) == seconds || parseInt(seconds) == seconds ) {
                        result.delaySeconds = parseFloat( ml.Misc.limitFloat(seconds, .25, 60) );
                    }
                }
                else if ( action.indexOf('shows ') === 0 ) {
                    var lockAtHolderPage = undefined;
                    if ( action.indexOf('shows only-holder-page ') === 0 ) {
                        var start = 'shows only-holder-page '.length;
                        var nextSpace = action.indexOf(' ', start + 1);
                        if (nextSpace >= 0) {
                            lockAtHolderPage = action.substr(start, nextSpace - start);
                            if ( ml.Misc.isInteger(lockAtHolderPage) && lockAtHolderPage >= 1 ) {
                                result.lockAtHolderPage = parseInt(lockAtHolderPage - 1);
                                action = ig.game.strings.replaceAll(action,
                                        'shows only-holder-page ' + lockAtHolderPage + ' ', 'shows ');
                            }
                        }
                    }
                    var showsId = this.replaceThingReferences(action, thingReferences, 'shows');
                    if (action != showsId) { result.showsId = showsId; }
                }
                else if (action == 'stops') {
                    result.stopMusic = true;
                }
                else if ( action.indexOf('they ') === 0 ) {
                    result.triggerMotionText = action.substr('they '.length);
                    var motionId = this.replaceThingReferences(action, thingReferences, 'they');
                    if (action != motionId) { result.triggerMotionId = motionId; }
                }
                else if ( this.firstLetterIsAlphanumeric(action) ) {
                
                    // if we add future commands, we can include them here and still
                    // have them send the motion in addition, for backwards compatibility

                    result.motion = action;
                    var motionId = this.replaceThingReferences(action, thingReferences);
                    if (action != motionId) { result.motionId = motionId; }
                    
                    if ( action == 'clears countdown' ) {
                        result.countdownClear = true;
                    }
                    else if ( action.indexOf('countdown +') === 0 ) {
                        var seconds = action.substr('countdown +'.length);
                        seconds = String(seconds).trim();
                        if ( ml.Misc.isInteger(seconds) && seconds >= 1 && seconds <= 10000 ) {
                            result.countdownAdd = parseInt(seconds);
                        }
                    }
                    else if ( action.indexOf('countdown -') === 0 ) {
                        var seconds = action.substr('countdown -'.length);
                        seconds = String(seconds).trim();
                        if ( ml.Misc.isInteger(seconds) && seconds >= 1 && seconds <= 10000 ) {
                            result.countdownAdd = -parseInt(seconds);
                        }
                    }
                    else if ( action.indexOf('countdown ') === 0 ) {
                        var isVisible = true;
                        if ( action.indexOf(' invisible') >= 0 ) {
                            isVisible = false;
                            action = ig.game.strings.replaceAll(action, ' invisible', '');
                        }
                        var seconds = action.substr('countdown '.length);
                        if (seconds) { seconds = ig.game.strings.replaceAll(seconds, 's', ''); }
                        if ( ml.Misc.isInteger(seconds) && seconds >= 1 && seconds <= 1000000 ) {
                            result.countdown = parseInt(seconds);
                            result.countdownIsVisible = isVisible;
                        }
                    }
                }

            }

        }
        return result;
    },
    
    handleLimitsExpression: function(result, action, thingReferences) {
        action = action.substr('limits '.length);
        
        var autoDisappears = action.indexOf('auto-disappear') >= 0;
        action = ig.game.strings.replaceAll(action, 'auto-disappears', '');
        action = ig.game.strings.replaceAll(action, 'auto-disappear', '');
        action = action.trim();
        
        var parts = action.split(' ');
        
        if (parts.length >= 3) {
            var max = parts.pop();
            var min = parts.pop();
            var name = parts.join(' ');
            
            var relatesToPlayer = name.indexOf('their ') >= 0;
            name = ig.game.strings.replaceAll(name, 'their ', '');
            if (relatesToPlayer) {
                name = this.replaceThingReferences(name, thingReferences);
            }
            
            if ( name && min == parseInt(min) && max == parseInt(max) ) {
                if (!result.limits) { result.limits = []; }
                result.limits.push( [ String(name), parseInt(min), parseInt(max), !!autoDisappears, !!relatesToPlayer ] );
            }
        }
    },
    
    setNumberLimit: function(name, min, max, autoDisappears, relatesToPlayer) {
        this.numberLimits[name] = {min: min, max: max,
                autoDisappears: autoDisappears, relatesToPlayer: relatesToPlayer};
    },
    
    keepNumberInLimits: function(itemId, number) {
        number = parseInt(number).limit(this.mathMinNumber, this.mathMaxNumber);

        var limits = this.numberLimits[itemId];
        if (limits) {
            number = parseInt(number).limit(limits.min, limits.max);
        }
        return number;
    },
    
    handleMathExpression: function(result, action, thingReferences) {
        var didHandle = false;
        var mathOperators = ['+', '-', '*', '~', '='];

        action = ig.game.strings.replaceAll(action, '[value their ', '[value_their_');

        var relatesToPlayer = action.indexOf('their ') >= 0;
        action = ig.game.strings.replaceAll(action, 'their ', '');
        
        action = ig.game.strings.replaceAll(action, '[value_their_', '[value their ');
        
        var effectsFree = action.indexOf('effects-free') >= 0 || action.indexOf('effect-free') >= 0;
        if (effectsFree) {
            action = ig.game.strings.replaceAll(action, 'effects-free', '');
            action = ig.game.strings.replaceAll(action, 'effect-free', '');
            action = ig.game.strings.replaceAll(action, '  ', ' ');
            action = action.trim();
        }

        var relevantSpace = action.indexOf(' ');
        if ( action.indexOf('] ') >= relevantSpace ) {
            relevantSpace = action.indexOf('] ');
        }

        if (relevantSpace >= 0) {
            var mathPart = action.substr(0, relevantSpace + 1).trim();
            var thingPart = action.substr(relevantSpace + 1).trim();
            
            var thingPartOld = thingPart;
            if (relatesToPlayer) {
                thingPart = this.replaceThingReferences(thingPart, thingReferences);
            }

            if (thingPart != thingPartOld || !relatesToPlayer) {
                var operator = mathPart.charAt(0);
                        
                if ( mathOperators.indexOf(operator) >= 0 ) {
                    var number = mathPart.substr(1);
                    var isNumber = number == parseInt(number) && parseInt(number) >= this.mathMinNumber && parseInt(number) <= this.mathMaxNumber;
                    var isPlaceholder = String(number).indexOf('[value ') === 0 ||
                                        String(number).indexOf('[number ') === 0 ||
                                        String(number).indexOf('[people]') === 0 ||
                                        String(number).indexOf('[age_in_seconds]') === 0 ||
                                        String(number).indexOf('[age_in_days]') === 0 ||
                                        String(number) == '[heard]';
                    if (isNumber || isPlaceholder) {
                        didHandle = true;
                        if (isNumber) { number = parseInt(number); }
                        if (!result.changeNumber) { result.changeNumber = []; }
                        if (operator == '~') { operator = ':'; }
                        result.changeNumber.push( [thingPart, number, operator, relatesToPlayer, effectsFree] );
                    }
                    
                }
                
            }
            
        }
        
        return didHandle;
    },

    getValidRemovesSlot: function(s) {
        var slot = null;
        var validSlots = ['wearable', 'mountable', 'holdable', 'dynamic', 'brain', '*'];
        if ( s && typeof s === 'string' && validSlots.indexOf(s) >= 0 ) {
            slot = s;
        }
        return slot;
    },

    firstLetterIsAlphanumeric: function(s) {
        var firstLetter = s.toLowerCase().substr(0, 1);
        var alphaNumerics = 'abcdefghijklmnopqrstuvwxyz0123456789';
        return alphaNumerics.indexOf(firstLetter) >= 0;
    },

    getValidThrowsParamString: function(paramString, thingReferences) {
        var partOrParts = null;
        var maxThrowParts = 10;
        if (paramString) {
            var paramStringParts = paramString.split(',');
            if (paramStringParts.length >= 1) {
                partOrParts = [];
                for (var i = 0; i < paramStringParts.length; i++) {
                    var thisParamString = paramStringParts[i] ? paramStringParts[i].trim() : null;
                    if (thisParamString) {
                        var thisPart = this.getValidThrowsParamStringPart(thisParamString, thingReferences);
                        if (thisPart) {
                            partOrParts.push(thisPart);
                            if (partOrParts.length >= maxThrowParts) { break; }
                        }
                    }
                }
                if (partOrParts.length == 0) { partOrParts = null; }
            }
        }
        return partOrParts;
    },
    
    getValidThrowsParamStringPart: function(paramString, thingReferences) {
        var xyItemIdString = null;
        if (paramString) {
            var strengthMax = ig.game.ourPlayer.maxVelPushing.x;
            paramString = ig.game.strings.replaceAll(paramString, '%', '');
            var paramsAll = paramString.split(' ');
            if (paramsAll.length >= 3) {
                var params = [ paramsAll[0], paramsAll[1] ];
                var itemName = ml.Misc.joinRestOfArray(paramsAll, ' ', 2);
                var itemId = this.replaceThingReferences(itemName, thingReferences);
                if (itemId != itemName) {

                    if ( params.length == 2 && parseInt(params[0]) == params[0] && parseInt(params[1]) == params[1] ) {
                        var angle = parseInt(params[0]).limit(0, 360);
                        var strengthPercent = parseInt(params[1]).limit(0, 100);
                        var angleRadians = (angle / 180) * Math.PI;
                        var strength = (strengthPercent / 100) * (strengthMax * strengthMax);
                        var x = parseInt( Math.sqrt(strength) * Math.cos(angleRadians) );
                        var y = parseInt( Math.sqrt(strength) * Math.sin(angleRadians) );
                        xyItemIdString = x + ' ' + y + ' ' + itemId;
                    }

                }
            }
        }
        return xyItemIdString;
    },

    getValidBumpsParamString: function(paramString) {
        var xyString = null;
        if (paramString) {
        
            var isAbsolute = paramString.indexOf('absolute') >= 0;
            if (isAbsolute) {
                paramString = ig.game.strings.replaceAll(paramString, 'absolute', '');
                paramString = paramString.trim();
            }
                        
            var strengthMax = ig.game.ourPlayer.maxVelPushing.x;
            paramString = ig.game.strings.replaceAll(paramString, '%', '');
            var params = paramString.split(' ');
            if ( params.length == 2 && parseInt(params[0]) == params[0] && parseInt(params[1]) == params[1] ) {
                var angle = parseInt(params[0]).limit(0, 360);
                var strengthPercent = parseInt(params[1]).limit(0, 100);
                var angleRadians = (angle / 180) * Math.PI;
                var strength = (strengthPercent / 100) * (strengthMax * strengthMax);

                var x;
                if (angle == 270 || angle == 90) { x = 0; }
                else { x = parseInt( Math.sqrt(strength) * Math.cos(angleRadians) ); }
                
                var y;
                if (angle == 180 || angle == 0) { y = 0; }
                else { y = parseInt( Math.sqrt(strength) * Math.sin(angleRadians) ); }

                xyString = x + ' ' + y;
                if (isAbsolute) { xyString = 'absolute ' + xyString; }
            }
            
        }
        return xyString;
    },

    getValidTransportsParamString: function(paramString) {
        var xyString = null;
        if (paramString) {
            var strengthMax = ig.game.maxPortalDistance;
            paramString = ig.game.strings.replaceAll(paramString, '%', '');
            var params = paramString.split(' ');
            if ( params.length == 2 && parseInt(params[0]) == params[0] && parseInt(params[1]) == params[1] ) {
                var angle = parseInt(params[0]).limit(0, 360);
                var strengthPercent = parseInt(params[1]).limit(0, 100);
                var angleRadians = (angle / 180) * Math.PI;
                var strength = (strengthPercent / 100) * strengthMax;
                var x = parseInt( strength * Math.cos(angleRadians) );
                var y = parseInt( strength * Math.sin(angleRadians) );
                xyString = x + ' ' + y;
            }
        }
        return xyString;
    },

    getSayTextAndSetActionsFromString: function(text, actions) {
        var sayText = null;
        var actionIndicator = '/';
        var urlLike = text.indexOf('://') >= 0;

        if ( urlLike || text.indexOf('/') == -1 ) {
            sayText = text;
        }
        else {
            var splits = text.split('/');
            sayText = splits[0];
            for (var i = 1; i < splits.length; i++) {
                actions.push( ig.game.strings.trim(splits[i]) );
            }
        }

        if (sayText) {
            sayText = this.replaceEscapedChars(sayText, true);
            sayText = sayText.trim();
        }

        return sayText;
    },

    getIsInteractionBasedCondition: function(s) {
        var foundInteraction = false;
        for (var i = 0; i < this.possibleInteractions.length; i++) {
            var interaction = this.possibleInteractions[i];
            if ( s.indexOf(interaction) === 0 || s.indexOf(' ' + interaction) >= 0 ) {
                foundInteraction = true;
                break;
            }
        }
        return foundInteraction;
    },

    getPercentInteger: function(v) {
        if ( parseInt(v) != v ) { v = 0; }
        v = ( parseInt(v) ).limit(0, 100);
        return v;
    },

    replaceThingReferences: function(s, thingReferences, optionalPrefix) {
        if (thingReferences) {
            for (var i = 0; i < thingReferences.length; i++) {
                var idAndName = thingReferences[i];
                if ( (!optionalPrefix && s == idAndName[1]) || (optionalPrefix && s == optionalPrefix + ' ' + idAndName[1]) ) {
                    s = idAndName[0];
                    break;
                }
            }
        }
        return s;
    },

    getValidPlacesString: function(s, thingReferences) {
        var validString = '';
        if (s) {
            var lastItemName;
            var usesVisual = s.indexOf('visual-free') === -1;
            var usesAudio = s.indexOf('audio-free') === -1;
            var maxOffset = 20;
            var validParts = null;

            s = ig.game.strings.replaceAll(s, 'audio-free', '');
            s = ig.game.strings.replaceAll(s, 'visual-free', '');
            s = s.trim();
            var firstSpace = s.indexOf(' ');
            if (firstSpace >= 1) {
                var seconds = s.substr(0, firstSpace).trim();
                seconds = ig.game.strings.replaceAll(seconds, 's', '');
                if ( ( seconds == parseInt(seconds) || seconds == parseFloat(seconds) ) &&
                        seconds >= 1 && seconds <= this.maxSecondsDefault ) {
                    s = s.substr(firstSpace).trim();
                    var parts = s.split(',');
                    for (var partI = 0; partI < parts.length; partI++) {

                        var params = parts[partI].trim().split(' ');
                        if (params.length == 2 && lastItemName) {
                            params.unshift(lastItemName);
                        }

                        if (params.length >= 3) {
                            params = this.joinStringArrayIntoLimitedRightBound(params, 3);
                            if (params && params.length == 3) {
                                var itemParam = params[0].trim();
                                var offsetX = params[1];
                                var offsetY = params[2];

                                if (itemParam == 'nothing') {
                                    if ( parseInt(offsetX) == offsetX && parseInt(offsetY) == offsetY &&
                                            Math.abs(offsetX) <= maxOffset && Math.abs(offsetY) <= maxOffset
                                            ) {
                                        if (!validParts) { validParts = []; }
                                        lastItemName = itemParam;
                                        validParts.push( itemParam + ' ' + parseInt(offsetX) + ' ' + parseInt(offsetY) );
                                    }

                                }
                                else if (thingReferences && thingReferences.length >= 1) {
                                    for (var i = 0; i < thingReferences.length; i++) {
                                        var idAndName = thingReferences[i];
                                        if ( itemParam == idAndName[1] &&
                                                parseInt(offsetX) == offsetX && parseInt(offsetY) == offsetY &&
                                                Math.abs(offsetX) <= maxOffset && Math.abs(offsetY) <= maxOffset
                                                ) {
                                            if (!validParts) { validParts = []; }
                                            if (validParts.length < this.maxPlacements) {
                                                lastItemName = itemParam;
                                                validParts.push( idAndName[0] + ' ' + parseInt(offsetX) + ' ' + parseInt(offsetY) );
                                                break;
                                            }
                                        }
                                    }

                                }

                            }
                        }

                    }

                    if (validParts && validParts.length >= 1) {
                        validString = parseFloat(seconds) + '/' +
                                (usesVisual ? 'true' : 'false') + '/' + (usesAudio ? 'true' : 'false') + '/' +
                                validParts.join(',');
                    }
                }
            }
        }
        return validString;
    },

    joinStringArrayIntoLimitedRightBound: function(arr, max) {
        var newArr = [];

        var firstString = '';
        var splitIndex = arr.length - (max - 1);
        for (var i = 0; i < splitIndex; i++) {
            firstString += arr[i] + ' ';
        }
        newArr.push( firstString.trim() );

        for (var i = splitIndex; i < arr.length; i++) {
            newArr.push( arr[i] );
        }
        return newArr;
    },

    replacePlaceHolders: function(s, allHas, allIs, allNumber, lastReceived, lastHeard, lastTimerSeconds) {
        if (s && typeof s === 'string' && s.length >= 1) {
            var functionData = [
                {name: 'number', paramsType: ['integer', 'integer', 'integer'], requiredParamsMin: 2},
                {name: 'letter', paramsType: ['character', 'character', 'integer'], requiredParamsMin: 2},
                {name: 'list', paramsType: ['string', 'integer']},
                {name: 'states', paramsType: ['integer']},
                {name: 'chance', paramsType: ['percent']},
                {name: 'name', paramsType: []},
                {name: 'time', paramsType: []},
                {name: 'random', paramsType: ['string'], paramsAreArray: true},
                {name: 'someone', paramsType: []},
                {name: 'heard', paramsType: []},
                {name: 'received', paramsType: []},
                {name: 'timer', paramsType: []},
                {name: 'editor', paramsType: []},
                {name: 'account', paramsType: []},
                {name: 'lying', paramsType: []},
                {name: 'sitting', paramsType: []},
                {name: 'age_in_seconds', paramsType: []},
                {name: 'age_in_days', paramsType: []},
                {name: 'value', paramsType: ['string'], paramsAreArray: true},
                {name: 'people', paramsType: []},
                {name: 'main_area', paramsType: []},
                {name: 'area', paramsType: []},
            ];

            for (var i = 0; i < functionData.length; i++) {
                var data = functionData[i];
                var sOld = null;
                while (s != sOld) {
                    sOld = s;
                    s = this.resolveFunctions(s, data.name, data.paramsType, data.requiredParamsMin, !!data.paramsAreArray,
                            allHas, allIs, allNumber, lastReceived, lastHeard, lastTimerSeconds);
                }
            }

        }
        return s;
    },

    shuffle: function(o) {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    resolveFunctions: function(s, functionName, requiredParamsType, requiredParamsMin, paramsAreArray, allHas, allIs, allNumber, lastReceived, lastHeard, lastTimerSeconds) {
        var startI = s.toLowerCase().indexOf('[' + functionName);
        var endI = -1;
        if (startI >= 0) { endI = s.indexOf(']', startI + functionName.length); }

        if (startI >= 0 && endI >= 0) {
            var functionCall = s.substr( startI + 1, endI - (startI + 1) );
            functionCall = ig.game.strings.trim(functionCall);
            functionCall = functionCall.toLowerCase();

            var paramsOk = true;
            var parts = functionCall.split(' ');
            var functionName = parts[0];
            var params = [];

            if (paramsAreArray) {
                paramsOk = false;
                if (parts.length >= 2) {
                    var sParams = ml.Misc.joinRestOfArray(parts, ' ', 1);
                    params = sParams.split(',');
                    paramsOk = params.length >= 1;
                }
            }
            else {
                for (var i = 1; i < parts.length; i++) { params.push(parts[i]); }
    
                if (requiredParamsType) {
                    paramsOk = (params.length == requiredParamsType.length || params.length == requiredParamsMin) &&
                            this.forceValidParams(params, requiredParamsType);
                }
            }

            if (paramsOk) {
                var functionResult = null;
                switch (functionName) {
                    case 'number':         functionResult = this.resolveFunction_getNumber(params[0], params[1], params[2]); break;
                    case 'letter':         functionResult = this.resolveFunction_getLetter(params[0], params[1], params[2]); break;
                    case 'random':         functionResult = this.resolveFunction_getRandom(params); break;
                    case 'name':           functionResult = this.resolveFunction_getName(); break;
                    case 'area':           functionResult = ig.game.getAreaNameForDisplay(false); break;
                    case 'main_area':      functionResult = ig.game.getAreaNameForDisplay(true); break;
                    case 'someone':        functionResult = this.resolveFunction_getSomeone(); break;
                    case 'time':           functionResult = this.resolveFunction_getTime(); break;
                    case 'list':           functionResult = this.resolveFunction_getList(params[0] == 'has' ? allHas : allIs, params[1]); break;
                    case 'heard':          functionResult = lastHeard ? lastHeard : ''; break;
                    case 'received':       functionResult = lastReceived ? lastReceived : ''; break;
                    case 'chance':         functionResult = this.getVerboseBool( ig.game.chance(params[0]) ); break;
                    case 'timer':          functionResult = this.resolveFunction_getTimer(lastTimerSeconds); break;
                    case 'editor':         functionResult = this.getVerboseBool(ig.game.isEditorHere); break;
                    case 'account':        functionResult = this.getVerboseBool(ig.game.isFullAccount); break;
                    case 'lying':          functionResult = this.getVerboseBool(ig.game.ourPlayer && ig.game.ourPlayer.isLying); break;
                    case 'sitting':        functionResult = this.getVerboseBool(ig.game.ourPlayer && ig.game.ourPlayer.isSitting); break;
                    case 'value':          functionResult = this.resolveFunction_getValue(params[0], allNumber); break;
                    case 'people':         functionResult = this.resolveFunction_getPeopleCount(); break;
                    case 'age_in_seconds': functionResult = ig.game.playerAgeSecondsOnInit; break;
                    case 'age_in_days':    functionResult = ig.game.playerAgeDays; break;
                }

                if (functionResult !== null) {
                    s = ig.game.strings.replaceOne(s, '[' + functionCall + ']', functionResult);
                }
            }
            else {
                console.warn('Wrong parameters passed to ' + functionName);
            }

        }
        return s;
    },
    
    resolveFunction_getPeopleCount: function() {
        var count = 0;
        if (ig.game.entitiesByType && ig.game.entitiesByType.player) {
            count = ig.game.entitiesByType.player.length;
        }
        return count;
    },
    
    getVerboseBool: function(v) {
        return v ? 'true' : 'false';
    },

    resolveFunction_getValue: function(name, allNumber) {
        var value = 0;
        if ( name.indexOf('their ') == 0 ) {
            if (ig.game.motionDialog) {
                name = name.substr('their '.length);
                value = ig.game.motionDialog.getAreaPossessionNumberByName(name);
            }
        }
        else {
            if ( allNumber[name] !== undefined ) {
                value = allNumber[name];
            }
        }
        return value;
    },

    resolveFunction_getName: function() {
        return ig.game.ourPlayer ? ig.game.ourPlayer.screenName : null;
    },

    resolveFunction_getNumber: function(min, max, repetitionMax) {
        var s = '';
        if (!repetitionMax) { repetitionMax = 1; }
        repetitionMax = (repetitionMax).limit(0, 50);

        for (var repetitionI = 1; repetitionI <= repetitionMax; repetitionI++) {
            s = s + String( ig.game.getRandomInt(min, max) );
        }
        return s;
    },

    resolveFunction_getLetter: function(charStart, charEnd, repetitionMax) {
        var s = '';
        if (!repetitionMax) { repetitionMax = 1; }
        repetitionMax = (repetitionMax).limit(0, 50);

        var letters = ['a','b','c','d','e','f','g', 'h','i','j','k','l','m','n','o','p',
                'q','r','s','t','u','v','w','x','y','z', '0','1','2','3','4','5','6','7','8','9'];

        for (var repetitionI = 1; repetitionI <= repetitionMax; repetitionI++) {
            var didStart = false;
            var lettersToUse = [];
            for (var i = 0; i < letters.length; i++) {
                var letter = letters[i];
                if (letter == charStart) { didStart = true; }
                if (didStart) { lettersToUse.push(letter); }
                if (letter == charEnd) { break; }
            }
            s += lettersToUse.length >= 1 ? lettersToUse[ ig.game.getRandomInt(0, lettersToUse.length - 1) ] : ''
        }
        return s;
    },

    resolveFunction_getRandom: function(params) {
        var randomI = ig.game.getRandomInt(0, params.length - 1);
        return ig.game.strings.trim( String( params[randomI] ) );
    },

    resolveFunction_getTimer: function(lastTimerSeconds) {
        var s = '0';
        if (lastTimerSeconds) { s = ig.game.strings.getHowLongAgo( parseInt(lastTimerSeconds), true, ' ' ); }
        return s;
    },

    resolveFunction_getSomeone: function() {
        var functionResult = null;
        if (ig.game.entitiesByType && ig.game.entitiesByType.player) {
            var randomI = ig.game.getRandomInt(0, ig.game.entitiesByType.player.length - 1);
            var screenName = ig.game.entitiesByType.player[randomI].screenName;
            functionResult = screenName ? screenName : null;
        }
        return functionResult;
    },

    resolveFunction_getTime: function() {
        var thisTime = new Date;
        return ig.game.strings.pad( thisTime.getUTCHours() ) + ':' + ig.game.strings.pad( thisTime.getUTCMinutes() ) + ' mt';
    },

    resolveFunction_getList: function(arr, max) {
        var functionResult = null;
        if (!arr || arr.length == 0) {
            functionResult = 'nothing';
        }
        else {
            var items = this.shuffle( ig.game.cloneObject(arr) );
            var randomItems = [];
            for (var i = 1; i <= max && items.length >= 1; i++) {
                randomItems.push( items.shift() );
            }

            if (randomItems.length >= 2) {
                var sList = randomItems[0];
                for (var i = 1; i < randomItems.length - 1; i++) {
                    sList += ', ' + randomItems[i];
                }
                sList += ' and ' + randomItems[randomItems.length - 1];
                functionResult = sList;
            }
            else {
                functionResult = randomItems[0];
            }
        }
        return functionResult;
    },

    forceValidParams: function(params, requiredParamsType) {
        var areRight = true;
        for (var i = 0; i < params.length && areRight; i++) {
            switch (requiredParamsType[i]) {
                case 'integer':
                    if ( params[i] == parseInt(params[i]) ) { params[i] = parseInt(params[i]); }
                    else { areRight = false; }
                    break;

                case 'percent':
                    if ( params[i] == parseInt(params[i]) && parseInt(params[i]).limit(0, 100) == params[i] ) { params[i] = parseInt(params[i]); }
                    else { areRight = false; }
                    break;

                case 'character':
                    if ( params[i] == String(params[i]) && params[i].length == 1 ) { params[i] = String(params[i]); }
                    else { areRight = false; }
                    break;

                case 'string':
                    if ( params[i] == String(params[i]) ) { params[i] = String(params[i]); }
                    else { areRight = false; }
                    break;
            }

        }
        return areRight;
    },

    sortEntitiesByClosest: function(a, b) {
        var sortValue = 0;
        if (ig.game.ourPlayer) {
            if ( a.distanceTo(ig.game.ourPlayer) < b.distanceTo(ig.game.ourPlayer) ) {
                sortValue = -1;
            }
            else {
                sortValue = 1;
            }
        }
        return sortValue;
    },

    informNearby: function(interactionType, itemIdOrSpeechTextOrMotionText, optionalItem, optionalPos) {
        var success = false;
        if ( this.possibleInteractions.indexOf(interactionType) >= 0 ) {

            var marginToStillCountAsTouch = null;
            if (optionalItem && optionalItem.attributes && optionalItem.attributes.widerRange) {
                marginToStillCountAsTouch = this.touchMargin / 2;
            }
            else if (interactionType == 'touches') {
                marginToStillCountAsTouch = 0;
            }

            var entities = optionalPos ?
                    this.getInteractingEntitiesAtThisPosition(optionalPos) :
                    this.getInteractingEntitiesTouchingOurPlayer(marginToStillCountAsTouch);
            if (entities) {
                if (entities.length >= 2) {
                    entities.sort(ig.game.interactingManager.sortEntitiesByClosest);
                }
            
                for (var i = 0; i < entities.length; i++) {
                    success = entities[i].reactTo(interactionType, itemIdOrSpeechTextOrMotionText);
                    if (success) { break; }
                }
            }
        }
        return success;
    },

    informNearbyOfInteractingEntityAction: function(sourcePos, interactionType, text, interactingName, informerId) {
        var reactionCount = 0;
        var validInteractionTypes = ['hears', 'hears-notes', 'sees'];
        if ( validInteractionTypes.indexOf(interactionType) >= 0 ) {
            var entities = this.getInteractingEntitiesReactingToThisInteracting(sourcePos, interactingName, informerId);
            if (entities) {
                for (var i = 0; i < entities.length; i++) {
                    reactionCount++;
                    entities[i].reactToOtherInteracting(interactionType, text, interactingName, reactionCount);
                    if (reactionCount > this.interactingToInteractionReactionMax) { break; }
                }
            }
        }
    },

    informNearbyOfAction: function() {
        var entities = this.getInteractingEntitiesTouchingOurPlayer();
        var success = false;
        if (entities) {
            if (entities.length >= 2) {
                entities.sort(ig.game.interactingManager.sortEntitiesByClosest);
            }
            for (var i = 0; i < entities.length; i++) {
                var isPreciseOverlap = ml.Misc.touchesCheckFullBodySize(entities[i], ig.game.ourPlayer);
                success = entities[i].reactToPlainAction(isPreciseOverlap);
                if (success) { break; }
            }
        }
        return success;
    },

    doesTouchInteracting: function() {
        return !!this.getInteractingEntitiesTouchingOurPlayer();
    },

    getInteractingEntitiesTouchingOurPlayer: function(marginToStillCountAsTouch) {
        var entitiesFound = null;
        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        if (entities) {
            var margin = this.touchMargin;
            if (marginToStillCountAsTouch !== undefined && marginToStillCountAsTouch != null) {
                margin = marginToStillCountAsTouch;
            }
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                var extraMargin = entity.collides == ig.Entity.COLLIDES.FIXED ? 5 : 0;
                if (entity instanceof EntityInteract && !entity._killed &&
                        ml.Misc.touchesCheckFullBodySize(entity, ig.game.ourPlayer, margin + extraMargin)
                        ) {
                    if (!entitiesFound) { entitiesFound = []; }
                    entitiesFound.push(entity);
                }
            }
        }
        return entitiesFound;
    },
    
    getInteractingEntitiesAtThisPosition: function(point) {
        var entitiesFound = null;
        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        if (entities) {
            var pointPseudoEntity = { pos: point, size: {x: 1, y: 1} }
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof EntityInteract && !entity._killed &&
                        entity.touches(pointPseudoEntity)
                        ) {
                    if (!entitiesFound) { entitiesFound = []; }
                    entitiesFound.push(entity);
                }
            }
        }
        return entitiesFound;
    },

    getInteractingEntitiesReactingToThisInteracting: function(sourcePos, interactingName, informerId) {
        var entitiesFound = null;
        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        
        var areaEntity = ig.game.areaGlobalInteractingEntity;
        if ( areaEntity && areaEntity.reactsTo && areaEntity.reactsTo.length >= 1 &&
                areaEntity.reactsTo.indexOf(interactingName) >= 0 ) {
            if (!entitiesFound) { entitiesFound = []; }
            entitiesFound.push(ig.game.areaGlobalInteractingEntity);
        }
            
        if (entities) {
            var sourcePseudoEntity = { pos: sourcePos, size: {x: 29, y: 29} };
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof EntityInteract && !entity._killed &&
                        entity.id != informerId &&
                        entity.reactsTo && entity.reactsTo instanceof Array && entity.reactsTo.indexOf(interactingName) >= 0 &&
                        entity.distanceTo(sourcePseudoEntity) <= this.interactingToInteractionDistanceMax
                        ) {
                    if (!entitiesFound) { entitiesFound = []; }
                    entitiesFound.push(entity);
                }
            }
        }
        
        if (ig.game.holderDialog && ig.game.holderDialog.isOpen && ig.game.holderDialog.items) {
            var items = ig.game.holderDialog.items[ig.game.holderDialog.currentPage];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var entity = items[i].entity;
                    if ( entity && entity instanceof EntityInteract && !entity._killed &&
                            entity.id != informerId &&
                            entity.reactsTo && entity.reactsTo instanceof Array &&
                            entity.reactsTo.length >= 1 && entity.reactsTo.indexOf(interactingName) >= 0 ) {
                        if (!entitiesFound) { entitiesFound = []; }
                        entitiesFound.push(entity);
                    }
                }
            }
        }

        return entitiesFound;
    },

    getInteractingEntitiesReactingToThisSomeoneAction: function(verbString, objectString) {
        var entitiesFound = null;
        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        if (entities) {
            var reactString = 'someone_' + verbString.toLowerCase();
            var sourcePseudoEntity = { pos: ig.game.cloneObject(ig.game.ourPlayer.pos), size: {x: 29, y: 29} };

            var entity = ig.game.areaGlobalInteractingEntity;
            if ( entity && entity.reactsTo && entity.reactsTo.length >= 1 && entity.reactsTo.indexOf(reactString) >= 0 ) {
                if (!entitiesFound) { entitiesFound = []; }
                entitiesFound.push(ig.game.areaGlobalInteractingEntity);
            }
            
            entity = ig.game.boostManager.interactingEntity;
            if ( entity && entity.reactsTo && entity.reactsTo.length >= 1 && entity.reactsTo.indexOf(reactString) >= 0 ) {
                if (!entitiesFound) { entitiesFound = []; }
                entitiesFound.push(ig.game.boostManager.interactingEntity);
            }

            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof EntityInteract && !entity._killed &&
                        entity.reactsTo && entity.reactsTo.length >= 1 && entity.reactsTo.indexOf(reactString) >= 0 &&
                        entity.distanceTo(sourcePseudoEntity) <= this.interactingToInteractionDistanceMax
                        ) {
                    if (!entitiesFound) { entitiesFound = []; }
                    entitiesFound.push(entity);
                }
            }
            
            if (ig.game.holderDialog && ig.game.holderDialog.isOpen && ig.game.holderDialog.items) {
                var items = ig.game.holderDialog.items[ig.game.holderDialog.currentPage];
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        var entity = items[i].entity;
                        if ( entity && entity instanceof EntityInteract && !entity._killed &&
                                entity.reactsTo && entity.reactsTo.length >= 1 && entity.reactsTo.indexOf(reactString) >= 0 ) {
                            if (!entitiesFound) { entitiesFound = []; }
                            entitiesFound.push(entity);
                        }
                    }
                }
            }
        }
        return entitiesFound;
    },

    getCurrentlyActiveMotion: function(interactingEntity) {
        var motion = null;
        var entities = interactingEntity.isInHolderOrDialog ?
                ig.game.entitiesByType.ui : ig.game.entitiesByType.betweenPlayerAndForeground;
        if (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (!entity._killed && entity.byEntityId == interactingEntity.crossClientId) {
                    motion = entity;
                    break;
                }
            }
        }
        return motion;
    },

    replaceConditionPartsWhereMultipleAllowed: function(s) {
        s = ig.game.strings.replaceAll(s, 'entered', 'enters');
        s = ig.game.strings.replaceAll(s, 'touched', 'touches');
        s = ig.game.strings.replaceAll(s, 'reached', 'reaches');
        s = ig.game.strings.replaceAll(s, 'views', 'viewed');
        return s;
    },

    conditionStringIsTrue: function(interactionType, text, conditionString, allHas, allIs, allNumber, reactsTo, currentlyReactingTo,
            lastReceived, lastHeard, lastTimerSeconds, currentMotionOrDynamicName) {

        conditionString = this.replacePlaceHolders(conditionString, allHas, allIs, allNumber, lastReceived, lastHeard, lastTimerSeconds);
        conditionString = this.replaceConditionPartsWhereMultipleAllowed(conditionString);

        var isTrue = false;

        if ( conditionString.indexOf('-and-') >= 0 ) {
            var conditionStringParts = conditionString.split('-and-');
            for (var i = 0; i < conditionStringParts.length; i++) {
                var conditionStringPart = ig.game.strings.trim( conditionStringParts[i] );
                isTrue = this.conditionStringPartIsTrue(interactionType, text, conditionStringPart,
                        allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName);
                if (!isTrue) { break; }
            }

        }
        else if ( conditionString.indexOf('-or-') >= 0 ) {
            var conditionStringParts = conditionString.split('-or-');
            for (var i = 0; i < conditionStringParts.length; i++) {
                var conditionStringPart = ig.game.strings.trim( conditionStringParts[i] );
                isTrue = this.conditionStringPartIsTrue(interactionType, text, conditionStringPart,
                        allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName);
                if (isTrue) { break; }
            }

        }
        else {
            isTrue = this.conditionStringPartIsTrue(interactionType, text, conditionString,
                    allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName);

        }
        
        return isTrue;
    },

    conditionStringPartIsTrue: function(interactionType, text, conditionString, allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName) {
        var isTrue = false;

        var conditions = null, conditionOperator = 'and';
        if ( conditionString.indexOf(' and ') >= 0 ) {
            conditions = conditionString.split(' and ');
            conditionOperator = 'and';
        }
        else if ( conditionString.indexOf(' or ') >= 0 ) {
            conditions = conditionString.split(' or ');
            conditionOperator = 'or';
        }
        else {
            conditions = [conditionString];
        }

        var conditionReference = {thisType: ''}

        for (var i = 0; i < conditions.length; i++) {
            if ( ig.game.strings.trim( String(conditions[i]) ) != '' ) {
                    
                var thisIsTrue = this.conditionIsTrue(interactionType, text, conditions[i], conditionReference,
                        allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName);
    
                if (conditionOperator == 'and') {
                    isTrue = thisIsTrue;
                    if (!thisIsTrue) { isTrue = false; break; }
                }
                else if (conditionOperator == 'or') {
                    if (thisIsTrue) { isTrue = true; break; }
                }
                else {
                    isTrue = thisIsTrue; break;
                }
            }
        }

        return isTrue;
    },

    conditionIsTrue: function(interactionType, text, condition, conditionReference, allHas, allIs, allNumber, reactsTo, currentlyReactingTo, currentMotionOrDynamicName) {
        var isTrue = false;
        condition = ig.game.strings.trim(condition);
        if (condition && condition.indexOf('not in') === 0) {
            condition = 'not_in' + condition.substr( ('not in').length );
        }

        if ( !currentlyReactingTo || ( reactsTo instanceof Array && reactsTo.indexOf(currentlyReactingTo) >= 0 ) ) {
        
            if (currentlyReactingTo) {
                condition = ig.game.strings.replaceAll(condition, '@' + currentlyReactingTo + ' ', '');
                condition = ig.game.strings.replaceAll(condition, '@"' + currentlyReactingTo + '" ', '');
                condition = ig.game.strings.trim(condition);
            }

            var firstSpace = condition.indexOf(' ');
            if ( firstSpace === -1 && this.possibleInteractions.indexOf(condition) === -1 ) {
                if (conditionReference.thisType) {
                    condition = conditionReference.thisType + ' ' + condition;
                }
                firstSpace = condition.indexOf(' ');
            }

            var thisType = condition, value = '';
            if (firstSpace >= 0) {
                var leftWord = condition.substr(0, firstSpace);
                if ( this.possibleTypes.indexOf(leftWord) >= 0 ) {
                    thisType = condition.substr(0, firstSpace);
                    value = condition.substr(firstSpace + 1);
                }
                else {
                    if (conditionReference.thisType) { thisType = conditionReference.thisType; }
                    value = condition;
                }
            }

            var isNegation = ["hasn't", "isn't", "they_don't_embody", "they_don't_wear", "they_don't_hold",
                    "they_aren't", "they_don't_possess", "they_don't_have_attached",
                    'not_currently'].indexOf(thisType) >= 0;
            
            if (isNegation) { conditionReference.thisType = ''; }
            else { conditionReference.thisType = thisType; }
            
            if ( condition.indexOf('==') >= 0 || condition.indexOf('<') >= 0 || condition.indexOf('>') >= 0 || condition.indexOf('!=') >= 0 ) {
                isTrue = this.getMathConditionIsTrue(condition, allNumber);
            }
            else if (thisType == 'has') {
                isTrue = value == '*' || allHas.indexOf(value) >= 0;
            }
            else if (thisType == "hasn't") {
                if (value == '*') { isTrue = !allHas || allHas.length == 0; }
                else { isTrue = allHas.indexOf(value) == -1; }
            }
            else if (thisType == 'is') {
                isTrue = value == '*' || value == 'true' || allIs.indexOf(value) >= 0;
            }
            else if (thisType == "isn't") {
                if (value == '*') { isTrue = !allIs || allIs.length == 0; }
                else { isTrue = value == 'false' || ( !this.isBooleanOrBooleanString(value) && allIs.indexOf(value) === -1 ); }
            }

            else if (thisType == 'currently' || thisType == 'not_currently') {
                isTrue = value == '*' || value == 'true' ||
                    (
                        ( currentMotionOrDynamicName && currentMotionOrDynamicName.indexOf(value) >= 0 ) ||
                        ( value == 'playing' && ig.game.musicManager && ig.game.musicManager.isPlaying )
                    );
                if ( thisType.indexOf('not_currently') >= 0 ) { isTrue = !isTrue; }
            }
            
            else if (thisType == 'in' || thisType == 'not_in') {
                isTrue = this.getIsTrueWithOptionalPreciseMatch(ig.game.areaName, value);
                if ( thisType.indexOf('not_in') >= 0 ) { isTrue = !isTrue; }
            }

            else if (thisType == "they_are" || thisType == "they_aren't") {
                isTrue = value == '*' || value == 'true' ||
                        ( ig.game.ourPlayer && ig.game.ourPlayer.allIs && ig.game.ourPlayer.allIs.indexOf(value) >= 0 );
                if ( thisType.indexOf("aren't") >= 0 ) { isTrue = !isTrue; }
            }
            
            else if (thisType == "they_move") {
                var validParams = ['left', 'right', 'up', 'down'];
                if ( ig.game.ourPlayer && validParams.indexOf(value) >= 0 ) {
                    var vel = ig.game.ourPlayer.vel;
                    isTrue = (vel.x < 0 && value == 'left') ||
                             (vel.x > 0 && value == 'right') ||
                             (vel.y < 0 && value == 'up') ||
                             (vel.y > 0 && value == 'down');
                }
                else {
                    isTrue = false;
                }
            }
            else if (thisType == "they_embody" || thisType == "they_don't_embody") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.BODY];
                if (attachment && ig.game.attachmentManager.isEmbodyingBaseBody(ig.game.ourPlayer) ) {
                    attachment = null;
                }
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 );
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }
            else if (thisType == "they_mount" || thisType == "they_don't_mount") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.MOUNTABLE];
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 );
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }
            else if (thisType == "they_wear" || thisType == "they_don't_wear") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.WEARABLE];
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 ) &&
                        attachment.base == 'STACKWEAR';
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }
            else if (thisType == "they_have_attached" || thisType == "they_don't_have_attached") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.WEARABLE];
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 ) &&
                        attachment.base == 'DYNATHING';
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }
            else if (thisType == "they_have_equipped" || thisType == "they_don't_have_equipped") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.BRAIN];
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 );
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }
            else if (thisType == "they_hold" || thisType == "they_don't_hold") {
                var attachment = ig.game.ourPlayer.attachments[ig.game.attachmentManager.slots.HOLDABLE];
                isTrue = attachment && ( value == '*' || attachment.name.toLowerCase().indexOf(value) >= 0 );
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }

            else if (thisType == "they_possess" || thisType == "they_don't_possess") {
                isTrue = ig.game.motionDialog && ig.game.motionDialog.hasAreaPossessionOfThisName(value);
                if ( thisType.indexOf("don't") >= 0 ) { isTrue = !isTrue; }
            }

            else if (interactionType == thisType) {
                isTrue = this.getIsTrueWithOptionalPreciseMatch(text, value);
            }
        }

        return isTrue;
    },
    
    getMathConditionIsTrue: function(condition, allNumber) {
        var isTrue = false;
        if (!ig.game.motionDialog) { return false; }

        var operatorsLongerFirst = ['==', '<=', '>=', '<>', '!=', '=', '>', '<'];
        for (var i = 0; i < operatorsLongerFirst.length; i++) {
            var operator = operatorsLongerFirst[i];
            if ( condition.indexOf(operator) >= 0 ) {
            
                var numbers = condition.split(operator);
                if (numbers.length == 2) {
                    for (var numberI = 0; numberI < numbers.length; numberI++) {
                        numbers[numberI] = String(numbers[numberI]).trim();
                        
                        if ( numbers[numberI] != parseInt(numbers[numberI]) ) {
                            if ( numbers[numberI].indexOf('their ') == 0 ) {
                                numbers[numberI] = ( numbers[numberI] ).substr('their '.length);
                                numbers[numberI] = ig.game.motionDialog.getAreaPossessionNumberByName( numbers[numberI] );
                            }
                            else {
                                if ( allNumber[ numbers[numberI] ] !== undefined ) {
                                    numbers[numberI] = allNumber[ numbers[numberI] ];
                                }
                                else {
                                    numbers[numberI] = 0;
                                }
                            }
                        }
                        
                        if ( numbers[numberI] == parseInt(numbers[numberI]) ) {
                            numbers[numberI] = parseInt(numbers[numberI]);
                        }
                        else {
                            return false;
                        }
                        
                    }
                    
                    switch (operator) {
                        case '==':
                        case '=':  isTrue = numbers[0] == numbers[1]; break;
                        case '<>':
                        case '!=': isTrue = numbers[0] != numbers[1]; break;
                        case '<=': isTrue = numbers[0] <= numbers[1]; break;
                        case '>=': isTrue = numbers[0] >= numbers[1]; break;
                        case '<':  isTrue = numbers[0] <  numbers[1]; break;
                        case '>':  isTrue = numbers[0] >  numbers[1]; break;
                    }
                    
                }
                else {
                    return false;
                }
                break;
                
            }
        }
                
        return isTrue;
    },
    
    replaceConditionPlayerPossessionNumbers: function(s) {
    
    },
    
    getIsTrueWithOptionalPreciseMatch: function(correctContextText, userValue) {
        if (correctContextText === null || correctContextText === undefined) { correctContextText = ''; }
        var isTrue = userValue == '' || userValue == '*' || userValue == 'true';
        if (!isTrue) {
            var requirePreciseMatch = userValue.indexOf('"') === 0;
            if (requirePreciseMatch) {
                userValue = this.normalizePreciseMatchString(userValue);
                correctContextText = this.normalizePreciseMatchString(correctContextText);
                isTrue = correctContextText == userValue;
            }
            else {
                isTrue = correctContextText.indexOf(userValue) >= 0;
            }
        }
        return isTrue;
    },

    normalizePreciseMatchString: function(s) {
        if (s && typeof s === 'string') {
            var normalizedS = '';
            s = s.toLowerCase();
            var allowedLetters = 'abcdefghijklmnopqrstuvwxyz0123456789-_ ';
            for (var i = 0; i < s.length; i++) {
                var letter = s.substr(i, 1);
                if ( allowedLetters.indexOf(letter) >= 0 ) {
                    normalizedS += letter;
                }
            }
            normalizedS = normalizedS.trim();
            s = normalizedS;
        }
        return s;
    },

    deleteAllOldData: function() {
        if (!this.checkedForTooOldDataThisSession) {
            var dateNow = new Date();

            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);
                if ( key.indexOf('interacting_') === 0 ) {
                    var data = localStorage.getItem(key);
                    if (data) {
                        data = JSON.parse(data);
                        if (data.dateSaved) {
                            var oldDate = new Date(data.dateSaved);
                            var daysDifference = this.getDaysDifferenceBetween(oldDate, dateNow);
                            if (daysDifference > this.maxDaysToKeepStates) {
                                localStorage.removeItem(key);
                            }
                        }
                        else {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
            this.checkedForTooOldDataThisSession = true;
        }
    },

    getDaysDifferenceBetween: function(date1, date2) {
        var divider = 1000 * 3600 * 24;
        var timeDifference = Math.abs( date2.getTime() - date1.getTime() );
        return Math.floor(timeDifference / divider);
    },

    loadStoredDataIfNeeded: function(entity) {
        this.deleteAllOldData();

        var id = this.getStorageIdOfEntity(entity);
        if (id) {
            var data = localStorage.getItem(id);

            if (data) {
                data = JSON.parse(data);
                if (data.allHas && data.allHas instanceof Array) { entity.allHas = data.allHas; }
                if (data.allIs && data.allIs instanceof Array) { entity.allIs = data.allIs; }
                if (data.allNumber) { entity.allNumber = data.allNumber; }
                if (data.lastTimerDateInSec) { entity.lastTimerDateInSec = data.lastTimerDateInSec; }
            }
        }
    },

    saveStoredDataIfNeeded: function(entity) {
        var id = this.getStorageIdOfEntity(entity);
        if (id) {
            var data = {};
            if (entity.allIs && entity.allIs.length >= 1) { data.allIs = entity.allIs; }
            if (entity.allHas && entity.allHas.length >= 1) { data.allHas = entity.allHas; }
            if ( entity.allNumber && ml.Misc.getObjectLength(entity.allNumber) >= 1 ) { data.allNumber = entity.allNumber; }
            if (entity.lastTimerDateInSec) { data.lastTimerDateInSec = entity.lastTimerDateInSec; }

            if (data.allIs || data.allHas || data.allNumber || data.lastTimerDateInSec) {
                data.dateSaved = ig.game.strings.getIsoDateString();
                ig.game.localStorageManager.setItem( id, JSON.stringify(data) );
            }
            else {
                localStorage.removeItem(id);
            }

            this.updatePlayerStatesDialogIfNeeded();
        }
    },
    
    deleteStoreDataOfEntity: function(item, homeMapLocation) {
        var pseudoEntity = {thingTypeId: item.id, homeMapLocation: homeMapLocation};
        var id = this.getStorageIdOfEntity(pseudoEntity);
        if (id) {
            localStorage.removeItem(id);
            this.updatePlayerStatesDialogIfNeeded();
        }
    },

    getStorageIdOfEntity: function(entity) {
        var storageId = null;
        if (entity.homeMapLocation) {
            var plane = ig.game.sectorManager.currentPlane;
            var area = ig.game.sectorManager.currentArea;
            storageId = 'interacting_' + plane + '_' + area + '_' +
                    entity.homeMapLocation.x + '_' + entity.homeMapLocation.y +
                    '_' + entity.thingTypeId;
        }
        return storageId;
    },

    normalizeSomeoneVerbsInText: function(s) {
        s = ig.game.strings.replaceAll(s, 'someone at countdown 0', 'someone finishes_countdown');
        s = ig.game.strings.replaceAll(s, 'someone finishes countdown', 'someone finishes_countdown');
        s = ig.game.strings.replaceAll(s, 'someone at countdown', 'someone at_countdown');

        for (var i = 0; i < this.someoneVerbs.length; i++) {
            var verb = this.someoneVerbs[i];
            if ( verb.indexOf('_') >= 0 ) {
                var partToReplace = 'someone ' + verb + ' ';
                var partToFind = ig.game.strings.replaceAll(partToReplace, '_', ' ');
                s = ig.game.strings.replaceAll(s, partToFind, partToReplace);
            }
        }
        return s;
    },

    getReactsToList: function(s) {
        var match;
        if (s) { s = s.toLowerCase(); }
        s = this.normalizeSomeoneVerbsInText(s);

        var re = /@("[^"]+"|\S+)/g;
        var matches = [];
        while ( match = re.exec(s) ) { matches.push( match[1].replace(/\"/g, '') ); }

        for (var i = 0; i < this.someoneVerbs.length; i++) {
            var verb = this.someoneVerbs[i];
            var thisSomeone = 'someone ' + verb;
            if ( this.someoneVerbsWithoutObject.indexOf(verb) == -1 ) {
                thisSomeone += ' ';
            }

            if ( s.indexOf(thisSomeone) >= 0 ) {
                matches.push('someone_' + verb);
            }
        }

        var uniqueMatches = [];
        jQuery.each(matches, function(i, el){
            if (jQuery.inArray(el, uniqueMatches) === -1) { uniqueMatches.push(el); }
        });

        return uniqueMatches;
    },

    getReactsToSomeone: function(reactsTo) {
        var doesReactToSomeone = false;
        if (reactsTo && reactsTo.length >= 1) {
            for (var i = 0; i < reactsTo.length; i++) {
                if ( String(reactsTo[i]).toLowerCase().indexOf('someone') === 0 ) {
                    doesReactToSomeone = true;
                    break;
                }
            }
        }
        return doesReactToSomeone;
    },

    informSomeoneDid: function(player, verbString, objectString) {
        if (player && player.isOurPlayer) {
            var isValidVerbObject = verbString && ( objectString || this.someoneVerbsWithoutObject.indexOf(verbString) >= 0 );
            if (isValidVerbObject) {
                var entities = this.getInteractingEntitiesReactingToThisSomeoneAction(verbString, objectString);
                if (entities) {
                    for (var i = 0; i < entities.length; i++) {
                        entities[i].doReactToSomeoneDid(verbString, objectString);
                    }
                }
            }
        }
    },

    handleInteractingActivityReceived: function(triggeringPlayer, interactingEntityId, text, motionId, commands, has, hasnt, allNumber, throws, throwId, soundId, rumblesSeconds, resultId) {
        var entity = this.getInteractingEntityByCrossClientId(interactingEntityId);
        if (entity) {
            var disablesInteracting = ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting');
            
            if (text) {
                if ( this.getIsPlayerSelfSpeech(text) ) {
                    this.makePlayerSay(triggeringPlayer, text);
                }
                else {
                    var url = text.indexOf('http://') === 0 || text.indexOf('https://') === 0 ? text : null;
                    entity.pushActiveSpeechLineIfNeeded();
                    entity.speechDisplay.addLineFullText( ig.game.interactingManager.emboldMarkedText(text), url, true );
                    entity.timerLineSaidOrActionDone = new ml.Timer();
                }
            }
            if (motionId) {
                entity.triggerMotion(motionId, triggeringPlayer.remoteId);
            }

            if (commands) {
                for (var i = 0; i < commands.length; i++) {
                    var subPart = commands[i];
                    if (subPart.is) { entity.addToAllIs(subPart.is); }
                    if (subPart.isnt) { entity.removeFromAllIs(subPart.isnt); }
                }
            }

            if (has) { entity.addToAllHas(has); }
            if (hasnt) { entity.removeFromAllHas(hasnt); }
            
            if (allNumber) { entity.allNumber = allNumber; }
            
            if ( rumblesSeconds && rumblesSeconds == parseInt(rumblesSeconds) &&
                    rumblesSeconds >= 1 && rumblesSeconds <= this.maxSecondsDefault &&
                    !disablesInteracting ) {
                entity.triggerRumbles(rumblesSeconds);
            }

            if (throws) {
                if (entity.isAreaGlobalOrSimilar) {
                    entity.setAreaGlobalPositionByPlayer(triggeringPlayer);
                }
                entity.triggerThrow(throws, throwId);
            }

            if ( soundId && entity.distanceTo(ig.game.ourPlayer) < ig.system.widthHalf ) {
                ig.game.sounds.playFromLibrary(soundId);
            }

            if (resultId && !disablesInteracting) {
                entity.triggerResultById(triggeringPlayer, resultId);
            }

            entity.handleFacePlayer(triggeringPlayer);
        }
    },

    makePlayerSay: function(playerEntity, text) {
        if (playerEntity) {
            text = this.getPlayerSelfSpeech(text);
            text = this.emboldMarkedText(text);
            playerEntity.say(text);
        }
    },

    emboldMarkedText: function(s) {
        if (s && typeof s === 'string') {
            var stringLength = s.length;
            var newText = '';
            var doEmbold = false;
            var letter = null;
            for (var i = 0; i < stringLength; i++) {
                var previousLetter = letter;
                letter = s.substr(i, 1);
                if (letter == '*' && previousLetter == '*') { doEmbold = !doEmbold; }
                else if (doEmbold) { letter = letter.toUpperCase(); }
                newText += letter;
            }
            s = newText;
            s = ig.game.strings.replaceAll(s, '**', '');
        }
        return s;
    },

    getIsPlayerSelfSpeech: function(text) {
        return text && typeof text === 'string' && text.length >= 3 &&
                text.substr(0, 1) == '{' && text.indexOf('}') >= 2;
    },

    getPlayerSelfSpeech: function(text) {
        var selfSpeechText = null;
        if ( this.getIsPlayerSelfSpeech(text) ) {
            var endOf = text.indexOf('}')
            selfSpeechText = text.substr(1, endOf - 1);
        }
        return selfSpeechText;
    },

    getAreaGlobalCrossClientId: function() {
        return ig.game.areaGlobalInteractingId;
    },
    
    getBoostInteractingCrossClientId: function() {
        return ig.game.boostManager.interactingEntity ? ig.game.boostManager.interactingEntity.id : null;
    },

    getInteractingEntityByCrossClientId: function(crossClientId) {
        var targetEntity = null;
        if (crossClientId) {
            if ( crossClientId == this.getAreaGlobalCrossClientId() ) {
                return ig.game.areaGlobalInteractingEntity;

            }
            else if ( crossClientId == this.getBoostInteractingCrossClientId() ) {
                return ig.game.boostManager.interactingEntity;

            }
            else {
                var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
                if (entities) {
                    for (var i = 0; i < entities.length; i++) {
                        var entity = entities[i];
                        if (entity instanceof EntityInteract && !entity._killed &&
                                entity.crossClientId == crossClientId ) {
                            targetEntity = entity;
                            break;
                        }
                    }
                }

            }
        }
        return targetEntity;
    },

    informAffectedBodyOfSpeechIfNeeded: function(interactingEntity, speech) {
        var entities = ig.game.entitiesByType.default;
        if (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if ( !entity._killed && entity.hasInteractingBrain && interactingEntity.touches(entity) ) {
                    entity.interactingSpeech = speech;
                    break;
                }
            }
        }
    },

    updatePlayerStatesDialogIfNeeded: function() {
        if ( ig.game.isEditorHere && jQuery('#interactingStatesWrapper').length >= 1 ) {
            this.showPlayerStates();
        }
    },

    cacheLoadAllInteractingEntityData: function() {
        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        if (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof EntityInteract && !entity._killed) {
                    entity.loadDataIfNeeded();
                }
            }
        }
    },

    showPlayerStates: function() {
        this.cacheLoadAllInteractingEntityData();

        ig.game.alertDialog.close();
        var s = '<p>My states in ' +
                ig.game.strings.htmlEscape(ig.game.areaGroupName) + '</p>';

        s += '<div class="interactingStatesSection"><strong>YOU</strong>: ';
        s += '<span class="interactingStateTypeOf">THEY ARE</span><br/>';
        var sStates = '';
        for (var i = 0; i < ig.game.ourPlayer.allIs.length; i++) {
            var key = ig.game.ourPlayer.allIs[i];
            var quotedKey = "'" + ig.game.strings.htmlEscape(key) + "'";

            sStates += '<div class="interactingState">';
            sStates += ig.game.strings.htmlEscape(key);
            sStates += '&nbsp; <span class="pseudolink" style="color: #a55; text-decoration: none" onclick="' +
                    'javascript:ig.game.interactingManager.clearTheyAreState(' + quotedKey + ')">x</span>';
            sStates += '</div>';
        }
        if (!sStates) { s += '<div class="interactingStateEmpty">-</div>'; }
        s += sStates;
        s += '</div>';

        s += '<div id="interactingStates"></div>';

        s = '<div id="interactingStatesWrapper">' + s + '</div>';
        var doShowAtSide = true;
        ig.game.alertDialog.open(s, true, undefined, undefined, undefined, true, undefined, doShowAtSide);

        this.loadShowInteractingStates();
    },

    clearInteractingState: function(typeString, state, storageKey) {
        var dataString = localStorage.getItem(storageKey);
        if (dataString) {
            var data = JSON.parse(dataString);

            if (typeString == 'is' && data.allIs) {
                var index = data.allIs.indexOf(state);
                if (index >= 0) { data.allIs.splice(index, 1); }
            }
            else if (typeString == 'has' && data.allHas) {
                var index = data.allHas.indexOf(state);
                if (index >= 0) { data.allHas.splice(index, 1); }
            }

            if ( (data.allIs && data.allIs.length >= 1) ||
                 (data.allHas && data.allHas.length >= 1)
                    ) {
                data.dateSaved = ig.game.strings.getIsoDateString();
                ig.game.localStorageManager.setItem( storageKey, JSON.stringify(data) );
            }
            else {
                localStorage.removeItem(storageKey);
            }
        }

        var entities = ig.game.entitiesByType.betweenDefaultAndPlayer;
        if (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity instanceof EntityInteract && !entity._killed) {
                    var thisKey = this.getStorageIdOfEntity(entity);
                    if (thisKey == storageKey) {
                        entity.allHas = [];
                        entity.allIs = [];
                        entity.allNumber = {};
                        entity.lastTimerDateInSec = null;
                        this.loadStoredDataIfNeeded(entity);
                        break;
                    }
                }
            }
        }

        ig.game.sounds.bin.play();
        this.showPlayerStates();
    },

    loadShowInteractingStates: function() {
        var getStatesList = function(typeString, arr, storageKey) {
            var s = '';
            if (arr && arr.length > 0) {
                s += '<span class="interactingStateTypeOf">' + typeString.toUpperCase() + '</span><br/>';
                for (var i = 0; i < arr.length; i++) {
                    var params =
                            "'" + typeString + "'," +
                            "'" + ig.game.strings.htmlEscape(arr[i]) + "'," +
                            "'" + ig.game.strings.htmlEscape(storageKey) + "'";
                    s += '<div class="interactingState">';
                    s += ig.game.strings.htmlEscape( arr[i] );
                    s += '&nbsp; <span class="pseudolink" style="color: #a55; text-decoration: none" onclick="' +
                            'javascript:ig.game.interactingManager.clearInteractingState(' + params + ')">' +
                            'x</span>';
                    s += '</div>';
                }
            }
            return s;
        };

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if ( key.indexOf('interacting_') === 0 ) {
                var parts = key.split('_');
                var isCurrent = parts[1] == ig.game.sectorManager.currentPlane &&
                                parts[2] == ig.game.sectorManager.currentArea;
                var itemId = parts[parts.length - 1];

                if (isCurrent && itemId) {
                    var item = ig.game.itemCache.getItemBasic(itemId, 'int_load_show');
                    var self = this;
                    item.basicDataLoading.done(function(){
                        if (item.name) {

                            var s = '';
    
                            s += '<div class="interactingStatesSection"><strong>' +
                                    ig.game.strings.htmlEscape( item.name.toUpperCase() ) +
                                '</strong>: ';
    
                            var data = localStorage.getItem(key);
                            if (data) {
                                try {
                                    data = JSON.parse(data);
                                    var isList = getStatesList('is', data.allIs, key);
                                    var hasList = getStatesList('has', data.allHas, key);
        
                                    var list = [];
                                    if (isList) { list.push(isList); }
                                    if (hasList) { list.push(hasList); }
                                    
                                    s += list.join('<br/>');
                                    
                                    if (data.allNumber) {
                                        s += JSON.stringify(data.allNumber);
                                    }
                                }
                                catch (err) {
                                }
                                
                            }
                            s += '</div>';
    
                            jQuery('#interactingStates').append(s);

                        }                        
                    });
                }
            }
        }
    },
    
    handleTheyAreSpeechCommand: function(speech) {
        speech = ig.game.strings.replaceAll(speech, 'theyare ', '');
        speech = ig.game.strings.replaceAll(speech, '!', '');
        ig.game.ourPlayer.addToAllIs( speech.trim().toLowerCase() );
    },

    handleTheyArentSpeechCommand: function(speech) {
        ig.game.sounds.bin.play();
        speech = ig.game.strings.replaceAll(speech, 'theyarent ', '');
        speech = ig.game.strings.replaceAll(speech, '!', '');
        ig.game.ourPlayer.removeFromAllIs( speech.trim().toLowerCase() );
    },

    clearTheyAreState: function(key) {
        ig.game.ourPlayer.removeFromAllIs(key);
        ig.game.sounds.bin.play();
        ig.game.interactingManager.showPlayerStates();
    },

    getDoesCheckNearsOrReachesOrSimilar: function(source) {
        var doesCheck = false;
        if (source && typeof source === 'string') {
            source = source.toLowerCase();
            if (
                ( source.indexOf('approaches ') >= 0 || source.indexOf('approaches:') >= 0 ) ||
                ( source.indexOf('approached ') >= 0 || source.indexOf('approached:') >= 0 ) ||
                ( source.indexOf('nears ') >= 0 || source.indexOf('nears:') >= 0 ) ||
                ( source.indexOf('neared ') >= 0 || source.indexOf('neared:') >= 0 ) ||
                ( source.indexOf('reaches ') >= 0 || source.indexOf('reaches:') >= 0 ) ||
                ( source.indexOf('reached ') >= 0 || source.indexOf('reached:') >= 0 ) ||
                ( source.indexOf('views ') >= 0 || source.indexOf('views:') >= 0 ) ||
                ( source.indexOf('viewed ') >= 0 || source.indexOf('viewed:') >= 0 ) ||
                ( source.indexOf('hits ') >= 0 || source.indexOf('hits:') >= 0 ) ) {

                try {
                    var data = this.getParsedData(source, []);
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            var part = data[i];
                            if ( part.condition &&
                                    ( part.condition.toLowerCase().indexOf('approaches') >= 0 ||
                                      part.condition.toLowerCase().indexOf('approached') >= 0 ||  
                                      part.condition.toLowerCase().indexOf('nears') >= 0 ||
                                      part.condition.toLowerCase().indexOf('neared') >= 0 ||
                                      part.condition.toLowerCase().indexOf('reaches') >= 0 ||
                                      part.condition.toLowerCase().indexOf('reached') >= 0 ||
                                      part.condition.toLowerCase().indexOf('views') >= 0 ||
                                      part.condition.toLowerCase().indexOf('viewed') >= 0 ||
                                      part.condition.toLowerCase().indexOf('hits') >= 0
                                    ) ) {
                                doesCheck = true;
                                break;
                            }
                        }
                    }
                }
                catch (err) {
                    console.log('Guarded against Interacting parse error.', source);
                }

            }
        }
        return doesCheck;
    },

    getMakesUseOfEnterCommand: function(data) {
        var enterFound = false;
        if (data && data.length >= 1) {
            for (var i = 0; i < data.length; i++) {
                var part = data[i];
                if ( part.condition &&
                        (
                        (part.condition == 'enters' || part.condition.indexOf('enters ') >= 0 ||
                        part.condition.indexOf(' enters') >= 0 ) ||
                        (part.condition == 'entered' || part.condition.indexOf('entered ') >= 0 ||
                        part.condition.indexOf(' entered') >= 0 )
                        )
                    ) {
                    enterFound = true;
                    break;
                }
            }
        }
        return enterFound;
    },

    correctActionSyntaxIfNeeded: function(text) {
        for (var i = 0; i < this.definedActions.length; i++) {
            var action = this.definedActions[i];
            var actionWithoutS = action.substr(0, action.length - 1);
            text = ig.game.strings.replaceAll(text, '/' + actionWithoutS + ' ', '/' + action + ' ');
        }
        return text;
    },
    
    showDebugInformation: function(textData, thingReferences) {
        window.consoleref.clear();
        
        var prettyThingReferences = [];
        if (thingReferences) {
            prettyThingReferences = ig.game.cloneObject(thingReferences);
            for (var i = 0; i < prettyThingReferences.length; i++) {
                prettyThingReferences[i][0] = prettyThingReferences[i][1] + ' [reference found]';
            }
        }
        
        var data = this.getParsedData(textData, prettyThingReferences);
        if (data) {
            var lastContext = -1;
            for (var i = 0; i < data.length; i++) {
                var line = data[i];
                var context = line.context;
                
                delete line.interactionBased;
                delete line.context;
                
                var lineString = JSON.stringify(line);
                if (lineString.length >= 3) { lineString = lineString.substr(1, lineString.length - 2); }
                if (context) { lineString = '    ' + lineString; }

                if ( (lastContext && lastContext != context) || lineString.indexOf('"setContext"') >= 0 ) {
                    window.consoleref.log('');
                }
                
                window.consoleref.log(lineString);
                
                lastContext = line.context;
            }
        }
    },

});

});