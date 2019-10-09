ig.module('game.entities.immobile.interact')
.requires('impact.entity', 'game.ui.speechdisplay')
.defines(function(){
'use strict';

window.EntityInteract = ig.Entity.extend({

    data: null,
    allHas: [],
    allIs: [],
    allNumber: {},
    lastReceived: null,
    lastSaid: [],
    lastHeard: '',
    currentResult: [],
    currentContext: null,
    timerLineSaidOrActionDone: null,
    speechDisplay: null,
    betweenDefaultAndPlayer: true,
    hasSpeech: true,
    lastTimerDateInSec: null,
    reactsTo: [],
    boundingBox: null,
    boundingBoxOriginal: null,
    currentlyReactingTo: null,
    size: {x: 29, y: 29},
    gravityFactor: 0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    ourPlayerTouching: false,
    ourPlayerTouchingPrevious: false,
    ourPlayerTouchingExactly: false,
    ourPlayerTouchingExactlyPrevious: false,
    ourPlayerInMediumRange: false,
    ourPlayerInMediumRangePrevious: false,
    lastCellChangeTimer: null,
    minChangeTime: 2,
    delayedReaction: null,
    delayedReactionTimer: null,
    faceNearestTimer: null,
    defaultFlip: null,
    crossClientId: null,
    thingReferences: [],
    currentMotion: null,
    currentDynamic: null,
    imageSize: 29,
    alwaysUpdate: true,
    checksNears: false,
    posOriginal: {x: null, y: null},
    sizeOriginal: {x: null, y: null},
    offsetOriginal: {x: null, y: null},
    isAreaGlobalOrSimilar: false,
    posWhenSomethingWasShown: null,
    didInformArrivedIfNeeded: false,
    delaySecondsDefault: 2,
    delaySeconds: 2,
    makesUseOfEnterCommand: undefined,
    isPlacedByInteracting: false,
    previousOurPlayerVel: null,
    rumbles: {timer: null, endSeconds: null, justStarted: null},
    lastThrowIdHitBy: null,
    triedAreaBanBefore: false,
    thingBelow: undefined,
    isActivelyReacting: false,

    init: function(x, y, settings) {
        this.checksNears = !!settings.checksNears;
        this.reactsTo = settings.reactsTo;
        
        this.isAreaGlobalOrSimilar = settings.isAreaGlobalOrSimilar;
        this.boundingBox = settings.boundingBox;
        if (this.boundingBox) {
            this.boundingBoxOriginal = ig.game.cloneObject(this.boundingBox);
        }

        if (settings.attributes) { this.attributes = settings.attributes; }
        if (settings.isPlacedByInteracting) { this.isPlacedByInteracting = true; }

        this.parent(x, y, settings);

        if (this.attributes && this.attributes.affectsBelow && this.homeMapLocation && !this.isInHolderOrDialog) {
            this.pos.y += ig.game.tileSize;
            this.homeMapLocation.y++;
        }

        this.posOriginal = ig.game.cloneObject(this.pos);
        this.sizeOriginal = ig.game.cloneObject(this.size);
        this.offsetOriginal = ig.game.cloneObject(this.offset);

        if (this.isAreaGlobalOrSimilar) {
            this.crossClientId = ig.game.interactingManager.getAreaGlobalCrossClientId();
        }
        else {
            this.crossClientId = this.thingTypeId + '_' + x + '_' + y;
        }

        this.addAnim('cell1', 1, [0]);
        this.addAnim('cell2', 1, [1]);
        this.currentAnim = this.anims.cell1;
        this.lastCellChangeTimer = new ml.Timer();

        this.speechDisplay = new SpeechDisplay(this);

        var attributesWereSomehowEmptied = !this.attributes;
        if (attributesWereSomehowEmptied) { this.attributes = {}; }

        if (!this.attributes.nonFlipping) { this.faceNearestTimer = new ml.Timer(); }

        this.defaultFlip = !!( (x - y) % 2 );
        if (this.attributes.nonFlipping || this.isInHolderOrDialog) { this.defaultFlip = false; }
        else if (this.attributes.facesAway) { this.defaultFlip = !this.defaultFlip; }

        this.anims.cell1.flip.x = this.anims.cell2.flip.x = this.defaultFlip;

        this.posOriginal = ig.game.cloneObject(this.pos);
        this.initViaBoundingBox();

        if (this.attributes.solid) { this.setSolidTo(true); }

        if (!this.isInDialog) {
            if (this.isInHolderOrDialog) {
                this.loadDataIfNeeded();
            }
            else {
                var maxBytesToPreload = 15000;
                if ( ig.game.sectorManager.isPublicArea() ) {
                    if ( ig.game.sectorManager.playerIsCloseToProtectedCenter() ) {
                        maxBytesToPreload = 0;
                    }
                    else {
                        maxBytesToPreload = 1000;
                    }
                }
               
                if (settings.textSize && settings.textSize <= maxBytesToPreload) {
                    var checksArrivesAnyway = this.reactsTo && this.reactsTo.indexOf('someone_arrives') >= 0;
                    if (!checksArrivesAnyway) {
                        this.loadDataIfNeeded();
                    }
                }
            }
        }
    },

    initViaBoundingBox: function() {
        var box = this.boundingBox;
        if (box) {
            box = {x: box[0], y: box[1], width: box[2] - box[0] + 1, height: box[3] - box[1] + 1};
            this.size = {x: box.width, y: box.height};

            var pushX = (this.imageSize - this.size.x) / 2;
            this.offset.x = -pushX;
            this.pos.x += pushX - ig.game.tileSize / 4;

            if (box.y > 0) {
                this.pos.y -= Math.ceil(ig.game.tileSizeHalf) ;

                var pushY = (this.imageSize - this.size.y);
                this.offset.y = -pushY;
                this.pos.y += pushY;
            }
        }
    },

    initViaAttributes: function() {
        if (this.attributes.steadyChange) {
            this.steadyChange = true;
            this.minChangeTime = 3;
        }

        if (this.attributes.slowChange) {
            this.minChangeTime = 6;
        }
    },

    reactTo: function(interactionType, text) {
        if ( ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) { return false; }
        else if (this.isInDialog) { return false; }
    
        var success = false;
        this.isActivelyReacting = ['viewed', 'reaches', 'nears', 'approaches'].indexOf(interactionType) >= 0;
        
        if ( (text != '' || interactionType == 'viewed' || interactionType == 'approaches' || interactionType == 'nears' || interactionType == 'reaches') &&
                !this.timerLineSaidOrActionDone && !ig.game.portaller.isTeleporting ) {

            if (typeof text != 'string') { text = ''; }
            text = text.toLowerCase();

            if (interactionType == 'hears') {
                this.lastHeard = ig.game.strings.trim(text);
                this.lastHeard = ig.game.strings.replaceAll(this.lastHeard, '@embedding ', '');
            }

            this.currentResult = this.getResult(interactionType, text);
            
            if (!this.currentResult) {
                var context = this.currentContext;
                this.currentContext = null;
                this.currentResult = this.getResult(interactionType, text, null, true);
                this.currentContext = context;
            }

            if (!this.currentResult && interactionType == 'hears' && !this.currentlyReactingTo) {
                this.currentResult = this.getResult(null, null, null, true);
            }

            if (this.currentResult) {
                var gets = null;
                if (interactionType == 'gets') {
                    this.addToAllHas(text);
                    gets = text;
                }

                var alwaysDelayReaction = interactionType == 'hears';
                this.continueCurrentResult(gets, alwaysDelayReaction);
                success = true;
            }
        }
        
        this.isActivelyReacting = false;
        return success;
    },

    reactToPlainAction: function(isPreciseOverlap) {
        if ( ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) { return false; }
    
        var success = false;
        if ( (!this.currentResult || this.currentResult.length == 0) &&
                !this.timerLineSaidOrActionDone && !ig.game.portaller.isTeleporting ) {
                
            this.currentResult = this.getResult();
            if (this.currentResult) {
                this.continueCurrentResult();
                success = true;
            }
            else {
                if (isPreciseOverlap) { this.currentResult = this.getResult('touches', '*', null, true); }
                if (this.currentResult) {
                    this.continueCurrentResult();
                }
            }
        }
        return success;
    },

    reactToOtherInteracting: function(interactionType, text, interactingName, currentReactionCount) {
        if ( ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) { return false; }

        if (!this.delayedReaction && !this.delayedReactionTimer && !ig.game.portaller.isTeleporting) {
            var endSeconds = currentReactionCount * .1;
            this.delayedReaction = {interactionType: interactionType, text: text, interactingName: interactingName, endSeconds: endSeconds};
            this.delayedReactionTimer = new ml.Timer();
        }
    },

    doReactToOtherInteractingOrEmbedding: function(interactionType, text, interactingName) {
        if ( ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) { return false; }
    
        if (interactionType && text && interactingName && !ig.game.portaller.isTeleporting) {
        
            this.currentlyReactingTo = interactingName;
            if (this.data == null) {
                this.data = [];
                var self = this;
                ig.game.itemCache.getItem_P(self.thingTypeId, 'interact1').done(function(item) {
                    var textData = item.textData;
                    self.thingReferences = item.thingRefs;
                    self.data = ig.game.interactingManager.getParsedData(textData, self.thingReferences);
                    ig.game.interactingManager.loadStoredDataIfNeeded(self);
                    self.reactTo(interactionType, text);
                });
            }
            else {
                this.reactTo(interactionType, text);
            }

            this.reactionDelayTimeout = null;
        }
    },

    doReactToSomeoneDid: function(verbString, objectString) {
        if ( this.isInHolderOrDialog || !ig.game.sectorManager.isCurrentAreaCore() ) {
            if ( ig.game.ourPlayer && ig.game.ourPlayer.getWearableHasAttribute('disablesInteracting') ) { return false; }
        
            if (verbString) {
            
                if (this.data == null) {
                
                    this.data = [];
                    var self = this;
                    ig.game.itemCache.getItem_P(self.thingTypeId, 'interact2').done(function(item) {
                        var textData = item.textData;
                        self.thingReferences = item.thingRefs;
                        self.data = ig.game.interactingManager.getParsedData(textData, self.thingReferences);
                        ig.game.interactingManager.loadStoredDataIfNeeded(self);
                        self.reactTo('someone_' + verbString, objectString);
                    });
                }
                else {
                    this.reactTo('someone_' + verbString, objectString);
                }

                this.reactionDelayTimeout = null;
            }
        }
    },

    setContext: function(context) {
        this.currentContext = context;
    },

    clearContext: function() {
        this.currentContext = null;
    },

    handleFacePlayer: function(player) {
        if (!this.isInHolderOrDialog && player && player.pos && !this.attributes.nonFlipping && !this.currentlyReactingTo) {
            var flip = this.pos.x < player.pos.x;
            if (this.attributes.facesAway) { flip = !flip; }
            this.anims.cell1.flip.x = this.anims.cell2.flip.x = flip;

        }
    },

    pushActiveSpeechLineIfNeeded: function() {
        var activeSpeechLine = this.speechDisplay.activeLine();
        if (activeSpeechLine && !activeSpeechLine.moving) {
            activeSpeechLine.moving = true;
        }
    },

    getLastTimerSeconds: function() {
        var seconds = null;
        if (this.lastTimerDateInSec) {
            var now = new Date();
            seconds = now.getSeconds() - this.lastTimerDateInSec;
        }
        return seconds;
    },

    continueCurrentResult: function(optionalGets, alwaysDelayReaction) {
        this.pushActiveSpeechLineIfNeeded();

        if (this.currentResult && this.currentResult.length >= 1) {
            var resultPart = this.currentResult.shift();
            var say = resultPart.say;
            
            var thisThrowId;
            var url = say && say.indexOf('://') >= 0 ? say : null;
            if (say && !url) {
                say = say.toLowerCase();
                say = ig.game.interactingManager.replacePlaceHolders( say,
                        this.allHas, this.allIs, this.allNumber, this.lastReceived, this.lastHeard, this.getLastTimerSeconds() );
            }

            this.logSaid(say);

            if (resultPart.gives) { this.handleGiveThing(resultPart.gives); }
            if (resultPart.removes) { this.handleRemoveAttachment(resultPart.removes); }
            if (resultPart.motion) {
                ig.game.interactingManager.informNearbyOfInteractingEntityAction(this.pos, 'sees', resultPart.motion, this.givenName, this.id);
            }
            if (say) {
                var isUrlAndPasteSupported = false;
                var isUrlBlacklisted = false;
                if (url) {
                    url = ig.game.interactingManager.replacePlaceHolders( url,
                            this.allHas, this.allIs, this.allNumber, this.lastReceived, this.lastHeard, this.getLastTimerSeconds() );
                    isUrlAndPasteSupported = ml.Misc.handleDoPaste(url, ig.game.ourPlayer.remoteId, true, true);
                    say = isUrlAndPasteSupported ? '' : ig.game.strings.getShortUrl(url);
                    isUrlBlacklisted = Boolean( ig.game.panelSet && ig.game.panelSet.musicPlayer &&
                            ig.game.panelSet.musicPlayer.isUrlBlacklisted(url) );
                }
                
                if (!isUrlAndPasteSupported && !isUrlBlacklisted) {
                    if ( ig.game.interactingManager.getIsPlayerSelfSpeech(say) ) {
                        ig.game.interactingManager.makePlayerSay(ig.game.ourPlayer, say);
                    }
                    else {
                        this.updateSpeechDisplayPos();
                        this.speechDisplay.addLineFullText( ig.game.interactingManager.emboldMarkedText(say), url, true, this.isAreaGlobalOrSimilar );
                        if (!this.isAreaGlobalOrSimilar) {
                            ig.game.interactingManager.informNearbyOfInteractingEntityAction(this.pos, 'hears', say, this.givenName, this.id);
                            if (this.attributes && this.attributes.affectsBelow) {
                                ig.game.interactingManager.informAffectedBodyOfSpeechIfNeeded(this, say);
                            }
                        }
                    }
                }
            }
            if (resultPart.motionId) {
                this.triggerMotion(resultPart.motionId, ig.game.ourPlayer.remoteId);
            }

            if (resultPart.triggerMotionText) {
                this.triggerMotionOfPlayer(resultPart.triggerMotionText, resultPart.triggerMotionId);
            }

            if (resultPart.harms) { this.doHarm(resultPart.harms); }
            if (resultPart.heals) { this.doHeal(resultPart.heals); }
            
            if (resultPart.limits) {
                for (var limitI = 0; limitI < resultPart.limits.length; limitI++) {
                    var params = resultPart.limits[limitI];
                    ig.game.interactingManager.setNumberLimit( params[0], params[1], params[2], params[3], params[4] );
                }
            }
            
            var isCreatedArea = ig.game.sectorManager.isCreatedArea();
            
            for (var publicPrivateI = 1; publicPrivateI <= 2; publicPrivateI++) {
                var commands = publicPrivateI == 1 ? resultPart.commands : resultPart.privateCommands;
                if (commands) {
                    for (var i = 0; i < commands.length; i++) {
                    
                        var subPart = commands[i];
                        
                        if (subPart.is) { this.addToAllIs(subPart.is); }
                        if (subPart.isnt) { this.removeFromAllIs(subPart.isnt); }
                        if (subPart.theyAre) { ig.game.ourPlayer.addToAllIs(subPart.theyAre); }
                        if (subPart.theyArent) { ig.game.ourPlayer.removeFromAllIs(subPart.theyArent); }
                        
                        if (isCreatedArea) {
                            if (subPart.removeAreaPossession) {
                                var itemId = ig.game.motionDialog.getAreaPossessionItemIdByName(subPart.removeAreaPossession);
                                if (itemId) { ig.game.motionDialog.removeAreaPossessionItem(itemId); }
                            }
                            
                            if (subPart.addAreaPossession) {
                                ig.game.motionDialog.addAreaPossessionItem(subPart.addAreaPossession);
                            }

                            if (subPart.removeAllAreaPossessions) {
                                ig.game.motionDialog.removeAllAreaPossessionItems(subPart.removeAreaPossession);
                            }
                        }

                    }
                }
            }

            if (resultPart.hasnt) { this.removeFromAllHas(resultPart.hasnt); }

            this.handleResultPartMath(resultPart.changeNumber);

            if (isCreatedArea) {
                if (resultPart.theyAutoHeal !== undefined) {
                    ig.game.autoHeals = Boolean(resultPart.theyAutoHeal);
                }
                if (resultPart.theyCanOpenMap !== undefined) {
                    ig.game.theyCanOpenMap = Boolean(resultPart.theyCanOpenMap);
                    if (!ig.game.theyCanOpenMap && ig.game.userMapDialog && ig.game.userMapDialog.isOpen) {
                        ig.game.userMapDialog.close();
                    }
                }
                if (resultPart.theyCanDrown !== undefined) {
                    ig.game.theyCanDrown = Boolean(resultPart.theyCanDrown);
                }
                if (resultPart.theyCanBoost !== undefined) {
                    ig.game.theyCanBoost = Boolean(resultPart.theyCanBoost);
                }
                if (resultPart.theyCanUseAllBoosts !== undefined) {
                    ig.game.theyCanUseAllBoosts = Boolean(resultPart.theyCanUseAllBoosts);
                }
                if (resultPart.theyCanPaste !== undefined) {
                    ig.game.theyCanPaste = Boolean(resultPart.theyCanPaste);
                }
                if (resultPart.theyAlwaysSeeInstrumentNoteLabels !== undefined) {
                    ig.game.theyAlwaysSeeInstrumentNoteLabels = Boolean(resultPart.theyAlwaysSeeInstrumentNoteLabels);
                }
                if (resultPart.theyCanSeeNameTags !== undefined) {
                    ig.game.theyCanSeeNameTags = Boolean(resultPart.theyCanSeeNameTags);
                    if (!ig.game.theyCanSeeNameTags) {
                        ig.game.speechManager.saySelfGuidanceText('cantSeeNameTags');
                    }
                }
                if (resultPart.theyCanBeAffectedByNonFullAccounts !== undefined) {
                    ig.game.affectedByNonFullAccounts = Boolean(resultPart.theyCanBeAffectedByNonFullAccounts);
                }
                if (resultPart.theyCanBeAffectedByNonFriends !== undefined) {
                    ig.game.affectedByNonFriends = Boolean(resultPart.theyCanBeAffectedByNonFriends);
                }
                if (resultPart.theyCanMapTeleport !== undefined) {
                    ig.game.theyCanMapTeleport = Boolean(resultPart.theyCanMapTeleport);
                }
                
                if (resultPart.theyCanRemoveDynamic !== undefined) {
                    ig.game.theyCanRemoveDynamic = Boolean(resultPart.theyCanRemoveDynamic);
                }
                if (resultPart.theyCanRemoveHoldable !== undefined) {
                    ig.game.theyCanRemoveHoldable = Boolean(resultPart.theyCanRemoveHoldable);
                }
                if (resultPart.theyCanRemoveWearable !== undefined) {
                    ig.game.theyCanRemoveWearable = Boolean(resultPart.theyCanRemoveWearable);
                }
                if (resultPart.theyCanRemoveMountable !== undefined) {
                    ig.game.theyCanRemoveMountable = Boolean(resultPart.theyCanRemoveMountable);
                }
                if (resultPart.theyCanRemoveBrain !== undefined) {
                    ig.game.theyCanRemoveBrain = Boolean(resultPart.theyCanRemoveBrain);
                }
                
                if (resultPart.theyCanBeAffectedByFriends !== undefined) {
                    ig.game.affectedByFriends = Boolean(resultPart.theyCanBeAffectedByFriends);
                }
                if (resultPart.theyCanBeAffectedByBrainEquippers !== undefined) {
                    ig.game.affectedByBrainEquippers = Boolean(resultPart.theyCanBeAffectedByBrainEquippers);
                }
                if (resultPart.theyAutoSetSpawnpoints !== undefined) {
                    ig.game.respawnPointManager.isHandledAutomatic = Boolean(resultPart.theyAutoSetSpawnpoints);
                }
                
                if (resultPart.setSpawnPoint) {
                    ig.game.respawnPointManager.setRespawnPointOnPlayerPos();
                }
            }

            if (resultPart.throws) {
                thisThrowId = ig.game.getRandomInt(1, 100000);
                this.triggerThrow(resultPart.throws, thisThrowId);
            }
            
            if (resultPart.relocationsGoTo && ig.game.areaProtection == 'INDIVIDUALS' &&
                    !sessionStorage.relocatedToCustomAreaOnce) {
                ig.game.relocationAreaIfTooManyPeople = resultPart.relocationsGoTo;
            }
            
            if (resultPart.areaBanForNMinutes && !ig.game.isEditorHere && ig.game.areaProtection == 'INDIVIDUALS' &&
                    !this.triedAreaBanBefore) {
                var groupIdOrNumber = ig.game.sectorManager.getAreaGroupIdOrNumber();
                this.triedAreaBanBefore = true;
                ig.game.httpApi.addUserToAreaBans_P(groupIdOrNumber, ig.game.ourPlayer.remoteId, resultPart.areaBanForNMinutes).done(function(result){
                });
            }

            if (resultPart.timer) {
                this.lastTimer = new ml.Timer();
                var now = new Date();
                this.lastTimerDateInSec = now.getSeconds();
                ig.game.interactingManager.saveStoredDataIfNeeded(this);
            }
            
            if ( !ig.game.sectorManager.isPublicArea() ) {
                if (resultPart.countdown) {
                    ig.game.interactingManager.startCountdown(resultPart.countdown, resultPart.countdownIsVisible);
                }
                if (resultPart.countdownClear) {
                    ig.game.interactingManager.clearCountdown();
                }
                if (resultPart.countdownAdd) {
                    ig.game.interactingManager.addToCountdown(resultPart.countdownAdd);
                }
            }
            
            if (resultPart.bumps) { this.applyBumpsPlayer(resultPart.bumps); }

            if (resultPart.embedUrl) { this.addEmbedding(resultPart.embedUrl); }
            if (resultPart.removeEmbedding) { this.removeEmbedding(); }

            if (resultPart.rumblesSeconds) { this.triggerRumbles(resultPart.rumblesSeconds); }
            if (resultPart.showsId) { this.showById(resultPart.showsId, resultPart.lockAtHolderPage); }

            if ( resultPart.theyFocusHere !== undefined && !this.isAreaGlobalOrSimilar &&
                    !this.isInHolderOrDialog && !ig.game.sectorManager.isSpawnArea() ) {
                if (resultPart.theyFocusHere) {
                    ig.game.camera.customFocusEntity = this;
                }
                else if (ig.game.camera.customFocusEntity &&
                        ig.game.camera.customFocusEntity.crossClientId == this.crossClientId) {
                    ig.game.camera.customFocusEntity = null;
                }
            }
            
            if (resultPart.stopMusic) {
                ig.game.musicManager.stopPlaying();
            }
            if ( resultPart.playsSoundId && this.distanceTo(ig.game.ourPlayer) < ig.system.widthHalf ) {
                ig.game.sounds.playFromLibrary(resultPart.playsSoundId);
            }

            if (resultPart.transports) { this.applyTransportsPlayer(resultPart.transports); }
                
            if (!this.isInHolderOrDialog && resultPart.transportToHere) { this.transportPlayerToHere(); }

            this.handleFacePlayer(ig.game.ourPlayer);

            if (resultPart.setContext !== undefined && resultPart.setContext !== null) {
                if (resultPart.setContext == '') { this.clearContext(); }
                else { this.setContext(resultPart.setContext); }
            }

            this.autoContinue = !!resultPart.autoContinue;

            if (resultPart.toMarker) {
                this.currentResult = this.getResult(null, null, resultPart.toMarker);
            }

            if (resultPart.to) {
                this.handleTeleport(resultPart);
            }
            else if ( !this.isInHolderOrDialog &&
                    (say || resultPart.motionId || resultPart.playsSoundId || resultPart.commands || optionalGets ||
                    resultPart.changeNumber || resultPart.throws || resultPart.hasnt || resultPart.rumblesSeconds || resultPart.id)
                    ) {
                ig.game.websocketComs.transmitInteractingActivity(this.crossClientId, say, resultPart.motionId,
                        resultPart.commands, optionalGets, resultPart.hasnt, resultPart.changeNumber ? this.allNumber : null,
                        resultPart.throws, thisThrowId, resultPart.playsSoundId, resultPart.rumblesSeconds,
                        resultPart.id);
            }

            if ( (this.currentResult && this.currentResult.length >= 1) || this.autoContinue ) {
                if (resultPart.delaySeconds) { this.delaySeconds = parseFloat(resultPart.delaySeconds); }
                else if (alwaysDelayReaction) { this.delaySeconds = this.delaySecondsDefault; }
                this.timerLineSaidOrActionDone = new ml.Timer();
            }
            else {
                if (resultPart.delaySeconds) { this.delaySeconds = parseFloat(resultPart.delaySeconds); }
                else if (alwaysDelayReaction) { this.delaySeconds = this.delaySecondsDefault; }
                else { this.delaySeconds = .1; }
                this.timerLineSaidOrActionDone = null;
            }
            
            this.handleTriggerPlaces(ig.game.ourPlayer, resultPart.places);
        }
        else {
            this.timerLineSaidOrActionDone = null;

            if (this.autoContinue) {
                this.autoContinue = false;
                this.reactToPlainAction();
            }
        }
    },
    
    updateSpeechDisplayPos: function() {
        if (this.isAreaGlobalOrSimilar && ig.game.ourPlayer) {
            this.pos = {x: ig.game.ourPlayer.pos.x, y: ig.game.ourPlayer.pos.y - 50};
        }
        this.speechDisplay.update( {x: this.pos.x + 3, y: this.pos.y - 9} );
    },
    
    handleTeleport: function(resultPart) {
        var value = resultPart.to;

        var mayBeSelfRedirectTrap = ig.game.areaUrlName == value.toLowerCase() &&
                ig.game.gameStartTimer && ig.game.gameStartTimer.delta() <= 10 &&
                !ig.game.areaIsSubArea;
        var wantsToTeleportFromSpawnAreaWithoutClearPersonIntent = this.isActivelyReacting &&
                ig.game.sectorManager.isCurrentAreaCore();

        if (mayBeSelfRedirectTrap) {
            console.log("Ignoring early same-area teleport");
        }
        else if (wantsToTeleportFromSpawnAreaWithoutClearPersonIntent) {
            console.log("Ignoring teleporting away from spawn area without clear person intent");
        }
        else if (value && !ig.game.portaller.isTeleporting) {
            value = ig.game.strings.replaceAll( value, '[heard]', encodeURIComponent(this.lastHeard) );
            value = ig.game.strings.replaceAll(value, '[area]', ig.game.areaName);
            value = ig.game.strings.replaceAll(value, '[main_area]', ig.game.areaGroupName);

            if (ig.game.ourPlayer) { ig.game.ourPlayer.vel.y = 0; }
            if (!this.timerLineSaidOrActionDone) { this.timerLineSaidOrActionDone = new ml.Timer(); }

            if (value == 'elsewhere') {
                if ( ig.game.sectorManager.isCreatedArea() ) {
                    ig.game.portaller.startExitAreaTeleportingRequest();
                }
            }
            else if (value == 'last') {
                ig.game.portaller.startTeleportingToLastAreaRequest();
            }
            else if (resultPart.toDoesExcludeSubAreas) {
                ig.game.portaller.startToAreaButNotSubAreaTeleportingRequest(value);
            }
            else {
                ig.game.portaller.startInteractingToTeleportingRequest(value, this.thingTypeId);
            }
        }
    },
    
    handleResultPartMath: function(valuesArray) {
        if ( ig.game.motionDialog && valuesArray && ig.game.sectorManager.isCreatedArea() ) {
            for (var i = 0; i < valuesArray.length; i++) {
                var id = valuesArray[i][0];
                var number = valuesArray[i][1];
                var operator = valuesArray[i][2];
                var relatesToPlayer = valuesArray[i][3];
                var effectsFree  = valuesArray[i][4];

                number = ig.game.interactingManager.replacePlaceHolders( number,
                        this.allHas, this.allIs, this.allNumber, this.lastReceived, this.lastHeard, this.getLastTimerSeconds() );
                if ( number != parseInt(number) ) { number = 0; }
                
                if (relatesToPlayer) {
                    ig.game.motionDialog.changeTheirNumber(id, number, operator, effectsFree);
                    
                }
                else {
                    if (this.allNumber[id] === undefined) { this.allNumber[id] = 0; }
                    var newNumber = parseInt( this.allNumber[id] );
                    
                    switch (operator) {
                        case '+': newNumber = newNumber + parseInt(number); break;
                        case '-': newNumber = newNumber - parseInt(number); break;
                        case '*': newNumber = newNumber * parseInt(number); break;
                        case ':': newNumber = Math.round( newNumber / parseInt(number) ); break;
                        case '=': newNumber = parseInt(number); break;
                    }
                    
                    newNumber = ig.game.interactingManager.keepNumberInLimits(id, newNumber);
                    
                    this.allNumber[id] = newNumber;
                    if (this.allNumber[id] == 0) { delete this.allNumber[id]; }
                    ig.game.interactingManager.saveStoredDataIfNeeded(this);
                    
                }

            }
        }
    },
    
    triggerResultById: function(triggeringPlayer, resultId) {
        if (this.data == null) {
            this.data = [];
            var self = this;
            ig.game.itemCache.getItem_P(self.thingTypeId, 'interact3').done(function(item) {
                var textData = item.textData;
                self.thingReferences = item.thingRefs;
                self.data = ig.game.interactingManager.getParsedData(textData, self.thingReferences);
                ig.game.interactingManager.loadStoredDataIfNeeded(self);
                self.doTriggerResultById(triggeringPlayer, resultId);
            });
        }
        else {
            this.doTriggerResultById(triggeringPlayer, resultId);
        }
    },
    
    addEmbedding: function(url) {
        if ( !ig.game.sectorManager.isPublicArea() && !this.isAreaGlobalOrSimilar &&
                ( this.isInHolderOrDialog || this.distanceTo(ig.game.ourPlayer) <= ig.game.tileSize * 4 ) &&
                this.embedUrlIsWhitelisted(url) ) {

            var isInvisible = false;

            if (this.attributes.unnamed) {
                delete this.attributes.unnamed;
                this.openActionInfo();
            }
            
            ig.game.decorator.sparkleDust(this.pos.x, this.pos.y);

            if ( url.indexOf('invisible ') >= 0 ) {
                url = ig.game.strings.replaceAll(url, 'invisible ', '');
                isInvisible = true;
            }

            if ( url.indexOf('[heard]') >= 0  ) {
                url = ig.game.strings.replaceAll( url, '[heard]', encodeURIComponent(this.lastHeard) );
            }
            
            if ( url.indexOf('[name]') >= 0 && ig.game.ourPlayer ) {
                url = ig.game.strings.replaceAll( url, '[name]', encodeURIComponent(ig.game.ourPlayer.screenName) );
                ig.game.actioninfo.close();
                ig.game.actioninfo.open(this, this.pos.x - 4, this.pos.y - 9,
                        'Getting your name...', null, '', null, true);
                setTimeout( function() { ig.game.actioninfo.close(); }, 2500 );
            }
            url = ig.game.strings.replaceAll(url, '[name]', '');
            
            if ( url.indexOf('[location]') >= 0 ) {
                var embedLocation = ml.Misc.getNonCryptographicHash(ig.game.areaUrlName);
                embedLocation += '_' + this.homeMapLocation.x + '_' + this.homeMapLocation.y;
                url = ig.game.strings.replaceAll( url, '[location]', encodeURIComponent(embedLocation) );
            }

            ig.game.interactingManager.currentEmbeddingInteract = this;
            ig.game.mediaDialog.handlePasteIfNeeded(url, ig.game.ourPlayer.remoteId, true, true, isInvisible);
        }
    },
    
    embedUrlIsWhitelisted: function(url) {
        return url.indexOf('http://manyunity.com/') === 0 ||
               url.indexOf('https://manyunity.com/') === 0 ||
               url.indexOf('http://manyland.com/info') === 0;
    },
    
    removeEmbedding: function() {
        if (ig.game.mediaDialog && ig.game.mediaDialog.isActive && ig.game.mediaDialog.mediaType == 'Embedding') {
            ig.game.mediaDialog.removeWidget();
        }
    },

    doTriggerResultById: function(triggeringPlayer, resultId) {
        if (!this.isPlacedByInteracting) {
            var result = this.getResultById(resultId);
            if (result) {
                this.handleTriggerPlaces(triggeringPlayer, result.places);
            }
        }
    },

    handleTriggerPlaces: function(triggeringPlayer, places) {
        if ( !ig.game.sectorManager.isCurrentAreaCore() && places && !this.isPlacedByInteracting && triggeringPlayer ) {

            if (this.isAreaGlobalOrSimilar) {
                var coords = ig.game.mapManager.convertGameCoordsToMapCoords(triggeringPlayer.pos.x, triggeringPlayer.pos.y);
                if (coords) {
                    coords.y -= 4;
                    ig.game.interactingManager.triggerPlaces(coords, places);
                }
    
            }
            else if (!this.isInHolderOrDialog) {
                ig.game.interactingManager.triggerPlaces(this.homeMapLocation, places);

            }

        }
    },

    getResultById: function(resultId) {
        var result = null;
        if (this.data && this.data.length >= 1) {
            for (var i = 0; i < this.data.length; i++) {
                var results = this.data[i].result;
                if (results) {
                    for (var resultI = 0; resultI < results.length; resultI++) {
                        var thisResult = results[resultI];
                        if (thisResult.id == resultId) {
                            result = thisResult;
                            break;
                        }
                    }
                }
            }
        }
        return result;
    },

    triggerRumbles: function(seconds) {
        if ( this.isInHolderOrDialog || !ig.game.sectorManager.isCurrentAreaCore() ) {
            this.rumbles = {
                    timer: new ml.Timer(),
                    endSeconds: parseInt(seconds),
                    justStarted: true
                    };
        }
    },

    updateRumbles: function() {
        if (this.rumbles.timer) {
            if ( this.rumbles.timer.delta() <= this.rumbles.endSeconds ) {
                if ( this.rumbles.justStarted || ig.game.chance(7) ) {
                    ig.game.camera.shake();
                    this.rumbles.justStarted = false;
                }
            }
            else {
                this.rumbles = {};
            }
        }
    },

    transportPlayerToHere: function() {
        if ( ig.game.ourPlayer && this.distanceTo(ig.game.ourPlayer) <= ig.game.maxPortalDistance ) {
            ig.game.ourPlayer.pos = ig.game.cloneObject(this.pos);
        }
    },

    applyBumpsPlayer: function(validParamString) {
        var isAbsolute = validParamString.indexOf('absolute') >= 0;
        if (isAbsolute) {
            validParamString = ig.game.strings.replaceAll(validParamString, 'absolute', '');
            validParamString = validParamString.trim();
        }

        var params = validParamString.split(' ');
        var max = ig.game.ourPlayer.maxVelPushing.x;
        if (isAbsolute) {
            var velX = parseInt(params[0]), velY = parseInt(params[1]);
            if (velX != 0) { ig.game.ourPlayer.vel.x = velX.limit(-max, max); }
            if (velY != 0) { ig.game.ourPlayer.vel.y = velY.limit(-max, max); }
        }
        else {
            ig.game.ourPlayer.vel.x = ( ig.game.ourPlayer.vel.x + parseInt(params[0]) ).limit(-max, max);
            ig.game.ourPlayer.vel.y = ( ig.game.ourPlayer.vel.y + parseInt(params[1]) ).limit(-max, max);
        }
    },

    applyTransportsPlayer: function(validParamString) {
        ig.game.ourPlayer.timeOfLastTransport = new Date();
        var params = validParamString.split(' ');
        var newPos = { x: ig.game.ourPlayer.pos.x + parseInt(params[0]), y: ig.game.ourPlayer.pos.y + parseInt(params[1]) };
        ig.game.websocketComs.transmitPortalling(ig.game.ourPlayer.pos, newPos, ig.game.ourPlayer.vel, ig.game.ourPlayer.spriteFlippedX);
        ig.game.ourPlayer.pos.x = newPos.x;
        ig.game.ourPlayer.pos.y = newPos.y;
    },

    addToAllIs: function(thisIs) {
        if (thisIs) {
            thisIs = thisIs.toLowerCase();
            var isList = thisIs.split(' and ');

            for (var i = 0; i < isList.length; i++) {
                var singleIs = isList[i];
                if ( singleIs && this.allIs.indexOf(singleIs) === -1 ) {
                    this.allIs.push(singleIs);
                }
            }

            ig.game.interactingManager.saveStoredDataIfNeeded(this);
        }
    },

    removeFromAllIs: function(thisIsnt) {
        if (thisIsnt == '*') {
            this.allIs = [];
            ig.game.interactingManager.saveStoredDataIfNeeded(this);
        }
        else if (thisIsnt) {
            thisIsnt = thisIsnt.toLowerCase();
            var isntList = thisIsnt.split(' and ');
            for (var i = 0; i < isntList.length; i++) {
                var singleIsnt = isntList[i];
                if (singleIsnt) {
                    var index = this.allIs.indexOf(singleIsnt);
                    if (index >= 0) { this.allIs.splice(index, 1); }
                }
            }

            ig.game.interactingManager.saveStoredDataIfNeeded(this);
        }
    },

    addToAllHas: function(thisHas) {
        if ( thisHas && this.allHas.indexOf(thisHas) === -1 ) {
            this.allHas.push( thisHas.toLowerCase() );
            ig.game.interactingManager.saveStoredDataIfNeeded(this);
        }
        this.lastReceived = thisHas;
    },

    removeFromAllHas: function(thisHasnt) {
        if (thisHasnt == '*') {
            this.allHas = [];
            ig.game.interactingManager.saveStoredDataIfNeeded(this);
        }
        else if (thisHasnt) {
            var index = this.allHas.indexOf( thisHasnt.toLowerCase() );
            if (index >= 0) {
                this.allHas.splice(index, 1);
                ig.game.interactingManager.saveStoredDataIfNeeded(this);
            }
        }
    },

    doHarm: function(amount) {
        if ( !ig.game.sectorManager.isCurrentAreaCore() &&
                this.attributes.canHarmOrHasHighImpact && parseInt(amount) == amount && amount >= 1 && amount <= 100 ) {
            var player = ig.game.ourPlayer;
            player.receiveDamage( parseInt(amount), this, true, true );
            if (player.standing && !player.attachments.m) {
                if (ig.game.motionDialog) { ig.game.motionDialog.checkAutoTrigger('harmed'); }
                player.doMiniJump();
            }
        }
    },
    
    doHeal: function(amount) {
        if ( parseInt(amount) == amount && amount >= 1 && amount <= 100) {
            ig.game.ourPlayer.health += parseInt(amount);
            if (ig.game.ourPlayer.health > 100) { ig.game.ourPlayer.health = 100; }
            if (ig.game.motionDialog) { ig.game.motionDialog.checkAutoTrigger('healed'); }
        }
    },

    handleGiveThing: function(givesString) {
        var items = givesString.split(' or ');
        var itemName = items[ ig.game.getRandomInt(0, items.length - 1) ];
        var itemId = ig.game.interactingManager.replaceThingReferences(itemName, this.thingReferences);
        if (itemName != itemId) { this.giveThing(itemId); }
    },

    showById: function(thingId, lockAtHolderPage) {
        var self = this;
        ig.game.itemCache.getItem_P(thingId, 'interact4').done(function(item){
            if ( ig.game.interactingManager.typesSupportedForShow.indexOf(item.base) >= 0 ) {
                var x = self.isAreaGlobalOrSimilar ? ig.game.ourPlayer.pos.x : self.pos.x;
                var y = self.isAreaGlobalOrSimilar ? ig.game.ourPlayer.pos.y : self.pos.y;

                self.posWhenSomethingWasShown = ig.game.cloneObject(ig.game.ourPlayer.pos);
                var extraProperties = {};
                var uiItem = item.base == 'HOLDER' ? ig.game.ourPlayer : this;
                
                if (item.base == 'HOLDER' && lockAtHolderPage !== undefined) {
                    extraProperties.lockAtHolderPage = lockAtHolderPage;
                }
                
                var tooDangerous = false;
                if (item.url) {
                    tooDangerous = item.url.indexOf('vimeo.com') >= 0 ||
                                   item.url.indexOf('imgur.com') >= 0 ||
                                   item.url.indexOf('vine.co') >= 0;
                }
                
                if (!tooDangerous) {
                    if (item.base == 'MEDIUM') {
                        ml.Misc.handleDoPaste(item.url, ig.game.ourPlayer.remoteId, true);
                    }
                    else {
                        ig.game.itemsManager.triggerItemDefaultBehaviorOnSelection(thingId, uiItem, extraProperties);
                    }
                }
            }
        });
    },

    giveThing: function(thingId) {
        var thing = ig.game.itemCache.getItemBasic(thingId, 'ent_int_gt');
        var self = this;
        thing.imagesBeingGenerated.done(function(){
            var player = ig.game.ourPlayer;
            var slot = ig.game.attachmentManager.getSlotByBaseType(thing.base);
            if (slot) {
                if (player.attachments[slot]) { ig.game.websocketComs.transmitChangeAttachment(slot, null); }
                ig.game.attachmentManager.setAttachment(player, slot, thingId, null, self.crossClientId);
                ig.game.websocketComs.transmitChangeAttachment(slot, thingId);
    
                ig.game.sounds.pickup.play();
            }
        });
    },

    handleRemoveAttachment: function(slotVerboseOriginal) {
        var slotsVerbose = slotVerboseOriginal == '*' ? ['wearable', 'mountable', 'holdable', 'dynamic', 'brain'] : [slotVerboseOriginal];
        
        for (var i = 0; i < slotsVerbose.length; i++) {
            var slotVerbose = slotsVerbose[i];
            
            var slotKey = slotVerbose == 'dynamic' ? 'WEARABLE' : slotVerbose.toUpperCase();
            var slot = ig.game.attachmentManager.slots[slotKey];
            if (slot) {

                if (slotKey == 'WEARABLE') {
                    if (ig.game.ourPlayer.attachments.w) {
                        var base = ig.game.ourPlayer.attachments.w.base;
                        if ( (slotVerbose == 'wearable' && base == 'STACKWEAR') ||
                             (slotVerbose == 'dynamic' && base == 'DYNATHING') ) {
                            ig.game.attachmentManager.changeAttachment(ig.game.ourPlayer, slot, null);
                        }
                    }
                }
                else {
                    ig.game.attachmentManager.changeAttachment(ig.game.ourPlayer, slot, null);
                }

            }
        }
    },

    triggerMotion: function(motionId, triggeredByPlayerId) {
        var self = this;
        var item = ig.game.itemCache.getItemBasic(motionId, 'ent_int_tm');
        if (item) {
            item.imagesBeingGenerated.done(function(){
                if (item.base == 'DYNATHING') {
                    var settings = { img: item.img, attributes: item.attributes, soundId: item.soundId,
                            parentEntity: self, text: item.text, givenName: item.name,
                            triggeredByInteractingPlayerId: triggeredByPlayerId,
                            isInHolderOrDialog: self.isInHolderOrDialog };
                    if (item.attributes && item.attributes.replaces) {
                        self.anims.cell1.alpha = self.anims.cell2.alpha = 0;
                    }

                    var pos;
                    if (self.isAreaGlobalOrSimilar) {
                        var player = ml.Misc.getUserByRemoteId(triggeredByPlayerId);
                        if (player) { pos = ig.game.cloneObject(player.pos); }
                    }
                    else {
                        pos = ig.game.cloneObject(self.pos);
                    }

                    if (pos) {
                        ig.game.spawnEntityIfPosOnScreenPlusMargin(EntityDynathing, pos.x, pos.y, settings);
                    }
                }
                else {
                    var settings = { img: item.img, attributes: item.attributes, soundId: item.soundId,
                            byEntityId: self.crossClientId, boundingBox: item.boundingBox, givenName: item.name,
                            triggeredByInteractingPlayerId: triggeredByPlayerId,
                            isInHolderOrDialog: self.isInHolderOrDialog };
                    ig.game.spawnEntityIfPosOnScreenPlusMargin(EntityMotion, self.pos.x, self.pos.y, settings);
                }
            });
        }
    },

    dynamicEnded: function(givenName, wasReplacing, triggeredByInteractingPlayerId) {
        this.currentDynamic = null;
        if (wasReplacing) { this.anims.cell1.alpha = this.anims.cell2.alpha = 1; }
        if (ig.game.ourPlayer && triggeredByInteractingPlayerId == ig.game.ourPlayer.remoteId) {
            this.reactTo('ends', givenName);
        }
    },

    triggerMotionOfPlayer: function(motionString, motionId) {
        ig.game.motionDialog.getMotionSetIdsForCurrentBody_P()
            .done(function(){
                var foundMatch = false;
                var motionDialog = ig.game.motionDialog;
                if (motionDialog.motionIds.length >= 1) {
                    motionDialog.selectedIndex = Math.floor(motionDialog.motionIds.length / 2);
    
                    foundMatch = motionDialog.doCheckTriggerBySpeech(motionString);
                    if (!foundMatch) { foundMatch = motionDialog.doCheckTriggerBySpeech(motionString, true); }
    
                }
                if (!foundMatch && motionId) {
                    ig.game.attachmentManager.handleMotion(ig.game.ourPlayer, motionId);
                    ig.game.websocketComs.transmitMotion(motionId, null);
                }
            })
            .fail(function(){
                if (motionId) {
                    ig.game.attachmentManager.handleMotion(ig.game.ourPlayer, motionId);
                    ig.game.websocketComs.transmitMotion(motionId, null);
                }
            });
    },

    logSaid: function(said) {
        if (said) {
            this.lastSaid.push(said);
            if (this.lastSaid.length > 5) { this.lastSaid.splice(0, 1); }
        }
    },

    update: function() {
        this.handleSomeoneArrives();
        
        if (!this.isInHolderOrDialog) { this.pos = ig.game.cloneObject(this.posOriginal); }

        if (this.attributes.steadyChange) {
            var seconds = new Date().getSeconds();
            var multiplier = this.attributes.slowChange ? .15 : .5;
            var cell = Math.round(seconds * multiplier) % 2;
            this.currentAnim = this.anims['cell' + (cell + 1)];
        }
        else {
            if ( this.lastCellChangeTimer.delta() >= this.minChangeTime && ig.game.chance(.5) ) {
                this.currentAnim = this.anims[ 'cell' + (this.currentAnim == this.anims.cell1 ? 2 : 1) ];
                this.lastCellChangeTimer.reset();
            }
        }

        this.handleFlip();

        this.updateRumbles();

        if (this.posWhenSomethingWasShown) {
            if (ig.game.ourPlayer.pos.x != this.posWhenSomethingWasShown.x || ig.game.ourPlayer.pos.y != this.posWhenSomethingWasShown.y) {
                if (ig.game.mediaDialog.isActive) { ig.game.mediaDialog.removeWidget(); }
                else if (ig.game.writableDialog.isOpen) { ig.game.writableDialog.close(); }
                this.posWhenSomethingWasShown = null;
            }
        }

        if ( this.timerLineSaidOrActionDone && this.timerLineSaidOrActionDone.delta() >= this.delaySeconds ) {
            this.delaySeconds = this.delaySecondsDefault;
            this.continueCurrentResult();
        }
        
        if ( this.delayedReactionTimer && this.delayedReactionTimer.delta() >= this.delayedReaction.endSeconds ) {
            this.doReactToOtherInteractingOrEmbedding(this.delayedReaction.interactionType,
                    this.delayedReaction.text, this.delayedReaction.interactingName);
            this.delayedReaction = null;
            this.delayedReactionTimer = null;
        }

        if (this.currentMotion && this.currentMotion.toBeKilledNextRound && !this.currentMotion._kill &&
                !this.timerLineSaidOrActionDone) {
            if (ig.game.ourPlayer && this.currentMotion.triggeredByInteractingPlayerId == ig.game.ourPlayer.remoteId) {
                this.reactTo('ends', this.currentMotion.givenName);
            }
            this.currentMotion.kill();
        }

        this.ourPlayerInMediumRangePrevious = !!this.ourPlayerInMediumRange;
        this.ourPlayerInMediumRange = ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer, ig.game.interactingManager.touchMarginMediumRange) &&
                ig.game.ourPlayer && this.checksNears && this.isOnMeOrLookingAtMe(ig.game.ourPlayer);
           
        this.ourPlayerTouchingPrevious = this.ourPlayerTouching;
        this.ourPlayerTouching = ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer, ig.game.interactingManager.touchMargin) &&
                ig.game.ourPlayer && ( Math.abs(ig.game.ourPlayer.vel.x) <= 1 || this.checksNears || ig.game.ourPlayer.vel.y < -1 ) &&
                this.isOnMeOrLookingAtMe(ig.game.ourPlayer);

        this.ourPlayerTouchingExactlyPrevious = this.ourPlayerTouchingExactly;
        this.ourPlayerTouchingExactly = ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer);
        
        if (this.ourPlayerTouchingExactly &&
                ig.game.ourPlayer.vel.x == 0 && this.previousOurPlayerVel && this.previousOurPlayerVel.x != 0) {
            this.currentlyReactingTo = null;
            if (this.data && this.data.length >= 1) {
                this.reactTo('viewed');
                this.openActionInfo();
            }
            else {
                this.loadDataIfNeeded('viewed');
            }
        }
        else if (this.ourPlayerTouchingExactly && !this.ourPlayerTouchingExactlyPrevious) {
            this.currentlyReactingTo = null;
            if (this.data && this.data.length >= 1) { this.reactTo('reaches'); }
            else { this.loadDataIfNeeded('reaches'); }
        }
        else if (this.ourPlayerTouching && !this.ourPlayerTouchingPrevious) {
            this.currentlyReactingTo = null;
            if (this.data && this.data.length >= 1) {
                this.openActionInfo();
                if (this.checksNears) { this.reactTo('nears'); }
            }
            else {
                this.loadDataIfNeeded('nears');
            }
        }
        else if (this.ourPlayerInMediumRange && !this.ourPlayerInMediumRangePrevious) {
            this.currentlyReactingTo = null;
            if (this.data && this.data.length >= 1) {
                this.openActionInfo();
                if (this.checksNears) { this.reactTo('approaches'); }
            }
            else {
                this.loadDataIfNeeded('approaches');
            }
        }
        else if (!this.ourPlayerTouching && this.ourPlayerTouchingPrevious) {
            if (ig.game.mediaDialog.isActive) { ig.game.mediaDialog.removeWidget(); }
            this.closeActionInfo();
            
        }
        else if (this.ourPlayerTouching && ig.game.ourPlayer.vel.y < -10 && ig.game.ourPlayer.vel.x == 0 &&
                !(ig.game.ourPlayer.actionMode == ig.game.ourPlayer.actionModes.CLIMBING) ) {
            if ( this.data && this.data.length >= 1 && ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer) ) {
                this.handleEnteringIfAllowed();
            }
            
        }

        if (this.isAreaGlobalOrSimilar) {
            this.setAreaGlobalPositionByPlayer(ig.game.ourPlayer);
        }
        else {
            this.updateSpeechDisplayPos();
        }

        var hadMotion = this.currentMotion != null;
        this.currentMotion = ig.game.interactingManager.getCurrentlyActiveMotion(this);

        if (this.attributes.solid) {
            var isPassable = this.currentMotion && this.currentMotion.attributes.passable;
            this.setSolidTo(!isPassable);
        }
        else {
            var isSolid = this.currentMotion && this.currentMotion.attributes.solid;

            this.boundingBox = this.currentMotion && this.currentMotion.boundingBox ?
                    ig.game.cloneObject(this.currentMotion.boundingBox) : ig.game.cloneObject(this.boundingBoxOriginal);
            this.initViaBoundingBox();
            this.setSolidTo(isSolid);
        }

        if (!this.currentMotion && hadMotion) { this.resetAllOfBox(); }

        if (!this.isAreaGlobalOrSimilar) {
            var posAndSize = { pos: {x: this.pos.x - 7, y: this.pos.y - 7}, size: {x: this.size.x, y: this.size.y} };
            ig.game.decorator.handleAttributeEffects(posAndSize, this);
        }

        if (ig.game.ourPlayer) { this.previousOurPlayerVel = ig.game.cloneObject(ig.game.ourPlayer.vel); }
        this.parent();
    },
    
    handleEnteringIfAllowed: function() {
        var allowEntering = true;
        
        if ( ig.game.interactingManager.ourPlayerLastEnteredTimer &&
                 ig.game.interactingManager.ourPlayerLastEnteredTimer.delta() <= .5 ) {
            allowEntering = false;
        }
        else if ( ig.game.sectorManager.isPublicArea() ) {
            if (this.thingBelow === undefined && this.homeMapLocation) {
                var locationBelow = {x: this.homeMapLocation.x, y: this.homeMapLocation.y + 1};
                var mapPosDef = ig.game.mapManager.getMapPositionDefAndItemAt(locationBelow);
                this.thingBelow = mapPosDef ? mapPosDef.thing : null;
            }
            allowEntering = !this.thingBelow ||
                    ['PASS', 'CLIMB', 'PUSH'].indexOf(this.thingBelow.base) === -1;
        }
        
        if (allowEntering) {
            var success = this.reactTo('enters');
            if (success) {
                ig.game.interactingManager.ourPlayerLastEnteredTimer = new ml.Timer();
            }
            if (!this.timerLineSaidOrActionDone) {
                this.timerLineSaidOrActionDone = new ml.Timer();
            }
        }
    },
    
    handleSomeoneArrives: function() {
        if ( !this.isInDialog && !ig.game.areaClosed &&
                !this.didInformArrivedIfNeeded && ig.game.gameStartTimer && ig.game.gameStartTimer.delta() >= 0 && ig.game.ourPlayer &&
                ig.game.shroudOpacity === 0 &&
                ( !ig.game.sectorManager.isCurrentAreaCore() || this.isInHolderOrDialog ) &&
                ( this.isAreaGlobalOrSimilar || this.isInHolderOrDialog || this.distanceTo(ig.game.ourPlayer) <= ig.game.interactingManager.interactingToInteractionDistanceMax ) &&
                ig.game.motionDialog && ig.game.motionDialog.didFinishInitialPossessionLoading ) {

            if ( this.reactsTo && this.reactsTo.indexOf('someone_arrives') >= 0 ) {
                this.doReactToSomeoneDid('arrives');
                ig.game.motionDialog.makeAreaPossessionNumbersConformToLimits();
            }
            this.didInformArrivedIfNeeded = true;
        }
    },

    setAreaGlobalPositionByPlayer: function(player) {
        if (player) {
            this.pos = ig.game.cloneObject(player.pos);
            this.pos.y -= (ig.system.heightHalf + 100);
            if (this.speechDisplay) {
                this.speechDisplay.update( {x: player.pos.x + 3, y: player.pos.y - ig.system.height * .4} );
            }
        }
    },

    resetAllOfBox: function() {
        this.pos = ig.game.cloneObject(this.posOriginal);
        this.size = ig.game.cloneObject(this.sizeOriginal);
        this.offset = ig.game.cloneObject(this.offsetOriginal);
        this.boundingBox = ig.game.cloneObject(this.boundingBoxOriginal);
        this.initViaBoundingBox();
    },

    isOnMeOrLookingAtMe: function(player) {
        var isOnMe = Math.abs(player.pos.x - this.pos.x) <= ig.game.tileSize;
        var isLookingAtMe = null;
        if (!isOnMe) {
            isLookingAtMe = (player.spriteFlippedX && player.pos.x < this.pos.x) ||
                            (!player.spriteFlippedX && player.pos.x > this.pos.x);
        }
        return isOnMe || isLookingAtMe;
    },

    handleFlip: function() {
        if ( this.faceNearestTimer && this.faceNearestTimer.delta() >= 5 ) {
            this.faceNearestTimer.reset();
            if ( !this.faceNearestNearbyPlayer() ) {
                this.anims.cell1.flip.x = this.anims.cell2.flip.x = this.defaultFlip;
            }
        }
    },

    faceNearestNearbyPlayer: function() {
        var nearestPlayer = this.getNearestPlayerLookingAtMe(ig.game.interactingManager.touchMargin * 1.5);
        if (nearestPlayer) {
            this.anims.cell1.flip.x = this.anims.cell2.flip.x = this.pos.x < nearestPlayer.pos.x;
        }
        return !!nearestPlayer;
    },

    getNearestPlayerLookingAtMe: function(maxDistance) {
        var nearestEntity = null;
        var nearestDistance = null;
        var entities = ig.game.entitiesByType.player;
        if (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if ( !entity._killed && this.isOnMeOrLookingAtMe(entity) ) {
                    var distance = this.distanceTo(entity);
                    if ( distance <= maxDistance && (nearestDistance == null || distance < nearestDistance) ) {
                        nearestEntity = entity;
                        nearestDistance = distance;
                    }

                }
            }
        }
        return nearestEntity;
    },

    loadDataIfNeeded: function(reactToThisAfterwards) {
        if (this.data == null && !this.isInDialog) {
            this.data = [];
            var self = this;
            ig.game.itemCache.getItem_P(self.thingTypeId, 'interact5').done(function(item) {
                var textData = item.textData;
                self.thingReferences = item.thingRefs;
                self.data = ig.game.interactingManager.getParsedData(textData, self.thingReferences);
                ig.game.interactingManager.loadStoredDataIfNeeded(self);
                if (reactToThisAfterwards) { self.reactTo(reactToThisAfterwards); }
            });
        }
    },

    openActionInfo: function() {
        if (!this.isInHolderOrDialog && !this.attributes.unnamed) {
            if (this.makesUseOfEnterCommand === undefined) {
                this.makesUseOfEnterCommand = ig.game.interactingManager.getMakesUseOfEnterCommand(this.data);
            }

            var label = this.givenName + "\r";
            if (this.makesUseOfEnterCommand) {
                label = 'up = enter' + "\r";
            }
            else if (ig.game.playerAgeDays <= 7) {
                label += (ig.ua.mobile || ig.ua.fireTV ? 'action' : 'space') + '/type = interact';
            }

            if (this.boundingBox) {
                ig.game.actioninfo.open(this, this.pos.x + this.offset.x / 2, this.pos.y + this.offset.y, label);
            }
            else {
                ig.game.actioninfo.open(this, this.pos.x - 4, this.pos.y, label);
            }
        }
    },

    closeActionInfo: function() {
        if (!this.attributes.unnamed) { ig.game.actioninfo.close(); }
    },

    getResult: function(interactionType, text, marker, skipLogging) {
        var result = null;
        var resultCandidates = [];
        var lastTimerSeconds = this.getLastTimerSeconds();
        var currentMotionOrDynamicName = null;
        if (this.currentDynamic) {
            currentMotionOrDynamicName = this.currentDynamic.givenName;
        }
        else if (this.currentMotion) {
            currentMotionOrDynamicName = this.currentMotion.givenName;
        }

        if (this.data && this.data.length >= 1) {
            if ( text && text.indexOf('://') == -1 ) { text = text.toLowerCase(); }

            for (var i = 0; i < this.data.length; i++) {
                var part = this.data[i];
                if (marker) {
                    if (part.marker == marker) {
                        if ( !part.condition || ig.game.interactingManager.conditionStringIsTrue(interactionType, text, part.condition,
                                this.allHas, this.allIs, this.allNumber, this.reactsTo, this.currentlyReactingTo,
                                this.lastReceived, this.lastHeard, lastTimerSeconds, currentMotionOrDynamicName) ) {
                            resultCandidates.push( ig.game.cloneObject(part.result) );
                        }
                    }
                }
                else if (!part.marker) {
                    var satisfiesContext = !part.context;
                    if (this.currentContext) { satisfiesContext = part.context == this.currentContext; }
    
                    if (satisfiesContext) {
                    
                        if (interactionType && part.interactionBased) {
                            if ( ig.game.interactingManager.conditionStringIsTrue(interactionType, text, part.condition,
                                    this.allHas, this.allIs, this.allNumber, this.reactsTo, this.currentlyReactingTo,
                                    this.lastReceived, this.lastHeard, lastTimerSeconds, currentMotionOrDynamicName) ) {
                                resultCandidates.push( ig.game.cloneObject(part.result) );
                            }
                        }
                        else if (!interactionType && !part.interactionBased) {
                            if ( !part.condition || ig.game.interactingManager.conditionStringIsTrue(interactionType, text, part.condition,
                                    this.allHas, this.allIs, this.allNumber, this.reactsTo, this.currentlyReactingTo,
                                    this.lastReceived, this.lastHeard, lastTimerSeconds, currentMotionOrDynamicName) ) {
                                resultCandidates.push( ig.game.cloneObject(part.result) );
                            }
                        }
    
                    }
                }

            }

            if (resultCandidates.length >= 1) {
                var randomI = ig.game.getRandomInt(0, resultCandidates.length - 1);
                result = resultCandidates[randomI];
            }
        }

        if (!result && !skipLogging) { this.logSaid(''); }

        return result;
    },

    draw: function() {
        if (!this.isAreaGlobalOrSimilar) {
            if (!this.isInHolderOrDialog) {
                this.pos = ig.game.cloneObject(this.posOriginal);
            }
            var pos = this.getPosWithOffset();
            
            var motion = this.currentMotion;
            if ( !(motion && motion.attributes && motion.attributes.replaces) ) {
                this.currentAnim.draw( pos.x, pos.y + (this.attributes && this.attributes.affectsBelow ? -19 : 0) );
            }
            if (motion) { motion.drawCalledByInteracting(this, pos); }
        }
    },

    drawSpeech: function() {
        this.speechDisplay.draw();
    },

    getPosWithOffset: function() {
        var pos = {x: this.pos.x + this.offset.x - ig.game._rscreen.x,
                   y: this.pos.y + this.offset.y - ig.game._rscreen.y}
        if (!this.boundingBox) {
            pos.x -= 5;
            pos.y -= Math.floor(this.imageSize - ig.game.tileSize);
        }
        return pos;
    },

    handleMovementTrace: function(res) {
        this.parent(res);
    },

    collideWith: function(other, axis) {
        // if (other instanceof EntityThrownItem) { other.handleMovementTrace(this.res); }
        if (other.isByOurPlayer && this.lastThrowIdHitBy != other.throwId) {
            this.lastThrowIdHitBy = other.throwId;
            this.reactTo('hits', other.originalName);
        }
        this.parent(other, axis);
    },

    getThrowDataFromParamString: function(validParamString) {
        var throwData = null;
        var itemIdLength = 24;
        var maxVel = ig.game.ourPlayer.maxVelPushing.x + 10;
        var params = validParamString.split(' ');
        var paramsAreValid = params.length == 3 && parseInt(params[0]) == params[0] && parseInt(params[1]) == params[1] &&
                Math.abs(params[0]) <= maxVel && Math.abs(params[1]) <= maxVel &&
                typeof params[2] === 'string' && params[2].length == itemIdLength;
        if (paramsAreValid) {
            throwData = {
                    opp: { x: Math.round(this.pos.x), y: Math.round(this.pos.y) },
                    opv: { x: parseInt(params[0]), y: parseInt(params[1]) },
                    iid: params[2]
                    };
        }
        return throwData;
    },

    triggerThrow: function(throwsParam, throwId) {
        if (throwsParam instanceof Array) {
            for (var i = 0; i < throwsParam.length; i++) {
                var throwData = this.getThrowDataFromParamString( throwsParam[i] );
                if (throwData) { this.throwItem(throwData); }
            }
        }
    },

    throwItem: function(throwData, throwId) {
        var item = ig.game.itemCache.getItemBasic(throwData.iid, 'ent_int_ti');
        var tooDangerous = item && !this.attributes.canHarmOrHasHighImpact &&
                ig.game.attributesManager.getHasDangerousAttributes(item.attributes);
        if (item && !tooDangerous) {
            var self = this;
            item.imagesBeingGenerated.done(function(){
                var slot = ig.game.attachmentManager.slots.HOLDABLE;
    
                var settings = {
                        sourceEntity: {
                            width   : item.img.width,
                            height  : item.img.height,
                            flipX   : (throwData.opv.x > 0 ? 1 : 0),
                            path    : item.img.path,
                            animSheet   : ig.game.entityManager.getAnimationForEntity(item, 0, false)
                        },
                        itemId           : item.id,
                        soundId          : item.soundId,
                        originalBaseType : item.base,
                        attributes       : item.attributes,
                        originalName     : item.name,
                        throwerVel       : throwData.opv,
                        isByGatherable   : true,
                        originatorId     : self.getOriginatorId(),
                        throwId          : throwId
                };

                ig.game.spawnEntityIfPosOnScreenPlusMargin(EntityThrownItem, throwData.opp.x, throwData.opp.y, settings);
                ig.game.sounds.playIfOnScreen(ig.game.sounds.whoosh, self);
            });
        }
    },
                    
    getOriginatorId: function() {
        return ( this.homeMapLocation.x + ':' + this.homeMapLocation.y);
    },

    setSolidTo: function(isSolid) {
        if (isSolid) {
            // this.type = ig.Entity.TYPE.B;
            // this.checkAgainst = ig.Entity.TYPE.A;
            this.collides = ig.Entity.COLLIDES.FIXED;
        }
        else {
            // this.type = ig.Entity.TYPE.NONE;
            // this.checkAgainst = ig.Entity.TYPE.NONE;
            this.collides = ig.Entity.COLLIDES.NEVER;
        }
    },
    
    tidyUp: function() {
        if (ig.game.camera.customFocusEntity && ig.game.camera.customFocusEntity.crossClientId == this.crossClientId) {
            ig.game.camera.customFocusEntity = null;
        }
        if (this.currentMotion) { this.currentMotion.kill(); }
        if (this.currentDynamic) { this.currentDynamic.kill(); }
    },

});

});
