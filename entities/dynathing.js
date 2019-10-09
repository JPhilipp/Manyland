ig.module('game.entities.immobile.dynathing')
.requires('impact.entity', 'game.ui.speechdisplay')
.defines(function(){

EntityDynathing = ig.Entity.extend({

    subEntities: {},
    frameData: {},
    /* e.g.
        ['f120_1']['e2'] = { // frame 120 command set 1, entity 2
             pos: {x: 1, y: 1}, size: {x: , y: }, opacity: 1, rotation: 10,
             flipHorizontal: false, flipVertical: false, zIndex: 1, pivot: {x: , y: }, bright: true,
             spreadOverFrames: 30
        }
    */

    maxCells: 1,
    frame: 0,
    frameMax: null,
    size: {x: 29, y: 29},
    gravityFactor: 0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    defaultPivot: {x: 29 / 2, y: 29 / 2},
    startDelayCounter: 0,
    velMax: 5,
    waitForTouch: false,
    containsZIndexHandling: false,
    containsGrabbing: false,
    fullSoundsLeftToPlay: 10,
    killAfterRan: false,
    parentEntity: null,
    isBehind: false,
    givenName: undefined,
    fullyOpaque: true,
    isStack: false,
    isAttached: false,
    parentIsFlipped: false,
    parentIsFlippedPrevious: false,
    flipMultiplier: 1,
    baseType: 'DYNATHING',
    targetPos: {x: null, y: null},
    targetPosPrevious: {x: null, y: null},
    triggeredByInteractingPlayerId: undefined,
    rgba: null,
    lightGroupId: null,
    alwaysUpdate: true,
    isStrongLight: true,
    attributes: {},
    speechDisplay: null,
    closestPlayerCache: null,
    hasSpeech: true,
    canUseTextOrSpeech: true,
    emitsId: null,
    currentMode: 'default',
    previousMode: 'default',
    didFinishStartMode: false,
    lastActionTimer: null,
    canUseCrop: true,
    stoppedDueToSpeedIssues: false,
    fpsOnGeneration: 60,
    animSheets: [],
    singleAnims: [],
    latestTimeCached: null,
    useCellSplitToAvoidMemoryLeak: false,
    grabCell: null,
    lastGrabSoundTimer: null,
    isForProfileWallpaper: false,
    // isInMultithing: false,
    // multithingState: undefined,
    // multithingStateEvenOdd: undefined,
    // multithingStatePositiveNegative: undefined,
    // multithingPrivate: undefined,
    // multithingRandomize: undefined,
    // multithingMoved: undefined,

    init: function(x, y, settings) {
        if (settings.attributes) { this.attributes = settings.attributes; }
        
        this.soundId = settings.soundId;
        this.givenName = settings.givenName;
        this.emitsId = settings.emitsId;
        this.isAttached = settings.isAttached;
        this.isForProfileWallpaper = Boolean(settings.isForProfileWallpaper);
        this.isInHolderOrDialog = settings.isInHolderOrDialog;
        this.triggeredByInteractingPlayerId = settings.triggeredByInteractingPlayerId;
        
        if (this.isAttached) { this.fullSoundsLeftToPlay = 1; }

        this.isStack = !this.isAttached && this.attributes && (
            this.attributes.attachable || this.attributes.follows || this.attributes.closelyFollows
            );
            
        if (this.isAttached && this.attributes.startsOnTouch) {
            delete this.attributes.startsOnTouch;
        }
        
        if (this.attributes.solid) { this.setToSolid(); }
        if (this.attributes.inFront) { this.decorative = true; }
        
        if (settings.parentEntity) {
            if (!settings.img) { this.kill(); return; }
            this.parentEntity = settings.parentEntity;
            this.parentEntity.currentDynamic = this;
            this.pos.x = x; this.pos.y = y;
            this.animSheet = new ml.AnimationSheet(null, this.size.x, this.size.y, settings.img);
        }
        else {
            this.parent(x, y, settings);
        }
        
        if ( !this.isInHolderOrDialog &&
                ig.game.sectorManager.positionIsCloseToProtectedCenter(this.pos) ) {
            if ( ig.game.sectorManager.isPublicArea() ) {
                this.canUseCrop = false;
            }
            if ( ig.game.sectorManager.isCurrentAreaCore() ) {
                this.canUseTextOrSpeech = !!this.isAttached;
                this.hasSpeech = false;
            }
        }

        if ( this.isAttached && ig.game.sectorManager.isCurrentAreaCore() ) {
            this.hasSpeech = false;
        }
        
        this.speechDisplay = new SpeechDisplay(this);

        this.killAfterRan = !!this.parentEntity;
        var text = settings.text;
        
        this.maxCells = Math.floor(this.animSheet.image.width / this.size.x);
        this.useCellSplitToAvoidMemoryLeak = ml.Misc.getAnimSheetMayTriggerGPUMemoryLeakIfRotated(this.animSheet);
        
        for (var i = 1; i <= this.maxCells; i++) {
            this.addAnim('e' + i, 1, [i - 1]);
            if (this.useCellSplitToAvoidMemoryLeak) { this.addSingleCellAnimation(i, this.animSheet); }
        }
        if (this.useCellSplitToAvoidMemoryLeak) { this.animSheet = null; this.anims = null; }

        var attributesWereSomehowEmptied = !this.attributes;
        if (attributesWereSomehowEmptied) { this.attributes = {}; }

        if (this.parentEntity) {
            if (this.attributes.startsOnTouch) { delete this.attributes.startsOnTouch; }
        }
        else if (this.isStartedByBoost) {
            this.startDelayCounter = ig.game.boostManager.getDynathingStartDelayCounter();
            if (this.attributes.startsOnTouch) { delete this.attributes.startsOnTouch; }
        }
        else if (!this.isAttached && !settings.isPlacedByInteracting) {
            this.startDelayCounter = ig.game.getRandomInt(0, 60);
        }
        
        if (this.isCreatorLivePreview) {
            if (this.attributes.startsOnTouch) { delete this.attributes.startsOnTouch; }
            this.startDelayCounter = 0;
        }
        
        this.reset();
        this.didFinishStartMode = false;
        
        if (this.isInHolderOrDialog && !this.isInMultithing) {
            this.frameMax = ig.game.dynamicThingManager.secondsMaxInHolder * ig.game.dynamicThingManager.framesPerSecond;
        }
        else if (this.isStartedByBoost) {
            this.frameMax = ig.game.boostManager.defaultMaxSeconds * ig.game.dynamicThingManager.framesPerSecond;
        }
        else {
            this.frameMax = ig.game.dynamicThingManager.secondsMax * ig.game.dynamicThingManager.framesPerSecond;
        }

        this.adjustPosOffset();

        try {
            var infoByReference = {};
            if (ig.game.speedWatcher.lastAverageFPS) {
                this.fpsOnGeneration = ig.game.speedWatcher.lastAverageFPS;
            }
            this.frameData = ig.game.dynamicThingManager.getParsedFrameData(text, this.maxCells, infoByReference);
            this.containsZIndexHandling = infoByReference.containsZIndexHandling;
            this.containsGrabbing = infoByReference.containsGrabbing;
            if (infoByReference.containsLight) { this.lightGroupId = 1; }
        }
        catch (err) {
            this.frameData = { 'default': {} };
        }
        
        if (this.containsGrabbing) {
            this.id = (settings.homeMapLocation ? settings.homeMapLocation.x + '_' + settings.homeMapLocation.y + '_' : '') +
                    ig.game.getRandomInt(1000000, 10000000);
        }

        if (this.attributes.startsOnTouch && !this.isAttached && !this.isStack) {
            this.type = ig.Entity.TYPE.B;
            this.checkAgainst = ig.Entity.TYPE.A;
        }

        if (this.attributes.behind && !this.isStack) { this.isBehind = true; }
    },
    
    adjustPosOffset: function() {
        this.pos.x -= (this.size.x - ig.game.tileSize) / 2;
        this.pos.y -= this.size.y - ig.game.tileSize;
    },
    
    addSingleCellAnimation: function(cell, originalAnimSheet) {
        var tempCanvas = document.createElement('canvas');
        var name = 'e' + cell;
        var scale = ig.system.scale;
        tempCanvas.width = this.size.x * scale;
        tempCanvas.height = this.size.y * scale;
        var context = tempCanvas.getContext('2d');

        context.drawImage(originalAnimSheet.image.data,
                (cell - 1) * this.size.x * scale, 0, this.size.x * scale, this.size.y * scale,
                0, 0, this.size.x * scale, this.size.y * scale);

        var image = new Image(this.size.x * scale, this.size.y * scale);
        image.src = tempCanvas.toDataURL('image/png');
        var mlImage = new ml.Image(null, null, null, image);
        this.animSheets[name] = new ml.AnimationSheet(null, this.size.x, this.size.y, mlImage);
        this.singleAnims[name] = new ml.Animation(this.animSheets[name], 1, [0], null, name);
    },

    reset: function(skipModeReset) {
        this.frame = 0;
        this.ungrabPlayers();
        
        if (!skipModeReset) {
            this.currentMode = 'default';
            this.previousMode = this.currentMode;
            this.didFinishStartMode = true;
        }

        for (var i = 1; i <= this.maxCells; i++) {
            this.subEntities['e' + i] = {
                    pos: {x: 0, y: 0}, targetPos: {x: null, y: null}, posStep: {x: null, y: null},
                    vel: {x: 0, y: 0},
                    accel: {x: 0, y: 0},
                    text: null, font: 'whiteSmallFont', say: null,
                    opacity: 0, targetOpacity: null, opacityStep: null,
                    rotation: 0, targetRotation: null, rotationStep: null,
                    flip: {x: false, y: false}, zIndex: i, pivot: ig.game.cloneObject(this.defaultPivot),
                    cropRect: null,
                    rgb: [0,0,0], targetRgb: [null, null, null], rgbStep: [null, null, null],
                    bright: false
            }
        }

        if (this.attributes.startsOnTouch) { this.waitForTouch = true; }
    },

    handleFlipAdjustmentIfNeeded: function() {
        if (this.isAttached && this.parentIsFlipped != this.parentIsFlippedPrevious && !this.attributes.nonFlipping) {
            this.parentIsFlippedPrevious = this.parentIsFlipped;
            this.flipMultiplier = this.parentIsFlipped ? -1 : 1;
            this.reset();
            this.update();
        }
    },

    setTargetPos: function(targetPos) {
        if (this.attributes.follows || this.attributes.closelyFollows) {
            this.targetPos = ig.game.cloneObject(targetPos);
        }
        else if (this.attributes.attachable) {
            this.pos = ig.game.cloneObject(targetPos);
        }
    },

    followTargetPos: function() {
        if (this.isAttached) {
            var baseStep = ig.system.tick * 125;
            if (this.attributes.follows) { baseStep *= .75; }

            var longDistance = 76;
            var longDistanceMultiplier = 2;

            if (this.targetPos.x != null) {
                var stepX = baseStep;
                if ( Math.abs(this.pos.x - this.targetPos.x) >= longDistance ) {
                    stepX *= longDistanceMultiplier;
                }

                if (this.pos.x < this.targetPos.x) {
                    this.pos.x += stepX;
                    if (this.pos.x >= this.targetPos.x) {
                        this.pos.x = this.targetPos.x;
                        this.targetPos.x = null;
                    }
                }
                else if (this.pos.x > this.targetPos.x) {
                    this.pos.x -= stepX;
                    if (this.pos.x <= this.targetPos.x) {
                        this.pos.x = this.targetPos.x;
                        this.targetPos.x = null;
                    }
                }
            }

            if (this.targetPos.y != null) {
                var stepY = baseStep;
                if (this.attributes.closelyFollows) { stepY *= 1.5; }

                if ( Math.abs(this.pos.y - this.targetPos.y) >= longDistance ) {
                    stepY *= longDistanceMultiplier;
                }

                if (this.pos.y < this.targetPos.y) {
                    this.pos.y += stepY;
                    if (this.pos.y >= this.targetPos.y) {
                        this.pos.y = this.targetPos.y;
                        this.targetPos.y = null;
                    }
                }
                else if (this.pos.y > this.targetPos.y) {
                    this.pos.y -= stepY;
                    if (this.pos.y <= this.targetPos.y) {
                        this.pos.y = this.targetPos.y;
                        this.targetPos.y = null;
                    }
                }
            }

        }
    },

    update: function(optionalParentPlayer) {
        if (!this._killed && !this.stoppedDueToSpeedIssues) {
            this.detectMode(optionalParentPlayer);
        
            this.handleFlipAdjustmentIfNeeded();
            this.followTargetPos();

            if (this.isStack) {
                this.ourPlayerTouchingPrevious = this.ourPlayerTouching;
                this.ourPlayerTouching = ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer);

                var label = this.attributes.attachable ? 'attach' : 'be followed';
                if (this.attributes.replaces) { label = 'change to'; }
                if (this.ourPlayerTouching && !this.ourPlayerTouchingPrevious) {
                    ig.game.actioninfo.open( this, this.pos.x, this.pos.y + 9, label,
                            ig.game.attachmentManager.getRankNeededByItemId(this.thingTypeId) );
                }
                else if (!this.ourPlayerTouching && this.ourPlayerTouchingPrevious) {
                    ig.game.actioninfo.close();
                }
            }

            if (this.frame != 0 && this.startDelayCounter > 0) {
                this.startDelayCounter--;
            }
            else if (this.frame != 0 && this.waitForTouch) {

            }
            else {

                for (var nameI = 1; nameI <= ig.game.dynamicThingManager.frameVariantsMax; nameI++) {
                    if ( this.frameData[this.currentMode] ) {
                        var commands = this.frameData[this.currentMode]['f' + this.frame + '_' + nameI];
                        if (commands) {
                            var spreadOverFrames = commands.spreadOverFrames;
                            for (var i = 1; i <= this.maxCells; i++) {
                                var name = 'e' + i;
                                if (commands[name]) {
                                    this.assignCommandsToSubEntity(this.subEntities[name], commands[name], spreadOverFrames, i);
                                }
                            }
                        }
                    }
                }
    
                for (var i = 1; i <= this.maxCells; i++) {
                    this.updateSubEntity(this.subEntities['e' + i]);
                }
    
                for (var nameI = 1; nameI <= ig.game.dynamicThingManager.frameVariantsMax; nameI++) {
                    if ( this.frameData[this.currentMode] ) {
                        var commands = this.frameData[this.currentMode]['f' + this.frame + '_' + nameI];
                        if (commands) {
                            if (commands.playSound) {
                                if ( this.fullSoundsLeftToPlay > 0 || ig.game.chance(15) ) {
                                    var optionalVolume = null;
                                    if (this.fullSoundsLeftToPlay <= 1 && !this.isAttached) { optionalVolume = .15; }
                                    var didPlay = ig.game.sounds.playIncludedSound(this, null, optionalVolume);
                                    if (didPlay && !this.isInMultithing) {
                                        if (ig.game.debug.didEnableDialog && optionalParentPlayer) {
                                            console.log(optionalParentPlayer.screenName, 'of user id', optionalParentPlayer.remoteId,
                                                    'plays sound id', this.soundId,
                                                    'via Dynamic id', this.thingTypeId);
                                        }
                                        this.fullSoundsLeftToPlay--;
                                    }
                                }
                            }
                            else if (commands.say) {
                                this.addSpeechLineIfOk(commands.say);
                            }
                        }
                    }
                }

                this.frame++;
            }

            this.calculateCombinedRgba();
            this.speechDisplay.update( {x: this.pos.x + 10, y: this.pos.y} );
        }

        if (this.attributes.solid) { this.parent(); }
    },
    
    adjustGrabbedPlayer: function(player) {
        if (player && this.grabCell) {
            var subEntity = this.subEntities['e' + this.grabCell];
            player.pos.x = this.pos.x + subEntity.pos.x + subEntity.pivot.x;
            player.pos.y = this.pos.y + subEntity.pos.y + subEntity.pivot.y;
            if (player.currentAnim) {
                player.currentAnim.angle = subEntity.rotation;
            }
        }
    },
    
    detectMode: function(player) {
        var detectedMode;
        
        if (player && player.vel) {
            detectedMode = 'default';
            
            if (!this.didFinishStartMode) {
                detectedMode = 'start';
            }
            else if (this.currentMode == 'action') {
                detectedMode = 'action';
            }
            else if (player.isSitting) {
                detectedMode = 'sit';
            }
            else if (player.isLying) {
                detectedMode = 'lie';
            }
            else if (player.actionMode == player.actionModes.CLIMBING) {
                detectedMode = 'climb';
            }
            else if (player.actionMode == player.actionModes.SWIMMING) {
                detectedMode = 'swim';
            }
            else if (player.vel.y < 0) {
                detectedMode = player.attachments.m ? 'mounted rise' : 'rise';
            }
            else if (player.vel.y > 0) {
                detectedMode = player.attachments.m ? 'mounted fall' : 'fall';
            }
            else if (player.vel.x != 0) {
                detectedMode = 'move';
            }
            else if (player.anims && player.currentAnim == player.anims.creating) {
                detectedMode = 'create';
            }

        }
        else {

            if (this.isInMultithing) {
                if (this.currentMode != 'randomize' && this.currentMode != 'private randomize') {
                    if (this.multithingPrivate && this.multithingRandomize && this.frameData['private randomize']) {
                        detectedMode = 'private randomize';
                        this.multithingRandomize = false;
                    }
                    else if (this.multithingPrivate && this.frameData['private']) {
                        detectedMode = 'private';
                        this.multithingRandomize = false;
                    }
                    else if (this.multithingRandomize && this.frameData['randomize']) {
                        detectedMode = 'randomize';
                        this.multithingRandomize = false;
                    }
                    else if (this.multithingStatePositiveNegative &&
                            this.frameData[this.multithingStatePositiveNegative]) {
                        detectedMode = this.multithingStatePositiveNegative;
                    }
                    else if (this.multithingStateEvenOdd &&
                            this.frameData[this.multithingStateEvenOdd]) {
                        detectedMode = this.multithingStateEvenOdd;
                    }
                    else if (this.multithingMoved && this.frameData['moved']) {
                        detectedMode = 'moved';
                        this.multithingMoved = false;
                    }
                    else if (this.multithingState !== undefined) {
                        detectedMode = 'state ' + this.multithingState;
                    }
                }
            }

            if (!this.detectedMode) {
                var time = ig.game.syncedClock.getTimeSinceMidnightObjectRounded();
                var timeCached = this.latestTimeCached;
                if (time.hours !== null && timeCached && this.currentMode == 'default') {
                    var data = this.frameData;

                    if (time.hours != timeCached.hours && data['every day'] &&
                            time.hours == 0) {
                        detectedMode = 'every day';
                    }
                    else if (time.hours != timeCached.hours && data['every 12 hours'] &&
                            time.hours % 12 == 0) {
                        detectedMode = 'every 12 hours';
                    }
                    else if (time.hours != timeCached.hours && data['every 6 hours'] &&
                            time.hours % 6 == 0) {
                        detectedMode = 'every 6 hours';
                    }
                    else if (time.hours != timeCached.hours && data['every 3 hours'] &&
                            time.hours % 3 == 0) {
                        detectedMode = 'every 3 hours';
                    }
                    else if (time.hours != timeCached.hours && data['every hour']) {
                        detectedMode = 'every hour';
                    }
                    else if (time.minutes != timeCached.minutes) {
                        if  (time.minutes % 30 == 0 && data['every 30 minutes']) {
                            detectedMode = 'every 30 minutes';
                        }
                        else if (time.minutes % 15 == 0 && data['every 15 minutes']) {
                            detectedMode = 'every 15 minutes';
                        }
                        else if (time.minutes % 10 == 0 && data['every 10 minutes']) {
                            detectedMode = 'every 10 minutes';
                        }
                        else if (time.minutes % 5 == 0 && data['every 5 minutes']) {
                            detectedMode = 'every 5 minutes';
                        }
                        else if (time.minutes % 4 == 0 && data['every 4 minutes']) {
                            detectedMode = 'every 4 minutes';
                        }
                        else if (time.minutes % 3 == 0 && data['every 3 minutes']) {
                            detectedMode = 'every 3 minutes';
                        }
                        else if (time.minutes % 2 == 0 && data['every 2 minutes']) {
                            detectedMode = 'every 2 minutes';
                        }
                        else if (data['every minute']) {
                            detectedMode = 'every minute';
                        }
                    }
                }
                this.latestTimeCached = ig.game.cloneObject(time);
            }
        }
        
        if (detectedMode) { this.setToNewModeIfAvailable(detectedMode); }
    },
    
    setToNewModeIfAvailable: function(newMode) {
        if (newMode != this.currentMode) {
            this.currentMode = this.frameData[newMode] ? newMode : 'default';
            
            if (this.currentMode != this.previousMode) {
                var skipModeReset = true;
                this.reset(skipModeReset);
                this.previousMode = this.currentMode;
            }
        }
    },
    
    handleActionReceived: function(doTransmit) {
        if ( this.attributes.actionable && ( !this.lastActionTimer || this.lastActionTimer.delta() >= .5 ) ) {
            this.lastActionTimer = new ml.Timer();
            if (!this.emitsId) { ig.game.sounds.playIncludedSound(this); }

            this.reset();
            this.setToNewModeIfAvailable('action');
            this.update();
            
            if (doTransmit) {
                ig.game.interactingManager.informSomeoneDid(ig.game.ourPlayer, 'uses', this.givenName);
                ig.game.websocketComs.transmitEquipmentAction();
            }
        }
    },

    calculateCombinedRgba: function() {
        this.rgba = null;
        var entityRgbas = [];
        for (var i = 1; i <= this.maxCells; i++) {
            var entity = this.subEntities['e' + i];
            if ( entity.rgb && !(entity.rgb[0] == 0 && entity.rgb[1] == 0 && entity.rgb[2] == 0) ) {
                entityRgbas.push( [ entity.rgb[0], entity.rgb[1], entity.rgb[2], entity.opacity ] );
            }
        }

        if (entityRgbas.length == 1) {
            this.rgba = entityRgbas[0];
        }
        else if (entityRgbas.length >= 2) {
            this.rgba = ig.game.lightsManager.getMixedRgbaAdditiveWithScaling(entityRgbas);
        }

        if (this.rgba) {
            for (var i =  0; i < 3; i++) {
                this.rgba[i] = Math.round( this.rgba[i] );
            }
            this.rgba[3] = ig.game.lightsManager.limitIncludingNaN( this.rgba[3], 0, 1 );
        }

        if ( this.rgba &&
                ( this.rgba[3] == 0 || (this.rgba[0] == 0 && this.rgba[1] == 0 && this.rgba[2] == 0) ) ) {
            this.rgba = null;
        }
    },

    ungrabPlayers: function(withSound) {
        if (this.containsGrabbing) {
            this.grabCell = null;
            var entities = ig.game.entitiesByType.player;
            if (entities) {
                for (var i = 0; i < entities.length; i++) {
                    var player = entities[i];
                    if (player.dynathingWhichGrabbedMe &&
                            player.dynathingWhichGrabbedMe.id == this.id) {
                        if (player.currentAnim) { player.resetAnimAngles(); }
                        player.dynathingWhichGrabbedMe = null;
                        
                        if ( withSound &&
                                ( !this.lastGrabSoundTimer || this.lastGrabSoundTimer.delta() >= 1 ) ) {
                            this.lastGrabSoundTimer = new ml.Timer();
                            ig.game.sounds.shortWhoosh.play();
                        }

                    }
                    
                }
            }
        }
    },

    handleResetIfNeeded: function() {
        for (var nameI = 1; nameI <= ig.game.dynamicThingManager.frameVariantsMax; nameI++) {
            if ( this.frameData[this.currentMode] ) {
                var commands = this.frameData[this.currentMode]['f' + this.frame + '_' + nameI];
                if ( (commands && commands.restart) || this.frame >= this.frameMax ) {
                    this.ungrabPlayers();

                    if (this.killAfterRan) {
                        this.kill();
                    }
                    else {
                        this.reset();
                        this.regenerateFrameDataIfNeeded();
                    }
                    
                    if (this.isCreatorLivePreview && ig.game.isPainting) {
                        ig.game.painter.dynamicThingFinishedRound();
                    }
                }
            }
        }
    },

    regenerateFrameDataIfNeeded: function() {
        var fpsChange = ig.game.speedWatcher.lastAverageFPS ?
                Math.abs(this.fpsOnGeneration - ig.game.speedWatcher.lastAverageFPS) : 0;
        if ( !ig.game.speedWatcher.lastAverageFPS || fpsChange >= 3 || ( fpsChange > 0 && ig.game.chance(10) ) ) {
            if (ig.game.speedWatcher.lastAverageFPS) {
                this.fpsOnGeneration = ig.game.speedWatcher.lastAverageFPS;
            }
            this.frameData = ig.game.dynamicThingManager.getParsedFrameData(this.text, this.maxCells, {});
        }
    },

    kill: function() {
        if (this.parentEntity) {
            this.parentEntity.dynamicEnded(this.givenName, this.attributes && this.attributes.replaces,
                    this.triggeredByInteractingPlayerId);
        }
        this.parent();
    },

    updateSubEntity: function(entity) {
        if (entity.targetOpacity != null) {
            if (entity.opacity > entity.targetOpacity) {
                entity.opacity -= entity.opacityStep;
                if (entity.opacity <= entity.targetOpacity) { this.handleOpacityReached(entity); }
            }
            else if (entity.opacity < entity.targetOpacity) {
                entity.opacity += entity.opacityStep;
                if (entity.opacity >= entity.targetOpacity) { this.handleOpacityReached(entity); }
            }
        }

        if (entity.targetPos.x != null) {
            if (entity.pos.x > entity.targetPos.x) {
                entity.pos.x -= entity.posStep.x;
                if (entity.pos.x <= entity.targetPos.x) { this.handleTargetPosXReached(entity); }
            }
            else if (entity.pos.x < entity.targetPos.x) {
                entity.pos.x += entity.posStep.x;
                if (entity.pos.x >= entity.targetPos.x) { this.handleTargetPosXReached(entity); }
            }
        }

        if (entity.targetPos.y != null) {
            if (entity.pos.y > entity.targetPos.y) {
                entity.pos.y -= entity.posStep.y;
                if (entity.pos.y <= entity.targetPos.y) { this.handleTargetPosYReached(entity); }
            }
            else if (entity.pos.y < entity.targetPos.y) {
                entity.pos.y += entity.posStep.y;
                if (entity.pos.y >= entity.targetPos.y) { this.handleTargetPosYReached(entity); }
            }
        }

        if (entity.targetRotation != null) {
            if (entity.rotation > entity.targetRotation) {
                entity.rotation -= entity.rotationStep;
                if (entity.rotation <= entity.targetRotation) { this.handleRotationReached(entity); }
            }
            else if (entity.rotation < entity.targetRotation) {
                entity.rotation += entity.rotationStep;
                if (entity.rotation >= entity.targetRotation) { this.handleRotationReached(entity); }
            }
        }

        for (var i = 0; i < entity.rgb.length; i++) {
            if (entity.targetRgb[i] != null) {
                if (entity.rgb[i] > entity.targetRgb[i]) {
                    entity.rgb[i] -= entity.rgbStep[i];

                    if (entity.rgb[i] <= entity.targetRgb[i]) {
                        entity.rgb = ig.game.cloneObject(entity.targetRgb);
                        entity.targetRgb = [null, null, null];
                        entity.rgbStep = [null, null, null];
                    }
                }
                else if (entity.rgb[i] < entity.targetRgb[i]) {
                    entity.rgb[i] += entity.rgbStep[i];

                    if (entity.rgb[i] >= entity.targetRgb[i]) {
                        entity.rgb = ig.game.cloneObject(entity.targetRgb);
                        entity.targetRgb = [null, null, null];
                        entity.rgbStep = [null, null, null];
                    }
                }
            }
        }

        if (entity.accel.x) {
            entity.vel.x += entity.accel.x;
            entity.pos.x += entity.accel.x;
            if ( Math.abs(entity.accel.x) > this.velMax ) {
                entity.vel.x = parseInt(entity.vel.x).limit(-this.velMax, this.velMax);
            }
        }
        else if (entity.accel.y) {
            entity.vel.y += entity.accel.y;
            entity.pos.y += entity.vel.y;
            if ( Math.abs(entity.vel.y) > this.velMax ) {
                entity.vel.y = parseInt(entity.vel.y).limit(-this.velMax, this.velMax);
            }
        }

        var maxPos = 500
        if ( Math.abs(entity.pos.x) > maxPos ) { entity.pos.x = (entity.pos.x).limit(-maxPos, maxPos); }
        if ( Math.abs(entity.pos.y) > maxPos ) { entity.pos.y = (entity.pos.y).limit(-maxPos, maxPos); }
        
        var clockAngle = this.getClockAngle(entity);
        if (clockAngle !== null) { entity.rotation = clockAngle; } 
    },

    handleOpacityReached: function(entity) {
        entity.opacity = entity.targetOpacity;
        entity.targetOpacity = null;
        entity.opacityStep = null;
    },

    handleRotationReached: function(entity) {
        entity.rotation = entity.targetRotation;
        entity.targetRotation = null;
        entity.rotationStep = null;
    },

    handleTargetPosXReached: function(entity) {
        entity.pos.x = entity.targetPos.x;
        entity.targetPos.x = null;
        entity.posStep.x = null;
    },

    handleTargetPosYReached: function(entity) {
        entity.pos.y = entity.targetPos.y;
        entity.targetPos.y = null;
        entity.posStep.y = null;
    },

    assignCommandsToSubEntity: function(entity, commands, spreadOverFrames, cellIndex) {
        var maxOffset = ig.game.dynamicThingManager.otherMax;

        if (spreadOverFrames != undefined && spreadOverFrames > 0) {
            if (commands.opacity != undefined) {
                entity.targetOpacity = commands.opacity;
                entity.opacityStep = Math.abs(entity.targetOpacity - entity.opacity) / spreadOverFrames;
            }

            if (commands.left != undefined) {
                entity.targetPos.x = entity.pos.x - commands.left * this.flipMultiplier;
                entity.posStep.x = Math.abs(entity.targetPos.x - entity.pos.x) / spreadOverFrames;
            }
            else if (commands.right != undefined) {
                entity.targetPos.x = entity.pos.x + commands.right * this.flipMultiplier;
                entity.posStep.x = Math.abs(entity.targetPos.x - entity.pos.x) / spreadOverFrames;
            }
            if (commands.up != undefined) {
                entity.targetPos.y = entity.pos.y - commands.up;
                entity.posStep.y = Math.abs(entity.targetPos.y - entity.pos.y) / spreadOverFrames;
            }
            else if (commands.down != undefined) {
                entity.targetPos.y = entity.pos.y + commands.down;
                entity.posStep.y = Math.abs(entity.targetPos.y - entity.pos.y) / spreadOverFrames;
            }

            if (commands.rotate != undefined) {
                entity.targetRotation = entity.rotation + commands.rotate * this.flipMultiplier;
                entity.rotationStep = Math.abs(entity.targetRotation - entity.rotation) / spreadOverFrames;
            }

            if (commands.light != undefined) {
                entity.targetRgb = ig.game.cloneObject(commands.light);
                entity.rgbStep = [
                    Math.abs(entity.targetRgb[0] - entity.rgb[0]) / spreadOverFrames,
                    Math.abs(entity.targetRgb[1] - entity.rgb[1]) / spreadOverFrames,
                    Math.abs(entity.targetRgb[2] - entity.rgb[2]) / spreadOverFrames
                    ];
            }
            
        }
        else {
            if (commands.opacity != undefined) { entity.opacity = commands.opacity; }
    
            if (commands.rotate != undefined) {
                if (entity.rotation == null) { entity.rotation = 0; }
                entity.rotation += commands.rotate * this.flipMultiplier;
            }
    
            if (commands.right != undefined) { entity.pos.x += commands.right * this.flipMultiplier; }
            if (commands.left != undefined) { entity.pos.x -= commands.left * this.flipMultiplier; }
            if (commands.up != undefined) { entity.pos.y -= commands.up; }
            if (commands.down != undefined) { entity.pos.y += commands.down; }
            if (commands.bright != undefined) { entity.bright = true; }
            if (commands.unbright != undefined) { entity.bright = false; }
            if (this.attributes.startsOnTouch && !this.isInHolderOrDialog) {
                if (commands.grab != undefined) { this.grabCell = cellIndex; }
                if (commands.ungrab != undefined && this.grabCell == cellIndex) { this.ungrabPlayers(true); }
            }

            if (commands.crop != undefined && this.canUseCrop) {
                entity.cropRect = {x: commands.crop[0], y: commands.crop[1],
                        width: commands.crop[2], height: commands.crop[3] };
            }
    
            entity.pos.x = (entity.pos.x).limit(-maxOffset, maxOffset);
            entity.pos.y = (entity.pos.y).limit(-maxOffset, maxOffset);

            if (commands.light != undefined) {
                entity.rgb = ig.game.cloneObject(commands.light);
            }
            
            if ( (commands.text || commands.text === '') && this.canUseTextOrSpeech ) {
                entity.text = ig.game.strings.replaceAll(commands.text, ig.game.dynamicThingManager.lineBreakString, "\n");
                entity.text = ig.game.strings.cutStringLength(entity.text, this.isAttached ? 50 : 300);
            }
            if (commands.font) { entity.font = commands.font; }
        }

        if (commands.pivot != undefined) {
            entity.pivot.x = commands.pivot[0];
            entity.pivot.y = commands.pivot[1];
        }

        if (commands.accelerateLeft != undefined) { entity.accel.x = -commands.accelerateLeft * this.flipMultiplier; }
        else if (commands.accelerateRight != undefined) { entity.accel.x = commands.accelerateRight * this.flipMultiplier; }

        if (commands.accelerateUp != undefined) { entity.accel.y = -commands.accelerateUp; }
        else if (commands.accelerateDown != undefined) { entity.accel.y = commands.accelerateDown; }

        if (commands.zIndex != undefined) {
            entity.zIndex = commands.zIndex;
        }

        if (commands.flipHorizontal != undefined) { entity.flip.x = !entity.flip.x; }
        if (commands.flipVertical != undefined) { entity.flip.y = !entity.flip.y; }
        
        if (commands.secondsAngle != undefined) { entity.secondsAngle = true; }
        else if (commands.secondsAngleInSteps != undefined) { entity.secondsAngleInSteps = true; }
        else if (commands.minutesAngle != undefined) { entity.minutesAngle = true; }
        else if (commands.minutesAngleInSteps != undefined) { entity.minutesAngleInSteps = true; }
        else if (commands.hoursAngle != undefined) { entity.hoursAngle = true; }
        else if (commands.hoursAngleInSteps != undefined) { entity.hoursAngleInSteps = true; }
    },

    draw: function(isMovementTrailDraw) {
        if (this.stoppedDueToSpeedIssues) { return; }

        this.handleFlipAdjustmentIfNeeded();

        var baseX = this.pos.x - ig.game._rscreen.x;
        var baseY = this.pos.y - ig.game._rscreen.y;
        if (this.containsZIndexHandling) {
            for (var zIndex = 1; zIndex <= this.maxCells; ++zIndex) {
                for (var cell = 1; cell <= this.maxCells; ++cell) {
                    var subEntity = this.subEntities['e' + cell];
                    if (subEntity.zIndex == zIndex) {
                        this.drawSubEntity(baseX, baseY, cell, subEntity, isMovementTrailDraw);
                    }
                }
            }

        }
        else {
            for (var cell = 1; cell <= this.maxCells; ++cell) {
                this.drawSubEntity(baseX, baseY, cell, this.subEntities['e' + cell], isMovementTrailDraw);
            }

        }

        this.handleResetIfNeeded();
    },
    
    drawSpeech: function() {
        if (this.stoppedDueToSpeedIssues) { return; }
        this.speechDisplay.draw();
    },

    drawSubEntity: function(baseX, baseY, cell, entity, isMovementTrailDraw) {
        if ( entity && entity.opacity > 0 &&
                !( entity.cropRect && ig.game.speedWatcher.isVerySlow() ) ) {

            if (this.isForProfileWallpaper) {
                entity.bright = true;
                var maxAlpha = .8;
                if (entity.opacity > maxAlpha) { entity.opacity = maxAlpha; }
            }

            if (entity.bright) { ml.Misc.setDrawMode('lighter'); }

            var anim = this.useCellSplitToAvoidMemoryLeak ? this.singleAnims['e' + cell] : this.anims['e' + cell];
            if (!anim) { return; }

            if (this.parentIsFlipped && !this.attributes.nonFlipping) {
                anim.flip.x = !entity.flip.x;
            }
            else {
                anim.flip.x = entity.flip.x;
            }
            anim.flip.y = entity.flip.y;
            anim.angle = entity.rotation;

            if (anim.flip.x) {
                var center = this.size.x / 2;
                if (entity.pivot.x < center) {
                    anim.pivot.x = this.size.x - entity.pivot.x;
                }
                else if (entity.pivot.x > center) {
                    anim.pivot.x = Math.abs(entity.pivot.x - this.size.x);
                }
            }
            else {
                anim.pivot.x = entity.pivot.x;
                anim.pivot.y = entity.pivot.y;
            }

            anim.alpha = entity.opacity;
            var x = baseX + entity.pos.x - this.offset.x;
            var y = baseY + entity.pos.y - this.offset.y;

            if (entity.cropRect) {
                var rect = this.getAbsoluteRectangle(entity.cropRect);
                ig.system.context.save();
                ig.system.context.beginPath();
                ig.system.context.rect(rect.x, rect.y, rect.width, rect.height);
                ig.system.context.clip();
            }

            anim.draw(x, y);
            
            if (entity.text && !isMovementTrailDraw) {
                var maxOpacity = .8;
                ig.system.context.globalAlpha = entity.opacity * maxOpacity;
                ig.game[entity.font].draw( this.replacePlaceholders(entity.text), x + anim.pivot.x, y + Math.round(anim.pivot.y - 2.5), ig.Font.ALIGN.CENTER );
                ig.system.context.globalAlpha = 1;
            }

            if (entity.cropRect) { ig.system.context.restore(); }
            if (entity.bright) { ml.Misc.resetDrawMode(); }
        }
    },
    
    getClockAngle: function(entity) {
        var angleRadians = null;
        if (ig.game.syncedClock.timeSinceMidnightObject.hours !== null) {
            var hours = ig.game.syncedClock.timeSinceMidnightObject.hours;
            var minutes = ig.game.syncedClock.timeSinceMidnightObject.minutes;
            var seconds = ig.game.syncedClock.timeSinceMidnightObject.seconds;
            
            if (entity.secondsAngle || entity.secondsAngleInSteps) {
                if (entity.secondsAngleInSteps) { seconds = Math.floor(seconds); }
                angleRadians = this.getDegreesToRadians(seconds / 60 * 360);
            }
            else if (entity.minutesAngle || entity.minutesAngleInSteps) {
                if (entity.minutesAngleInSteps) { minutes = Math.floor(minutes); }
                angleRadians = this.getDegreesToRadians(minutes / 60 * 360);
            }
            else if (entity.hoursAngle || entity.hoursAngleInSteps) {
                if (entity.hoursAngleInSteps) { hours = Math.floor(hours); }
                angleRadians = this.getDegreesToRadians(hours / 12 * 360);
            }
            
            if (angleRadians) {
                if (entity.flip.x) { angleRadians *= -1; }
                if (entity.flip.y) { angleRadians *= -1; }
            }
        }
        return angleRadians;
    },
    
    getDegreesToRadians: function(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    getRadiansToDegrees: function(radians) {
        return radians * (180 / Math.PI);
    },
    
    addSpeechLineIfOk: function(s) {
        if (this.canUseTextOrSpeech) {
            var speechDisplayLineMaxOpacity = .8;
            s = this.replacePlaceholders(s);
            ig.system.context.globalAlpha = speechDisplayLineMaxOpacity;
            if ( !this.speechLineJustAdded() ) {
                this.speechDisplay.addLineFullText(s, null, true);
            }
            ig.system.context.globalAlpha = 1;
        }
    },
    
    replacePlaceholders: function(s) {
        if ( s.indexOf('[time]') >= 0 ) {
            var thisTime = new Date(ig.game.syncedClock.milliseconds);
            var toReplace =
                    ig.game.strings.padNumber( thisTime.getUTCHours() ) + ':' +
                    ig.game.strings.padNumber( thisTime.getUTCMinutes() );
            s = ig.game.strings.replaceAll(s, '[time]', toReplace);
        }
        
        if ( s.indexOf('[date]') >= 0 ) {
            var utcDate = new Date(ig.game.syncedClock.milliseconds);
            var toReplace = ig.game.strings.getIsoDateString(utcDate);
            s = ig.game.strings.replaceAll(s, '[date]', toReplace);
        }

        if ( s.indexOf('[people]') >= 0 ) {
            var peopleCount = 0;
            if (ig.game.entitiesByType && ig.game.entitiesByType.player) {
                peopleCount = ig.game.entitiesByType.player.length;
            }
            s = ig.game.strings.replaceAll( s, '[people]', String(peopleCount) );
        }
        
        if ( s.indexOf('[center distance]') >= 0 ) {
            var toReplace = ig.game.sectorManager.getDistanceToCenterInSteps(this.pos);
            s = ig.game.strings.replaceAll(s, '[center distance]', toReplace);
        }
        
        if ( s.indexOf('[state]') >= 0 ) {
            var toReplace = this.multithingState !== undefined ? this.multithingState : '';
            s = ig.game.strings.replaceAll(s, '[state]', toReplace);
        }
        
        if ( s.indexOf('[name]') >= 0 ) {
            if (ig.game.entitiesByType.player) {
                var toReplace = '';

                if (this.isInHolderOrDialog && ig.game.ourPlayer) {
                    toReplace = ig.game.ourPlayer.screenName;
                }
                else if (this.isAttached && this.parentScreenName) {
                    toReplace = this.parentScreenName;
                }
                else {
                    var player;
                    if ( !this.closestPlayerCache || ig.game.chance(10) ) {
                        player = ml.Misc.getClosestPlayer(this);
                    }
                    else {
                        player = this.closestPlayerCache;
                    }
                    if (player) {
                        this.closestPlayerCache = player;
                        toReplace = player.screenName;
                    }
                }
                s = ig.game.strings.replaceAll(s, '[name]', toReplace);
            }
        }
        
        return s;
    },
    
    speechLineJustAdded: function() {
        var justAdded = false;
        var activeSpeechLine = this.speechDisplay.activeLine();
        if (activeSpeechLine && !activeSpeechLine.moving) {
            justAdded = true;
        }
        return justAdded;
    },

    getAbsoluteRectangle: function(cropRect) {
        var rect = {x: this.pos.x + this.offset.x - ig.game._rscreen.x + cropRect.x,
                    y: this.pos.y + this.offset.y - ig.game._rscreen.y + cropRect.y,
                    width: cropRect.width,
                    height: cropRect.height};
        rect.x *= ig.system.scale;
        rect.y *= ig.system.scale;
        rect.width *= ig.system.scale;
        rect.height *= ig.system.scale;
        rect.x = Math.round(rect.x);
        rect.y = Math.round(rect.y);
        return rect;
    },

    check: function(other) {
        if (this.waitForTouch && other instanceof EntityPlayer) {
            var isMoving = Math.abs(other.vel.x) + Math.abs(other.vel.y) >= 25;
            if (isMoving) {
                ig.game.interactingManager.informNearbyOfInteractingEntityAction(this.pos, 'sees', 'activates', this.givenName);
                ig.game.interactingManager.informSomeoneDid(other, 'activates', this.givenName);

                this.waitForTouch = false;

                other.forceSend = true;
                this.grabAllNearbyPlayersIfNeeded();
            }
        }
    },
    
    grabAllNearbyPlayersIfNeeded: function() {
        if (this.grabCell) {
            var entities = ig.game.entitiesByType.player;
            if (entities) {
                for (var i = 0; i < entities.length; i++) {
                    var player = entities[i];
                    if ( this.distanceTo(player) <= 30 ) {
                        player.dynathingWhichGrabbedMe = this;
                        player.vel = {x: 0, y: 0};
                        player.accel = {x: 0, y: 0};
                        if ( !this.lastGrabSoundTimer || this.lastGrabSoundTimer.delta() >= 1 ) {
                            this.lastGrabSoundTimer = new ml.Timer();
                            ig.game.sounds.shortWhoosh.play();
                        }
                    }
                }
            }
        }
    },
    
    collideWith: function(other, axis) {
        this.parent(other, axis);
    },
    
    handleMovementTrace: function(res) {
        if (this.attributes.solid) { this.parent(res); }
    },

    setToSolid: function() {
        this.offset.x = (this.size.x - ig.game.tileSize) / 2;
        this.offset.y = (this.size.y - ig.game.tileSize);
        this.pos.x += this.offset.x;
        this.pos.y += this.offset.y;
        this.size = {x: ig.game.tileSize, y: ig.game.tileSize};
        this.collides = ig.Entity.COLLIDES.FIXED;
    },

});

});