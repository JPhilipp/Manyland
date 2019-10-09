ig.module('game.ui.multithing')
.requires('game.ui.components.uidialog')
.defines(function(){
'use strict';

window.Multithing = UIDialog.extend({

    isOpen: false,
    pos: {x: null, y: 5},
    size: {x: 342, y: 190},
    participants: {},
    participantSections: [],
    neutralSections: [],
    maxParticipantsDefault: 4,
    maxParticipantsPossible: 8,
    placementId: null,
    sourceEntity: null,
    isEditingStatic: false,
    isEditingMovables: false,
    isEditingSettings: false,
    staticItems: [],
    movableItems: [],
    staticItemsAtStart: [],
    movableItemsAtStart: [],
    mouseWasDown: false,
    draggedItem: null,
    draggedItemOffset: {x: 0, y: 0},
    localIdCounter: 0,
    name: null,
    allowedTypesStatic: ['DECO', 'DECOBIG', 'DECOVBIG', 'DECOFB', 'LIVELY',
            'DYNATHING', 'READABLE', 'WRITABLE', 'STACKHOLD',
            'SOLID', 'DECOFG', 'LIQUID', 'GLOW', 'ENVIRONM', 'MEDIUM',
            'CONSUMAB', 'EQUIPMENT', 'EMITTER'],
    allowedTypesMovable: ['DECO', 'SOLID', 'DYNATHING', 'STACKHOLD',
            'DECOANIM', 'LIVELY', 'DECOFG', 'DECOFB', 'LIQUID',
            'CONSUMAB', 'EQUIPMENT', 'EMITTER', 'GLOW'],
    maxStaticItems: 1000,
    maxMovableItems: 1000,
    dragStartTimer: null,
    dragStartPos: null,
    maxDeltaItemsWhenSyncing: 100,
    menuLabelClickText: null,
    menuCloseClickText: null,
    menuIsOpen: false,
    menuEntries: null,
    clickSpotMenuEntries: null,
    weAreCreator: false,
    saveClickText: null,
    receivedRemoteDataQueue: [],
    settings: {},
    locallyEditableTexts: {},
    lastCancelledAddItem: null,
    lastActiveItem: null,
    showGrid: false,
    waitingForChangesSinceStartTimer: null,
    waitingForChangesRetryCount: 0,
    allEntitiesLoaded: false,
    askForChangesOnceEntitiesLoaded: false,
    moveDistanceConsideredImportantForDust: 10,
    seedMax: 1000000,
    editHistory: [],
    editHistorMax: 100,
    editHistoryRecordingActive: true,
    showDustTrails: true,
    
    open: function(sourceEntity, doShowDustTrails) {
        if (!this.isOpen) {
            this.waitingForChangesSinceStartTimer = new ml.Timer();
            this.showDustTrails = doShowDustTrails;
            this.localIdCounter = 0;
            this.participants = {};
            this.staticItems = [];
            this.movableItems = [];
            this.settings = {};
            this.editHistory = [];
            this.editHistoryRecordingActive = true;
            this.isEditingStatic = false;
            this.isEditingMovables = false;
            this.isEditingSettings = false;
            this.dragStartTimer = null;
            this.dragStartPos = null;
            this.menuLabelClickText = null;
            this.menuCloseClickText = null;
            this.menuIsOpen = false;
            this.menuEntries = null;
            this.clickSpotMenuEntries = null;
            this.weAreCreator = false;
            this.saveClickText = null;
            this.receivedRemoteDataQueue = [];
            this.participantSections = [];
            this.neutralSections = [];
            this.locallyEditableTexts = {};
            this.lastCancelledAddItem = null;
            this.lastActiveItem = null;
            this.showGrid = false;
            this.allEntitiesLoaded = false;
            this.askForChangesOnceEntitiesLoaded = false;

            this.mouseWasDown = false;
            this.draggedItem = null;
            
            this.placementId = sourceEntity.placementId;
            this.sourceEntity = sourceEntity;
            this.id = sourceEntity.thingTypeId;
            this.name = this.sourceEntity.givenName;

            ig.game.ourPlayer.viewingMultithingPlacementId = this.placementId;
            ig.game.websocketComs.transmitMultithingActivity(
                    'startViewing', this.placementId);
            ig.game.sounds.shortWhoosh.play();

            this.initPosAndSize();
            this.loadSetup();
            
            ig.game.interactingManager.informSomeoneDid(ig.game.ourPlayer, 'activates',
                    this.sourceEntity.givenName);
               
            this.parent();
            if (ig.ua.mobile) { ig.game.virtualJoystick.initClickSpots(); }
        }
    },
    
    getUserWhoViewedFirst: function() {
        var user = ig.game.ourPlayer;

        var users = ig.game.entitiesByType.player;
        if (users) {
            for (var i = 0; i < users.length; i++) {
                var thisUser = users[i];
                if ( !thisUser._killed && thisUser.remoteId != user.remoteId &&
                        thisUser.viewingMultithingPlacementId && thisUser.viewingMultithingSince &&
                        thisUser.viewingMultithingPlacementId == this.placementId) {
                    var isOlder = !user.viewingMultithingSince ||
                            thisUser.viewingMultithingSince < user.viewingMultithingSince;
                    if (isOlder) {
                        user = thisUser;
                    }
                }
            }
        }

        return user;
    },

    initMenuEntriesData: function() {
        this.menuEntries = [];
        var self = this;
        this.menuEntries.push({
                label: 'restart',
                clickCall: function() { self.restart(); }
                });
        if (this.weAreCreator) {
            this.menuEntries.push({
                    label: 'set up statics',
                    clickCall: function() { self.startEditStatic(); },
                    icon: 'baseEditStatic'
                    });
            this.menuEntries.push({
                    label: 'set up movables',
                    clickCall: function() { self.startEditMovables(); },
                    icon: 'baseEditMovables'
                    });
            this.menuEntries.push({
                    label: 'more',
                    clickCall: function() { self.reloadThenStartEditSettings(); },
                    icon: 'settingsIcon'
                    });
        }
        this.menuEntries.push({
                label: 'about multis...',
                clickCall: function() { self.openHelp(); }
                });

    },

    initPosAndSize: function() {
        if (ig.system.width < this.size.x) {
            this.pos.x = 0;
        }
        else {
            this.pos.x = Math.floor(ig.system.width / 2 - this.size.x / 2);
        }

        if (ig.game.panelSetIsOpen) { this.pos.x -= 16; }
        this.pos = this.getPosSnappedToScale(this.pos);
    },

    update: function() {
        if (this.isOpen) {
            if (!this.sourceEntity) {
                this.close();
            }
            else {
                if (this.isEditingSettings && !ig.game.alertDialog.isOpen) {
                    this.isEditingSettings = false;
                }
                this.checkIfAllEntitiesLoaded();
                if (this.allEntitiesLoaded && this.askForChangesOnceEntitiesLoaded) {
                    this.askForChangesOnceEntitiesLoaded = false;
                    ig.game.websocketComs.transmitMultithingActivity(
                            'askMasterForChangesSinceStart', this.placementId);
                }
                
                this.handleAskForChangesSinceStartAgainIfDelayed();
                this.removeParticipantsWhoStoppedViewing();

                this.applyReceivedRemoteData();
                this.handleShortcuts();
                this.handleMenuLabelClickText();
                this.handleMenuEntries();
                
                if (!this.waitingForChangesSinceStartTimer) {
                    this.handleDraggingAndClicks();
                }
                
                this.updateEntities(this.staticItems);
                this.updateEntities(this.movableItems);
                
                if (ig.input.pressed('esc') ) {
                    if (!ig.game.isPainting) {
                        ig.input.clearPressed();
                        this.close();
                    }
                }
                else {
                    this.parent();
                }
            }
        }
    },

    handleAskForChangesSinceStartAgainIfDelayed: function() {
        if ( this.waitingForChangesSinceStartTimer &&
                this.waitingForChangesSinceStartTimer.delta() >= 4 &&
                this.waitingForChangesRetryCount == 0 ) {
            console.log("First Multi changes response delayed, " +
                    "perhaps we weren't visible to other yet, retrying");
            this.waitingForChangesRetryCount++;
            this.waitingForChangesSinceStartTimer = new ml.Timer();
            ig.game.websocketComs.transmitMultithingActivity(
                    'askMasterForChangesSinceStart', this.placementId);
        }
    },
                
    checkIfAllEntitiesLoaded: function() {
        if (!this.allEntitiesLoaded) {
            var allLoaded = true;
            for (var i = 0; i < this.staticItems.length; i++) {
                var item = this.staticItems[i];
                if ( !(item && item.entity) ) {
                    allLoaded = false;
                    break;
                }
            }
            if (allLoaded) {
                for (var i = 0; i < this.movableItems.length; i++) {
                    var item = this.movableItems[i];
                    if ( !(item && item.entity) ) {
                        allLoaded = false;
                        break;
                    }
                }
            }
            
            if (allLoaded) {
                this.regenerateAllIsInOtherPrivateSection();
            }
            
            this.allEntitiesLoaded = allLoaded;
        }
    },
    
    undoLastOfEditHistory: function() {
        if (this.editHistory.length >= 1) {
            this.editHistoryRecordingActive = false;

            var edit = this.editHistory.pop();
            switch (edit.action) {
                case 'delete':
                    this.doAddItem(edit.id, edit.rot, edit.flip, edit.x, edit.y);
                    break;
                    
                case 'add':
                    this.deleteItem(edit.localId);
                    break;
                    
                case 'startMove':
                    var item = this.getItemByLocalId(this.staticItems, edit.localId);
                    if (!item) {
                        item = this.getItemByLocalId(this.movableItems, edit.localId)
                    }
                    if (item) {
                        item.targetX = edit.x;
                        item.targetY = edit.y;
                        item.flip = edit.flip;
                        item.rot = edit.rot;
                    }
                    break;
            }
            
            this.editHistoryRecordingActive = true;
        }
    },

    handleShortcuts: function() {
        if (this.weAreCreator) {
            if (this.isEditingStatic || this.isEditingMovables) {

                if ( ig.input.state('ctrl') && ig.input.pressed('d') ) {
                    ig.input.clearPressed();
                    var item = this.lastActiveItem;
                    if (item) {
                        var offset = ig.input.state('shift') ?
                                {x: 0, y: ig.game.tileSize} : {x: ig.game.tileSize, y: 0};
                        this.addItem(item.id, item.rot, item.flip,
                                item.x + offset.x, item.y + offset.y,
                                item.wiggleSpeed, item.wiggleDistance);
                    }
                }
                else if ( ig.input.state('ctrl') && ig.input.pressed('z') ) {
                    if (!ig.game.isPainting) {
                        ig.input.clearPressed();
                        this.undoLastOfEditHistory();
                    }
                }
                
            }

            if ( ig.input.state('ctrl') && ig.input.pressed('g') ) {
                ig.input.clearPressed();
                this.showGrid = !this.showGrid;
                ig.game.sounds.click.play();
            }
            else if ( ig.input.state('ctrl') && ig.input.pressed('k') ) {
                ig.input.clearPressed();
                if (this.isEditingStatic) { this.saveEdits(); }
                else                      { this.startEditStatic(); }
            }
            else if ( ig.input.state('ctrl') && ig.input.pressed('l') ) {
                ig.input.clearPressed();
                if (this.isEditingMovables) { this.saveEdits(); }
                else                        { this.startEditMovables(); }
            }

        }
    },

    getItemChangesSinceStart: function(itemsBefore, itemsNow) {
        var itemsWhichChanged = [];
        for (var i = 0; i < itemsNow.length; i++) {
            var item = itemsNow[i];
            var itemBefore = itemsBefore[i];
            if (    item.x != itemBefore.x || item.y != itemBefore.y ||
                    item.rot != itemBefore.rot || item.flip != itemBefore.flip ||
                    item.state != itemBefore.state
                    ) {

                var itemWithChanges = {id: item.localId};
                if (item.x != itemBefore.x || item.y != itemBefore.y) {
                    itemWithChanges.x = item.x;
                    itemWithChanges.y = item.y;
                }
                if (item.rot != itemBefore.rot) {
                    itemWithChanges.rot = parseInt(item.rot);
                }
                if (item.flip != itemBefore.flip) {
                    itemWithChanges.flip = parseInt(item.flip);
                }
                if (item.state != itemBefore.state) {
                    itemWithChanges.state = parseInt(item.state);
                }
                
                itemsWhichChanged.push(itemWithChanges);
                item.changedByUs = false;
            }
        }
        
        return itemsWhichChanged;
    },
    
    handleMenuEntries: function() {
        if ( this.menuIsOpen && ig.game.ourPlayer &&
                ( ig.game.ourPlayer.vel.x != 0 || ig.game.ourPlayer.vel.y != 0) ) {
            this.menuIsOpen = false;
            this.clickSpotMenuEntries = null;
        }

        if (this.menuIsOpen) {
            if (!this.clickSpotMenuEntries) { this.initMenuEntriesClickSpots(); }
            if (this.clickSpotMenuEntries) {
                for (var i = 0; i < this.clickSpotMenuEntries.length; i++) {
                    this.clickSpotMenuEntries[i].update();
                }
            }
        }
    },
    
    initMenuEntriesClickSpots: function() {
        var entity = this.sourceEntity;
        if (entity) {
            var entryWidth = ig.game.spriteSheet.bottomMenuMoreMiddle.width;
            var entryHeight = ig.game.spriteSheet.bottomMenuMoreMiddle.height;
            this.clickSpotMenuEntries = [];

            var x = entity.pos.x - ig.game._rscreen.x - 32;
            var max = this.menuEntries.length;
            for (var i = 0; i < max; i++) {
                var y = entity.pos.y - ig.game._rscreen.y - max * entryHeight +
                        i * entryHeight + 22;
                this.clickSpotMenuEntries[i] = new UIClickSpot(
                        {x: x, y: y}, {x: entryWidth, y: entryHeight}, false, null);
                this.clickSpotMenuEntries[i].onClick = this.menuEntries[i].clickCall;
                this.clickSpotMenuEntries[i].icon = this.menuEntries[i].icon;
            }
        }
    },
    
    handleMenuLabelClickText: function() {
        var entity = this.sourceEntity;
        if (entity) {
            var color = 'rgb(255,255,255)';
            var opacity = .8;
            if (!this.menuLabelClickText) {
                var label = entity.givenName;
                this.menuLabelClickText = new UIClickText({x: 0, y: 0}, label, ig.game.blackWhiteFont, color, opacity);
                var self = this;
                this.menuLabelClickText.onClick = function() { self.toggleOpenMenu(); }
            }
            if (!this.menuCloseClickText) {
                this.menuCloseClickText = new UIClickText({x: 0, y: 0}, 'x', ig.game.blackWhiteFont, color, opacity);
                var self = this;
                this.menuCloseClickText.onClick = function() { self.clickedClose(); }
            }
            if ( !this.saveClickText && (this.isEditingStatic || this.isEditingMovables) ) {
                var label = this.isEditingStatic ? '>> statics done' : '>> movables done';
                this.saveClickText = new UIClickText({x: 0, y: 0}, label, ig.game.blackWhiteFont, color, opacity);
                var self = this;
                this.saveClickText.onClick = function() { self.saveEdits(); }
            }
            
            this.menuCloseClickText.update();
            this.menuLabelClickText.update();
            
            if (this.saveClickText) {
                this.saveClickText.update();
            }
        }
    },

    updateEntities: function(items) {
        if (!this.sourceEntity) { return; }

        var posOverride = ig.game.cloneObject(this.sourceEntity.pos);
        posOverride.y -= ig.game.tileSize * 7;
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item && item.entity) {
                var retainPosition = item.targetX === undefined;
                if (retainPosition) {
                    var posBefore = ig.game.cloneObject(item.entity.pos);
                    item.entity.pos = posOverride;
                }

                this.handleItemState(item);
                this.handleItemTarget(item);
                this.handleItemSpecialMode(item);
                item.entity.update();
                
                if (retainPosition) {
                    item.entity.pos = posBefore;
                }
            }
        }
    },
    
    handleItemTarget: function(item, doInstantly, omitSorting) {
        if (item.targetX !== undefined && item.targetY !== undefined) {
            item.x = Math.floor( (item.x + item.targetX) / 2 );
            item.y = Math.floor( (item.y + item.targetY) / 2 );
            var pos1 = {x: item.x, y: item.y};
            var pos2 = {x: item.targetX, y: item.targetY};

            if (!doInstantly) { this.spawnDustAtItem(item); }

            if ( doInstantly || ml.Misc.getDistance(pos1, pos2) <= 2 ) {
                item.x = item.targetX;
                item.y = item.targetY;
                delete item.targetX;
                delete item.targetY;
                item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
                if (!omitSorting) {
                    this.sortItemsZIndex(this.movableItems);
                }
                if (item.originIsCloseToTargetAtStart) {
                    this.spawnImportantGoneOrPlacedDustAtItem(item);
                    item.originIsCloseToTargetAtStart = false;
                }
                else {
                    this.spawnDustAtItem(item);
                }
            }

            if (item.entity) {
                item.entity.pos.x = this.pos.x + item.x;
                item.entity.pos.y = this.pos.y + item.y;
                if (item.entity.adjustPosOffset) {
                    item.entity.adjustPosOffset();
                }
            }
        }
    },
    
    regenerateAllIsInOtherPrivateSection: function() {
        for (var i = 0; i < this.staticItems.length; i++) {
            var item = this.staticItems[i];
            item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
        }
        for (var i = 0; i < this.movableItems.length; i++) {
            var item = this.movableItems[i];
            item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
        }
    },

    handleItemState: function(item) {
        switch (item.base) {
            case 'DECOANIM':
                var showSecondCell = item.state == 2 || item.isInOtherPrivateSection;
                item.entity.currentAnim = item.entity.anims['cell' + (showSecondCell ? '2' : '1')];
                break;

            case 'DYNATHING':
                item.entity.multithingPrivate = Boolean(item.isInOtherPrivateSection);
                item.entity.multithingState = item.state;
                if (item.state == 0) {
                    item.entity.multithingStatePositiveNegative = 'neutral state';
                }
                else {
                    item.entity.multithingStatePositiveNegative = item.state > 0 ? 'positive state' : 'negative state';
                }
                item.entity.multithingStateEvenOdd = this.isNumberEven(item.state) ? 'even state' : 'odd state';
                break;
        }
    },

    isNumberEven: function(n) {
        return Boolean(n % 2 == 0);
    },
    
    keepItemPosInLimits: function(item) {
        var allowedMargin = Math.floor(item.entity.size.x / 2 - 1);
        item.x = (item.x).limit(-allowedMargin, this.size.x - item.entity.size.x + allowedMargin);
        item.y = (item.y).limit(-allowedMargin, this.size.y - item.entity.size.y + allowedMargin);
    },

    handleDraggingAndClicks: function() {
        if (this.draggedItem) {
            var item = this.draggedItem;
            item.x = Math.round(ig.input.mouse.x + this.draggedItemOffset.x);
            item.y = Math.round(ig.input.mouse.y + this.draggedItemOffset.y);
            this.keepItemPosInLimits(item);

            item.entity.pos.x = this.pos.x + item.x;
            item.entity.pos.y = this.pos.y + item.y;

            this.handleDraggedItemWiggling(item);
            
            if (item.entity.adjustPosOffset) { item.entity.adjustPosOffset(); }

            if ( ig.game.chance(5) ) { this.spawnDustAtItem(this.draggedItem); }
        }

        if ( ig.game.mouseManager.freshMouseRightClick() ) {
            ig.game.mouseManager.consumeMouseRightClick();
            if (this.draggedItem) {
                this.rotateOrFlipItem(this.draggedItem);
            }
            else if (!ig.game.isDraggingTilePlacement) {

                if (this.isEditingStatic || this.isEditingMovables) {
                    var items = this.isEditingStatic ? this.staticItems : this.movableItems;
                    var item = this.getClosestItemWithinMaxDistance(items);
                    if (item) {
                        this.openItemSettings(item);
                    }
                }
                else {
                    var item = this.getClosestItemWithinMaxDistance(this.movableItems);
                    if (!item) {
                        item = this.getClosestItemWithinMaxDistance(this.staticItems)
                    }
                    if (item) {
                        
                        ig.game.itemContextMenu.openForHolderOrDialogItem(
                                item.entity, item,
                                {x: this.pos.x + item.x, y: this.pos.y + item.y},
                                undefined, true
                                );
                    }
                }
                
            }
        }

        if ( ig.input.state('click') ) {
            if ( !this.mouseWasDown && this.mouseIsOver() ) {
                var checkOneClick = true;
                if (ig.game.readableDialog && ig.game.readableDialog.isOpen) {
                    ig.game.readableDialog.close();
                    checkOneClick = false;
                }
                else if (ig.game.writableDialog && ig.game.writableDialog.isOpen) {
                    ig.game.writableDialog.close();
                    checkOneClick = false;
                }
                
                this.startDragOrDeleteItemIfNeeded();
                if (checkOneClick && !this.draggedItem) {
                    this.checkOneClickStatics();
                }
                this.dragStartTimer = new ml.Timer();
                this.dragStartPos = this.getMousePos();
                this.mouseWasDown = true;
                
                if (ig.game.motionDialog) {
                    ig.game.motionDialog.checkAutoTrigger('multi activity');
                }
            }
        }
        else if (this.mouseWasDown) {
            if (this.draggedItem) {
                var item = this.draggedItem;
                var wasShortStillClick = this.dragStartPos &&
                        ml.Misc.getDistance( this.getMousePos(), this.dragStartPos ) <= 0 &&
                        this.dragStartTimer && this.dragStartTimer.delta() <= .3;

                var dataToSend = {id: item.localId};
                if (item.rotatable || item.flippable) {
                    dataToSend.rot = item.rot;
                }

                var itemItsOn = this.getItemThisIsOn(this.staticItems, item);
                var isOnRandomizer = itemItsOn && itemItsOn.attributes &&
                        itemItsOn.attributes.randomizer;

                if (wasShortStillClick && !isOnRandomizer) {
                    if ( item.state !== undefined &&
                            !( !this.isEditingStatic && !this.isEditingMovables &&
                               item.entity && item.entity.attributes &&
                               item.entity.attributes.noOneClickStateChange )
                            ) {
                        item.state++;
                        if (item.state > item.maxState) { item.state = item.minState; }
                        this.startItemSpecial(item);
                    }
                }
                else {
                    item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
                    if (isOnRandomizer) {
                        var seed = ig.game.getRandomInt(0, this.seedMax);
                        dataToSend.randomizerSeed = seed;
                        dataToSend.itemItsOnId = itemItsOn.localId;
                        this.triggerRandomization(itemItsOn.localId, seed);
                    }
                    this.handleDrop(item);
                }

                dataToSend.x = item.targetX !== undefined ? item.targetX : item.x;
                dataToSend.y = item.targetY !== undefined ? item.targetY : item.y;

                this.createActivityLine(ig.game.ourPlayer, item);

                if ( this.settings.neutralSectionsShuffle &&
                        this.settings.hasNeutralSections &&
                        this.getItemIsInSections(this.neutralSections, item) ) {
                    var seed = ig.game.getRandomInt(0, this.seedMax);
                    this.shuffleItemsInSections(this.neutralSections, seed);
                    dataToSend.shuffleSeed = seed;
                }
                else if (this.settings.participantSectionsShuffle &&
                        this.settings.hasParticipantSections) {
                    var index = this.getIndexOfSectionItemIsIn(this.participantSections, item);
                    if (index >= 0) {
                        var seed = ig.game.getRandomInt(0, this.seedMax);
                        this.shuffleItemsInSections([ this.participantSections[index] ], seed);
                        dataToSend.shuffleSeed = seed;
                        dataToSend.participantIndex = index;
                    }
                }

                dataToSend.state = item.state;
                if (item.flippable) { dataToSend.flip = item.flip; }

                ig.game.websocketComs.transmitMultithingActivity(
                        'itemChange', this.placementId, dataToSend);

                this.lastActiveItem = item;
                this.draggedItem = null;
            }
            else {
                var item = this.getClosestItemWithinMaxDistance(this.staticItems);
            }

            this.sortItemsZIndex(this.movableItems);
            this.dragStartTimer = null;
            this.dragStartPos = null;
            this.mouseWasDown = false;
        }
    },
    
    openItemSettings: function(item) {
        var html = '';
        var self = this;
        var doShowSmaller = false;
        var callback = function() { self.saveItemSettings(); }

        html += '<div class="multithingSettings">';

        if (this.isEditingStatic) {
            html += "<p>static items don't have settings</p>";
            doShowSmaller = true;
        }
        else if (this.isEditingMovables) {
            html += this.getInputHtml('wiggleSpeed', 'drag wiggle speed (0-100%)', item.wiggleSpeed, true);
            html += this.getInputHtml('wiggleDistance', 'drag wiggle distance (0-100%)', item.wiggleDistance, true);
        }

        html += '<input type="hidden" id="itemSettingsLocalId" value="' +
                ig.game.strings.htmlEscape(item.localId) + '"/>';
                
        html += '</div>';
        
        ig.game.alertDialog.open({html: html, callbackForOk: callback,
                doShowSmaller: doShowSmaller});
    },

    saveItemSettings: function() {
        if (this.isEditingMovables) {
            var localId = jQuery('#itemSettingsLocalId').val();
            if (localId) {
                var items = this.isEditingStatic ? this.staticItems : this.movableItems;
                var item = this.getItemByLocalId(items, localId);
                if (item) {
                    item.wiggleSpeed    = this.getValidPercentValue( jQuery('#wiggleSpeed').val() );
                    item.wiggleDistance = this.getValidPercentValue( jQuery('#wiggleDistance').val() );
                    if (!item.wiggleSpeed)    { delete item.wiggleSpeed; }
                    if (!item.wiggleDistance) { delete item.wiggleDistance; }
                    delete item.wiggle;
                    console.log('item now', item.wiggleSpeed, item.wiggleDistance );
                }
            }
        }
    },
    
    getValidPercentValue: function(v) {
        var validV = 0;
        if (typeof v === 'string') {
            v = ig.game.strings.replaceAll(v, '%', '');
            v = v.trim();
        }
        
        if ( v && ml.Misc.isNumber(v) ) {
            v = parseFloat(v);
            if (v < 0) { v = 0; }
            else if (v > 100) { v = 100; }
            validV = v;
        }
        console.log('validV', validV, typeof validV);
        return validV;
    },

    handleDraggedItemWiggling: function(item) {
        if (item.wiggle) {
            if (!item.wiggle.counterX) { item.wiggle.counterX = 1; }
            if (!item.wiggle.counterY) { item.wiggle.counterY = 1; }

            var speed = item.wiggle.speed / 200;
            var diversifier = .01;
            var frameRateMultiplier = (ig.system.tick * 60);
            item.wiggle.counterX += speed * frameRateMultiplier;
            item.wiggle.counterY += (speed + diversifier) * frameRateMultiplier;

            if ( ig.game.chance(50) ) { item.wiggle.counterX + .02; }
            if ( ig.game.chance(50) ) { item.wiggle.counterY + .02; }
            
            if (item.wiggle.counterX >= 1000000) { item.wiggle.counterX = 1; }
            if (item.wiggle.counterY >= 1000000) { item.wiggle.counterY = 1; }

            var pos = item.entity.pos;        
            pos.x += Math.cos(item.wiggle.counterX) * (item.wiggle.distance / 2);
            pos.y += Math.cos(item.wiggle.counterY) * (item.wiggle.distance / 2);
        }
    },

    handleDrop: function(item) {
        if ( this.isInSnapToGridRect(item) ) {
            item.targetX = Math.round(item.x / ig.game.tileSize) * ig.game.tileSize;
            item.targetY = Math.round(item.y / ig.game.tileSize) * ig.game.tileSize;
        }
        else if (item.wiggle) {
            delete item.wiggle;
            item.x = Math.round(item.entity.pos.x - this.pos.x);
            item.y = Math.round(item.entity.pos.y - this.pos.y);
            this.keepItemPosInLimits(item);
            item.entity.pos.x = this.pos.x + item.x;
            item.entity.pos.y = this.pos.y + item.y;
            if (item.entity.adjustPosOffset) { item.entity.adjustPosOffset(); }
        }
        
        if (item.entity) {
            var didPlay = false;
            if (item.base == 'DECOANIM') {
                var ignoreDistanceCheck = true;
                var ignoreDelayCheck = true;
                didPlay = ig.game.sounds.playIncludedSound(item.entity,
                        undefined, undefined, ignoreDistanceCheck, ignoreDelayCheck);
            }

            if (!didPlay) {
                ig.game.sounds.playWithVol(ig.game.sounds.shortWhoosh, .35);
            }
        }

        this.startItemSpecial(item);

        if (this.draggedItemStartPos) {
            var distance = ml.Misc.getDistance(
                    {x: this.draggedItemStartPos.x, y: this.draggedItemStartPos.y},
                    {x: item.x, y: item.y} );
            if (distance >= this.moveDistanceConsideredImportantForDust) {
                this.spawnImportantGoneOrPlacedDustAtItem(item);
            }
            else {
                this.spawnDustAtItem(item);
            }
            this.draggedItemStartPos = null;
        }
    },
    
    startItemSpecial: function(item) {
        if (item.entity) {
            switch (item.base) {
                case 'DYNATHING':
                    item.entity.multithingMoved = true;
                    break;

                case 'STACKWEARB':
                    if (this.settings.livelyBodies) {
                        item.entity.currentAnim = item.entity.anims.run;
                        item.entity.currentAnim.flip.x = Boolean(item.flip);
                        item.specialModeTimer = new ml.Timer();
                    }
                    break;
            }
        }
    },
    
    isInSnapToGridRect: function(item) {
        var isIn = false;
        if ( this.settings.snapToGridRect.x !== null &&
             this.settings.snapToGridRect.y !== null ) {
            var absoluteRect = this.multiplyRectBy(this.settings.snapToGridRect,
                    ig.game.tileSize);
            isIn = this.pointIsInRect( {x: item.x, y: item.y}, absoluteRect );
        }
        return isIn;
    },
    
    multiplyRectBy: function(rect, value) {
        return {x: rect.x * value, y: rect.y * value,
                width: rect.width * value, height: rect.height * value};
    },
    
    pointIsInRect: function(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    },
    
    handleItemSpecialMode: function(item) {
        if ( item.specialModeTimer && item.specialModeTimer.delta() >= .35 ) {
            if (item.entity) {
                switch (item.base) {
                    case 'STACKWEARB':
                        item.entity.currentAnim = item.entity.anims.main;
                        item.entity.currentAnim.flip.x = Boolean(item.flip);
                        break;
                }
            }
        }
    },

    getItemIsInSections: function(sections, item) {
        var isIt = false;
        for (var i = 0; i < sections.length; i++) {
            if ( this.isItemInRect(sections[i], item) ) {
                isIt = true;
                break;
            }
        }
        return isIt;
    },
    
    getIndexOfSectionItemIsIn: function(sections, item) {
        var index = -1;
        for (var i = 0; i < sections.length; i++) {
            if ( this.isItemInRect(sections[i], item) ) {
                index = i;
                break;
            }
        }
        return index;
    },
    
    shuffleItemsInSections: function(sections, seed) {
        ig.game.seedableRandom.setSeed(seed);
        this.haveAllItemsReachTarget();
        this.sortItemsByLocalId(this.movableItems);

        var maxSwaps = ig.game.seedableRandom.getRandomInt(49, 50);

        for (var sectionI = 0; sectionI < sections.length; sectionI++) {
            var rect = sections[sectionI];
            var itemsInRect = this.getItemsInRect(rect);
            if ( itemsInRect.length >= 2 && this.allItemsReachedTarget() ) {
                var self = this;
                for (var i = 1; i <= maxSwaps; i++) {
                    var indexA = ig.game.seedableRandom.getRandomInt(0, itemsInRect.length - 1);
                    var indexB = ig.game.seedableRandom.getRandomInt(0, itemsInRect.length - 1);
                    if (indexA == indexB) { indexA = 0; indexB = itemsInRect.length - 1; }

                    var itemA = itemsInRect[indexA];
                    var itemB = itemsInRect[indexB];

                    itemA = itemsInRect[indexA];
                    itemB = itemsInRect[indexB];
                    
                    itemA.targetX = itemB.x;
                    itemA.targetY = itemB.y;
                    
                    itemB.targetX = itemA.x;
                    itemB.targetY = itemA.y;

                    if (i != maxSwaps) {
                        this.handleItemTarget(itemA, true, true);
                        this.handleItemTarget(itemB, true, true);
                    }
                }
            }
        }
        
        this.sortItemsZIndex(this.movableItems);
    },
    
    allItemsReachedTarget: function() {
        var allReached = true;
        for (var i = 0; i < this.movableItems.length; i++) {
            var item = this.movableItems[i];
            if (item.targetX !== undefined || item.targetY !== undefined) {
                allReached = false;
                break;
            }
        }
        return allReached;
    },

    getItemsInRect: function(rect) {
        var itemsInRect = [];
        for (var i = 0; i < this.movableItems.length; i++) {
            if ( this.isItemInRect(rect, this.movableItems[i]) ) {
                itemsInRect.push(this.movableItems[i]);
            }
        }
        return itemsInRect;
    },
    
    isItemInRect: function(rect, item) {
        var isIn = false;
        if (item.entity) {
            var point = {
                    x: item.x + item.entity.size.x / 2,
                    y: item.y + item.entity.size.y / 2
                    };
            isIn = point.x >= rect.x &&
                       point.x <= rect.x + rect.width &&
                       point.y >= rect.y &&
                       point.y <= rect.y + rect.height;
        }
        return isIn;
    },
    
    getItemThisIsOn: function(items, droppedItem) {
        var itemThisIsOn;
        if (droppedItem.entity) {
            var point = {
                    x: droppedItem.entity.pos.x + droppedItem.entity.size.x / 2,
                    y: droppedItem.entity.pos.y + droppedItem.entity.size.y / 2
                    };

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.entity) {
                    var isOn = point.x >= item.entity.pos.x &&
                               point.x <= item.entity.pos.x + item.entity.size.x &&
                               point.y >= item.entity.pos.y &&
                               point.y <= item.entity.pos.y + item.entity.size.y;
                    if (isOn) {
                        itemThisIsOn = item;
                        break;
                    }
                }
            }
        }
        return itemThisIsOn;
    },

    triggerRandomization: function(randomizerId, seed) {
        ig.game.seedableRandom.setSeed(seed);

        var randomizer = this.getItemByLocalId(this.staticItems, randomizerId);
        this.randomizeItemsOnThisRandomizer(randomizer);

        if (randomizer.entity) {
            if (    randomizer.entity.currentMode == 'randomize' ||
                    randomizer.entity.currentMode == 'private randomize') {
                randomizer.entity.reset(true);
            }
            else {
                randomizer.entity.multithingRandomize = true;
            }
        }
    },
    
    triggerRandomizationOfStaticItem: function(item, seed) {
        ig.game.seedableRandom.setSeed(seed);

        var randomizer = this.getItemByLocalId(this.staticItems, randomizerId);
        this.randomizeItemsOnThisRandomizer(randomizer);

        if (randomizer.entity) {
            if (randomizer.entity.currentMode == 'randomize') {
                randomizer.entity.reset(true);
            }
            else {
                randomizer.entity.multithingRandomize = true;
            }
        }
    },

    randomizeItemsOnThisRandomizer: function(randomizerItem) {
        var randomizerEntity = randomizerItem.entity;
        this.sortItemsByLocalId(this.movableItems);

        for (var i = 0; i < this.movableItems.length; i++) {
            var item = this.movableItems[i];
            if (item.entity) {
                var point = {
                        x: item.entity.pos.x + item.entity.size.x / 2,
                        y: item.entity.pos.y + item.entity.size.y / 2
                        };

                var isOn = point.x >= randomizerEntity.pos.x &&
                           point.x <= randomizerEntity.pos.x + randomizerEntity.size.x &&
                           point.y >= randomizerEntity.pos.y &&
                           point.y <= randomizerEntity.pos.y + randomizerEntity.size.y;
                if (isOn) {
                    this.doRandomizeItem(item);
                }
            }
        }
        
        this.sortItemsZIndex(this.movableItems);
    },
    
    doRandomizeItem: function(item) {
        if (item.entity) {
            item.state = ig.game.seedableRandom.getRandomInt(item.minState, item.maxState);
            if (item.entity.currentMode == 'randomize') {
                item.entity.reset(true);
            }
            else {
                item.entity.multithingRandomize = true;
            }
            this.spawnDustAtItem(item, true);
            this.spawnDustAtItem(item, false, 6, 3);
        }
    },
    
    spawnDustAtItem: function(item, isBig, randomization, repeats, offX, offY) {
        if (this.showDustTrails && item.entity) {
            if (repeats === undefined) { repeats = 1; }
            for (var i = 1; i <= repeats; i++) {
                var randomX = 0;
                var randomY = 0;
                if (randomization > 0) {
                    randomX = ig.game.getRandomInt(-randomization, randomization);
                    randomY = ig.game.getRandomInt(-randomization, randomization);
                }
                if (offX === undefined) { offX = 0; }
                if (offY === undefined) { offY = 0; }
                
                var decay = isBig ? 1.25 : 2;
                ig.game.spawnEntity(isBig ? EntityBigDust : EntityDust,
                        Math.floor(this.pos.x + item.x + item.entity.size.x / 2 + randomX + offX),
                        Math.floor(this.pos.y + item.y + item.entity.size.y / 2 + randomY + offY),
                        {uiEntity: true, drawLighter: true, decay: decay});
            }
        }
    },
    
    sortItemsZIndex: function(items) {
        items.sort(
            function(a, b) {
                var sortI = 0;
                if      (a.y > b.y)   { sortI =  1; }
                else if (a.y < b.y)   { sortI = -1; }
                else if (a.x > b.x)   { sortI =  1; }
                else if (a.x < b.x)   { sortI = -1; }
                else if (a.localId < b.localId) { sortI =  1; }
                else                  { sortI = -1; }
                return sortI;
            }
        );
    },
    
    sortItemsByLocalId: function(items) {
        items.sort(
            function(a, b) {
                var sortI = 0;
                if      (a.localId > b.localId) { sortI =  1; }
                else if (a.localId < b.localId) { sortI = -1; }
                return sortI;
            }
        );
    },
    
    getMousePos: function() {
        return {x: ig.input.mouse.x, y: ig.input.mouse.y};
    },

    getIsInOtherPrivateSection: function(item) {
        return this.getIsInPrivateSection(item, true);
    },

    getIsInPrivateSection: function(item, excludeIfOwn) {
        var privateSections = [];
        if (this.settings.hasNeutralSections) {
            for (var i = 0; i < this.neutralSections.length; i++) {
                privateSections.push(this.neutralSections[i]);
            }
        }
        if (this.settings.hasParticipantSections) {
            for (var i = 0; i < this.participantSections.length; i++) {
                var doConsider = true;
                if (excludeIfOwn) {
                    doConsider = !this.participants[ig.game.ourPlayer.remoteId] ||
                                 i !== this.participants[ig.game.ourPlayer.remoteId].index;
                 }
                if (doConsider) {
                    privateSections.push(this.participantSections[i]);
                }
            }
        }

        var entity = item.entity;
        var x = item.targetX !== undefined ? item.targetX : item.x;
        var y = item.targetY !== undefined ? item.targetY : item.y;
        var point;
        if (item.entity) {
            point = {x: x + entity.size.x / 2, y: y + entity.size.y / 2};
        }
        else {
            point = {x: x + ig.game.tileSizeHalf, y: y + ig.game.tileSizeHalf};
        }
        
        return this.getPointIsInSections(privateSections, point);
    },
    
    getIsInOurSection: function(item) {
        var isIt = false;
        if (this.participants[ig.game.ourPlayer.remoteId]) {
            var privateSections = [];
            for (var i = 0; i < this.participantSections.length; i++) {
                if (i == this.participants[ig.game.ourPlayer.remoteId].index) {
                    privateSections.push(this.participantSections[i]);
                }
            }

            var entity = item.entity;
            var x = item.targetX !== undefined ? item.targetX : item.x;
            var y = item.targetY !== undefined ? item.targetY : item.y;
            var point = {x: x + entity.size.x / 2, y: y + entity.size.y / 2};
            isIt = this.getPointIsInSections(privateSections, point);
        }
        return isIt;
    },

    getPointIsInSections: function(sections, point) {
        var isIn = false;
        for (var i = 0; i < sections.length; i++) {
            var rect = sections[i];
            isIn = point.x >= rect.x && point.x <= rect.x + rect.width &&
                   point.y >= rect.y && point.y <= rect.y + rect.height;
            if (isIn) { break; }
        }
        return isIn;
    },
    
    getPosSnappedToScale: function(pos) {
        return { x: Math.floor(pos.x / ig.system.scale) * ig.system.scale,
                 y: Math.floor(pos.y / ig.system.scale) * ig.system.scale
               };
    },
    
    startDragOrDeleteItemIfNeeded: function() {
        if ( (this.isEditingStatic || this.isEditingMovables ||
                this.participants[ig.game.ourPlayer.remoteId] ) &&
                !(ig.game.isDraggingTilePlacement || ig.game.isPainting) ) {
            var items = this.isEditingStatic ? this.staticItems : this.movableItems;
            var item = this.getClosestItemWithinMaxDistance(items);
            if (item) {
                if ( ig.input.state('ctrl') ) {
                    if (this.isEditingStatic || this.isEditingMovables) {
                        this.deleteItem(item.localId);
                    }
                    else if (this.weAreCreator) {
                        this.openMenuAndMentionEditMode();
                    }
                }
                else {
                    this.draggedItem = item;
                    this.draggedItemStartPos = {x: item.x, y: item.y};
                    this.draggedItemOffset = {
                            x: item.x - ig.input.mouse.x,
                            y: item.y - ig.input.mouse.y};
                    if ( !(this.isEditingStatic || this.isEditingMovables) ) {
                        ig.game.sounds.playIncludedSound(this.draggedItem.entity);
                    }

                    if (item.wiggleSpeed && item.wiggleDistance) {
                        item.wiggle = {
                                speed: item.wiggleSpeed,
                                distance: item.wiggleDistance
                                };
                    }
                    this.spawnDustAtItem(item, true);
                    ig.game.sounds.shortWhoosh.play();
                    
                    this.addToEditHistory({
                        action: 'startMove',
                        localId: item.localId,
                        x: item.x, y: item.y,
                        rot: item.rot,
                        flip: item.flip
                        });
                }
            }
        }
    },
    
    addToEditHistory: function(data) {
        if ( this.editHistoryRecordingActive &&
                (this.isEditingStatic || this.isEditingMovables) ) {
            this.editHistory.push(data);
            if (this.editHistory.length > this.editHistorMax) {
                this.editHistory.shift();
            }
        }
    },
    
    spawnImportantGoneOrPlacedDustAtItem: function(item) {
        this.spawnDustAtItem( item, true, 8, ig.game.getRandomInt(2, 3) );
    },
    
    checkOneClickStatics: function() {
        if ( !(this.isEditingStatic || this.isEditingMovables) ) {
            var item = this.getClosestItemWithinMaxDistance(this.staticItems);
            if (item) {
                switch (item.base) {
                    case 'READABLE': this.handleOneClickOnReadable(item); break;
                    case 'WRITABLE': this.handleOneClickOnWritable(item); break;
                    case 'MEDIUM': this.handleOneClickOnMedium(item); break;
                    case 'DYNATHING': this.handleOneClickOnDynathing(item); break;
                }
            }
        }
    },
    
    handleOneClickOnDynathing: function(item) {
        if ( item && item.attributes && item.attributes.randomizer &&
                item.state !== undefined ) {
            var dataToSend = {id: item.localId};

            var seed = ig.game.getRandomInt(0, this.seedMax);
            dataToSend.randomizerSeed = seed;
            ig.game.seedableRandom.setSeed(seed);
            this.doRandomizeItem(item);

            ig.game.websocketComs.transmitMultithingActivity(
                    'itemChange', this.placementId, dataToSend);
                        
        }
    },
    
    handleOneClickOnWritable: function(item) {
        if (ig.game.writableDialog && ig.game.writableDialog.isOpen) {
            ig.game.writableDialog.close();
        }
        else {
            ig.game.itemsManager.triggerItemDefaultBehaviorOnSelection(
                    item.id, true);
        }
    },
    
    handleOneClickOnMedium: function(item) {
        if (ig.game.mediaDialog && ig.game.mediaDialog.isActive) {
            ig.game.mediaDialog.removeWidget();
        }
        else {
            ig.game.itemsManager.triggerItemDefaultBehaviorOnSelection(
                    item.id, true);
        }
    },
    
    handleOneClickOnReadable: function(item) {
        if (ig.game.readableDialog && ig.game.readableDialog.isOpen) {
            ig.game.readableDialog.close();
        }
        else {
            if ( !this.getIsInOtherPrivateSection(item) ) {
            
                if ( this.getIsInOurSection(item) ) {
                    var self = this;
                    var localId = item.localId;
                    ig.game.itemCache.getItem_P(item.id, 'multi').done(function(thisItem){
                        var style = 'width: 90%;';
                        var html = '';
                        if ( !(item.attributes && item.attributes.sansSerifFont) ) {
                            style += 'text-transform: uppercase;';
                        }

                        if (self.locallyEditableTexts[localId] === undefined) {
                            self.locallyEditableTexts[localId] = thisItem.textData;
                        }

                        html += '<textarea id="locallyEditableText" style="' + style + '">';
                        html += ig.game.strings.htmlEscape(self.locallyEditableTexts[localId]);
                        html += '</textarea>';
                        var callback = function() {
                            self.locallyEditableTexts[localId] = jQuery('#locallyEditableText').val();
                        }
                        ig.game.alertDialog.open({html: html, useCloseButton: true, callbackForOk: callback});
                        jQuery('#locallyEditableText').css('height', (ig.game.alertDialog.size.y - 50) + 'px');
                    });
                    
                }
                else {
                    ig.game.itemsManager.triggerItemDefaultBehaviorOnSelection(
                            item.id, true);
                            
                }

            }
        }
    },
    
    deleteItem: function(localId) {
        for (var staticMovableI = 0; staticMovableI <= 1; staticMovableI++) {
            var items = staticMovableI == 0 ? this.staticItems : this.movableItems;
            for (var i = 0; i < items.length; i++) {
                if (items[i].localId == localId) {
                    var item = items[i];
                    this.addToEditHistory({
                        action: 'delete',
                        id: item.id,
                        x: item.x, y: item.y,
                        rot: item.rot,
                        flip: item.flip
                        });
                    items.splice(i, 1);
                    ig.game.sounds.bin.play();
                    break;
                }
            }
        }
    },
    
    getClosestItemWithinMaxDistance: function(items) {
        var maxDistance = ig.game.tileSize;
        var cursorEntity = {}
        cursorEntity.pos = {x: ig.input.mouse.x, y: ig.input.mouse.y};
        cursorEntity.size = {x: 0, y: 0};
        cursorEntity.pos = this.getPosSnappedToScale(cursorEntity.pos);
        var bestDistance = null;
        var closestItem = null;
        
        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            if (item.entity) {
                var distance = item.entity.distanceTo(cursorEntity);
                if ( distance <= maxDistance && (bestDistance === null || distance < bestDistance) ) {
                    bestDistance = distance;
                    closestItem = item;
                }
            }
        }
        
        return closestItem;
    },
    
    draw: function() {
        if (this.isOpen) {
            this.drawWallpaper();
            if (this.settings.hasNeutralSections) {
                this.drawSections(this.neutralSections);
            }
            if (this.settings.hasParticipantSections) {
                this.drawSections(this.participantSections, true);
            }
            
            var originalOffset = this.clearScreenOffset();
            
            this.drawGridIfNeeded();
            this.drawItems(this.staticItems);

            if (this.settings.hasParticipantSections) {
                this.drawSections(this.participantSections, true, true);
            }
            
            if (!this.waitingForChangesSinceStartTimer) {
                this.drawItems(this.movableItems);
            }

            this.drawItems(this.staticItems, true);

            if (!this.waitingForChangesSinceStartTimer) {
                this.drawItems(this.movableItems, true);
            }

            this.setScreenOffset(originalOffset);
            
            this.drawEditingIndicator();
            this.drawMenuLabel();
            this.drawMenuEntries();
        }
    },
    
    drawLine: function(x1, y1, x2, y2) {
        var context = ig.system.context;
        context.beginPath();
        context.moveTo(x1 * ig.system.scale, y1 * ig.system.scale);
        context.lineTo(x2 * ig.system.scale, y2 * ig.system.scale);
        context.stroke();
    },
    
    drawGridIfNeeded: function() {
        if (this.showGrid) {
            var context = ig.system.context;
            context.strokeStyle = 'rgba(255,255,255,.15)';
            context.lineWidth = ig.system.scale;
            ml.Misc.setDrawMode('lighten');
            
            for (var y = ig.game.tileSize; y < this.size.y; y += ig.game.tileSize) {
                var x1 = this.pos.x;
                var y1 = this.pos.y + y;
                var x2 = x1 + this.size.x;
                var y2 = y1;
                this.drawLine(x1, y1, x2, y2);
            }
            
            for (var x = ig.game.tileSize; x < this.size.x; x += ig.game.tileSize) {
                var x1 = this.pos.x + x;
                var y1 = this.pos.y;
                var x2 = x1;
                var y2 = y1 + this.size.y;
                this.drawLine(x1, y1, x2, y2);
            }
            
            var neutralSections = this.getDefaultNeutralSections();
            var neutralRect = neutralSections[0];
            var rect = {
                    x: this.pos.x + neutralRect.x,
                    y: this.pos.y + this.size.y - neutralRect.width - neutralRect.y,
                    width: neutralRect.width,
                    height: neutralRect.width
                    };
            context.fillStyle = 'rgba(255,255,255,.1)';
            ml.Misc.drawRectWithChamferedEdges(rect, 0);
            
            var squareSize = ig.game.tileSize * 8;
            rect = {
                    x: this.pos.x + this.size.x / 2 - squareSize / 2,
                    y: this.pos.y + this.size.y / 2 - squareSize / 2,
                    width: squareSize,
                    height: squareSize
                    };
            
            context.strokeStyle = 'rgba(255,255,255,.3)';
            ml.Misc.drawRectWithChamferedEdges(rect, 0, true);
            
            ml.Misc.resetDrawMode();
        }
    },
    
    drawEditingIndicator: function() {
        if (this.isEditingStatic || this.isEditingMovables) {
            ig.system.context.line = ig.system.scale;
            var rect = {x: this.pos.x, y: this.pos.y,
                    width: this.size.x, height: this.size.y
                    };

            var margin = 1;
            var brightRect = {x: rect.x - margin, y: rect.y - margin,
                    width: rect.width + margin * 2, height: rect.height + margin * 2};
            
            ig.system.context.strokeStyle = 'rgba(255,255,255,.5)';
            ml.Misc.setDrawMode('lighten');
            ml.Misc.drawRectWithChamferedEdges(brightRect, 0, true);

            margin = 2;
            var darkRect = {x: rect.x - margin, y: rect.y - margin,
                    width: rect.width + margin * 2, height: rect.height + margin * 2};
            ig.system.context.strokeStyle = 'rgba(0,0,0,.5)';
            ml.Misc.setDrawMode('darken');
            ml.Misc.drawRectWithChamferedEdges(darkRect, 0, true);
            
            ml.Misc.resetDrawMode();
        }
    },
    
    drawMenuLabel: function() {
        var entity = this.sourceEntity;
        if (entity && this.menuLabelClickText) {
            var offsetXtoAlignAsCombo = -6;
            this.menuLabelClickText.pos.x = entity.pos.x - ig.game._rscreen.x -
                    this.menuLabelClickText.size.x / 2 + 10 + offsetXtoAlignAsCombo;
            this.menuLabelClickText.pos.y = entity.pos.y - ig.game._rscreen.y + 23;

            this.menuCloseClickText.pos.x = this.menuLabelClickText.pos.x +
                    this.menuLabelClickText.size.x + 8;
            this.menuCloseClickText.pos.y = this.menuLabelClickText.pos.y;
            
            this.menuLabelClickText.draw();
            this.menuCloseClickText.draw();
            
            if (this.saveClickText) {
                this.saveClickText.pos.x = this.menuLabelClickText.pos.x +
                        this.menuLabelClickText.size.x + 28;
                this.saveClickText.pos.y = this.menuLabelClickText.pos.y;
                var marginX = 3;
                var marginY = 1;
                var rect = {
                        x: this.saveClickText.pos.x - marginX,
                        y: this.saveClickText.pos.y - marginY,
                        width: this.saveClickText.size.x + marginX * 2,
                        height: this.saveClickText.size.y + marginY * 2
                };

                ig.system.context.fillStyle = 'rgba(0,100,0,.5)';
                ml.Misc.setDrawMode('darken');
                ml.Misc.drawRectWithChamferedEdges(rect);
                ml.Misc.resetDrawMode();

                this.saveClickText.draw();
            }
        }
    },
    
    drawMenuEntries: function() {
        var entity = this.sourceEntity;
        if (this.menuIsOpen && entity && this.clickSpotMenuEntries) {
            var textOffset = {x: 5, y: 5};
            var max = this.clickSpotMenuEntries.length;
            for (var i = 0; i < max; i++) {
                var entry = this.clickSpotMenuEntries[i];
                var spriteSheetName = 'bottomMenuMore';
                if (i == 0)            { spriteSheetName += 'Top'; }
                else if (i == max - 1) { spriteSheetName += 'Bottom'; }
                else                   { spriteSheetName += 'Middle'; }

                ig.game.spriteSheet.draw(entry.pos.x, entry.pos.y, .8,
                        ig.game.spriteSheet[spriteSheetName]);

                if (entry.icon) {
                    ig.game.spriteSheet.draw(entry.pos.x + 4, entry.pos.y + 3, .7,
                            ig.game.spriteSheet[entry.icon]);
                }

                ig.system.context.globalAlpha = .7;
                ig.game.blackFont.draw(
                        this.menuEntries[i].label,
                        entry.pos.x + textOffset.x + (entry.icon ? 10 : 0),
                        entry.pos.y + textOffset.y
                        );
                ig.system.context.globalAlpha = 1;
            }
        }
    },
    
    clearScreenOffset: function() {
        var originalOffset = {x: ig.game._rscreen.x, y: ig.game._rscreen.y};
        ig.game._rscreen.x = 0;
        ig.game._rscreen.y = 0;
        return originalOffset;
    },
    
    setScreenOffset: function(offset) {
        ig.game._rscreen.x = offset.x;
        ig.game._rscreen.y = offset.y;
    },
    
    drawItems: function(items, isFrontLayer) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.entity) {
                
                if (item.base == 'DECOFB') {
                    if (isFrontLayer) { item.entity.drawFront(); }
                    else              { item.entity.draw(); }
                }
                else if (item.base == 'LIQUID') {
                    item.entity.draw(isFrontLayer);
                }
                else {
                    var isInFront = item.base == 'DECOFG' ||
                            (item.attributes && item.attributes.inFront);
                    if ( (isInFront && isFrontLayer) ||
                         (!isInFront && !isFrontLayer) ) {
                        item.entity.draw();
                    }
                }
                
            }
        }
    },
    
    drawWallpaper: function() {
        if (this.settings.wallpaperOpacity > 0) {
            var defaultOpacity = 1;
            if (this.settings.wallpaperOpacity != defaultOpacity) {
                ig.system.context.globalAlpha = parseFloat(this.settings.wallpaperOpacity);
            }
        
            for (var y = 0; y < this.size.y; y += ig.game.tileSizeBig) {
                for (var x = 0; x < this.size.x; x += ig.game.tileSizeBig) {
                    this.sourceEntity.anims.back.draw(this.pos.x + x, this.pos.y + y);
                }
            }
            
            if (this.settings.wallpaperOpacity != defaultOpacity) {
                ig.system.context.globalAlpha = defaultOpacity;
            }
        }
    },

    drawSections: function(sections, areParticipantSections, isLabelRound) {
        ig.system.context.fillStyle = 'rgba(0,0,0,.2)';

        for (var i = 0; i < sections.length; i++) {
            var rect = ig.game.cloneObject(sections[i]);
            rect.x += this.pos.x;
            rect.y += this.pos.y;

            if (this.settings.markSections && !isLabelRound) {
                ml.Misc.setDrawMode('darken');
                ml.Misc.drawRectWithChamferedEdges(rect);
                ml.Misc.resetDrawMode();
            }

            if (areParticipantSections && isLabelRound) {
                var nameAlpha = this.settings.participantValueAtStart !== undefined ?
                        .5 : .25;

                var participant = this.getParticipantByIndex(i);
                var label = null;
                if (participant) {
                    if (participant.entity) {
                        var label = participant.entity.isOurPlayer ?
                                'me' : participant.entity.screenName;

                        if (this.settings.participantValueAtStart !== undefined) {
                            if (participant.value === undefined) {
                                participant.value = parseFloat(this.settings.participantValueAtStart);
                            }
                            var valuePrefix = this.settings.participantValuePrefix ?
                                    this.settings.participantValuePrefix : '';
                            label += ': ' + String(valuePrefix) +
                                    ig.game.strings.toCommaNumber(participant.value);
                        }
                    }
                }
                else if ( areParticipantSections &&
                        (this.isEditingStatic || this.isEditingMovables || this.isEditingSettings) ) {
                    label = 'participant ' + (i + 1);
                }

                if (label) {
                    var centerX = rect.x + rect.width / 2;
                    var centerY = rect.y + rect.height - 10;
                    ig.system.context.globalAlpha = nameAlpha;
                    ig.game[this.settings.fontName + 'Font'].draw(
                            label, centerX, centerY,
                            ig.Font.ALIGN.CENTER);
                    ig.system.context.globalAlpha = 1;
                    
                    if (participant && label != participant.lastLabelShown) {
                        participant.lastLabelShown = label;
                        var margin = 15;
                        for (var offX = -margin; offX <= margin; offX += 5) {
                            ig.game.decorator.addSparkle(
                                    centerX + offX,
                                    centerY + ig.game.getRandomInt(-4, 5),
                                    true);
                        }
                    }
                }
            }

        }
    },
    
    getParticipantByIndex: function(index) {
        var participant;
        for (var remoteId in this.participants) {
            if (this.participants[remoteId].index == index) {
                participant = this.participants[remoteId];
                break;
            }
        }
        return participant;
    },

    receiveRemoteData: function(originator, mode, placementId, data) {
        if (!this.lockReceivedRemoteDataQueue) {
            this.receivedRemoteDataQueue.push({mode: mode, data: data, originator: originator});
        }
        else {
            var self = this;
            setTimeout(
                    function() {
                        self.receivedRemoteDataQueue.push({mode: mode, data: data})
                    },
                    100 );
        }
    },

    applyReceivedRemoteData: function() {
        if (this.allEntitiesLoaded) {
            this.lockReceivedRemoteDataQueue = true;
            if (this.receivedRemoteDataQueue.length >= 1) {
                this.haveAllItemsReachTarget();
            }

            for (var i = 0; i < this.receivedRemoteDataQueue.length; i++) {
                var mode = this.receivedRemoteDataQueue[i].mode;
                var data = this.receivedRemoteDataQueue[i].data;
                var originator = this.receivedRemoteDataQueue[i].originator;
                switch (mode) {
                    case 'itemChange':
                        this.changeItemBasedOnRemoteData(data, originator);
                        break;
                        
                    case 'changesSinceStart':
                        if (this.waitingForChangesSinceStartTimer) {
                            var setupEditedByCreatorInMeantime =
                                    this.hashOfFullSetupAtStart != data.hashOfFullSetupAtStart;
                            if (setupEditedByCreatorInMeantime) {
                                ig.game.ourPlayer.say('i need to wait until next time');
                                this.close();
                            }
                            else {
                                if (data.itemChanges) {
                                    if (data.itemChanges.staticItems) {
                                        for (var i = 0; i < data.itemChanges.staticItems.length; i++) {
                                            this.changeItemBasedOnRemoteData(
                                                    data.itemChanges.staticItems[i], originator, true);
                                        }
                                    }
                                    if (data.itemChanges.movableItems) {
                                        for (var i = 0; i < data.itemChanges.movableItems.length; i++) {
                                            this.changeItemBasedOnRemoteData(
                                                    data.itemChanges.movableItems[i], originator, true);
                                        }
                                    }
                                    this.haveAllItemsReachTarget();
                                }
                                if (data.participants) {
                                    this.participants = ig.game.cloneObject(data.participants);
                                    this.expandParticipantEntities();
                                }
                                this.waitingForChangesSinceStartTimer = null;
                            }
                        }
                        break;

                    case 'askMasterForChangesSinceStart':
                        if ( this.getWeAreMaster() ) {
                            var data = { itemChanges: {} };
                            data.itemChanges.movableItems = this.getItemChangesSinceStart(
                                    this.movableItemsAtStart, this.movableItems);
                            data.itemChanges.staticItems = this.getItemChangesSinceStart(
                                    this.staticItemsAtStart, this.staticItems);
                            
                            data.participants = this.getParticipantsForTransmission();
                            data.hashOfFullSetupAtStart = this.hashOfFullSetupAtStart;
                            ig.game.websocketComs.transmitMultithingActivity(
                                    'changesSinceStart', this.placementId, data);
                        }
                        break;

                    case 'addParticipant':
                        if (data.userId) {
                            var user = ml.Misc.getUserByRemoteId(data.userId);
                            if (user) {
                                this.addParticipant(user);
                                if (user.isOurPlayer) {
                                    ig.game.speechManager.sayFullTextAtOnce('i was added to ' + this.name);
                                }
                                ig.game.sounds.success.play();
                            }
                        }
                        break;

                    case 'removeParticipant':
                        if (data.userId) {
                            var user = ml.Misc.getUserByRemoteId(data.userId);
                            this.removeParticipant(user);
                            if (data.remoteId == this.isOurPlayer) {
                                ig.game.speechManager.sayFullTextAtOnce('i was removed from ' + this.name);
                            }
                            ig.game.sounds.pickup.play();
                        }
                        break;

                    case 'participantValueChange':
                        if (!this.waitingForChangesSinceStartTimer &&
                                data.userId && data.value !== undefined) {
                            var participant = this.participants[data.userId];
                            if (participant) {
                                var oldValue = participant.value;
                                participant.value = parseFloat(data.value);
                                this.playParticipantValueChangeSound(
                                        oldValue, participant.value);
                            }
                        }
                        break;
                        
                    case 'resetParticipantValues':
                        if (!this.waitingForChangesSinceStartTimer) {
                            this.resetParticipantValues();
                        }
                        break;

                    case 'restart':
                        this.allEntitiesLoaded = false;
                        this.locallyEditableTexts = {};
                        this.loadSetup();
                        ig.game.sounds.whoosh.play();
                        break;
                }
            }
            this.receivedRemoteDataQueue = [];
            this.lockReceivedRemoteDataQueue = false;
        }
    },

    getParticipantsForTransmission: function() {
        var participants = {};
        for (var remoteId in this.participants) {
            var participant = this.participants[remoteId];
            participants[remoteId] = {index: participant.index};
            if (participant.value !== undefined) {
                participants[remoteId].value = participant.value;
            }
        }
        return participants;
    },

    haveAllItemsReachTarget: function() {
        for (var i = 0; i < this.movableItems.length; i++) {
            this.handleItemTarget(this.movableItems[i], true);
        }
    },

    changeItemBasedOnRemoteData: function(data, originator, doSilently) {
        var item = this.getItemByLocalId(this.movableItems, data.id);
        if (!item) { item = this.getItemByLocalId(this.staticItems, data.id); }

        if (item) {
            if (!doSilently) {
                if (data.x !== undefined && data.x !== undefined &&
                    item.x !== undefined && item.y !== undefined) {
                    item.originIsCloseToTargetAtStart = false;
                    
                    var distance = ml.Misc.getDistance(
                            {x: data.x, y: data.y}, {x: item.x, y: item.y} );
                    if (distance >= this.moveDistanceConsideredImportantForDust) {
                        this.spawnImportantGoneOrPlacedDustAtItem(item);
                        item.originIsCloseToTargetAtStart = true;
                    }
                    else {
                        this.spawnDustAtItem(item);
                    }
                }
                else {
                    this.spawnDustAtItem(item, true);
                }
            }

            if ( ml.Misc.isInteger(data.x) && ml.Misc.isInteger(data.y) ) {
                item.targetX = data.x;
                item.targetY = data.y;

                this.startItemSpecial(item);
            }

            if ( ml.Misc.isInteger(data.rot) ) {
                item.rot = parseInt(data.rot);
                item.rotatable = true;
                if (item.entity) {
                    item.entity = null;
                    this.expandItemAndInstantiateEntity(item);
                }
            }
            
            if ( ml.Misc.isInteger(data.state) ) {
                item.state = data.state;
            }
            
            if (data.flip !== undefined && item.entity) {
                item.flip = data.flip;
            }

            if (data.randomizerSeed !== undefined) {
                this.handleItemTarget(item, true);
                if (data.itemItsOnId) {
                    this.triggerRandomization(data.itemItsOnId, data.randomizerSeed);
                }
                else {
                    ig.game.seedableRandom.setSeed(data.randomizerSeed);
                    this.doRandomizeItem(item);
                }
            }

            if (data.shuffleSeed !== undefined) {
                this.handleItemTarget(item, true);
                if (data.participantIndex !== undefined) {
                    var section = this.participantSections[data.participantIndex];
                    if (section) {
                        this.shuffleItemsInSections([section], data.shuffleSeed);
                    }
                }
                else {
                    this.shuffleItemsInSections(this.neutralSections, data.shuffleSeed);
                }
            }

            item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
            
            if (originator && !doSilently) {
                this.createActivityLine(originator, item);
            }

            if (!doSilently) { ig.game.sounds.shortWhoosh.play(); }
        }
    },

    createActivityLine: function(originator, item) {
        if (!this.showDustTrails || !item.entity) { return; }
        
        var pos1 = {
                x: originator.pos.x - ig.game._rscreen.x,
                y: originator.pos.y - ig.game._rscreen.y
                };
        var pos2 = {
                x: this.pos.x + (item.targetX !== undefined ? item.targetX : item.x) + item.entity.size.x / 2,
                y: this.pos.y + (item.targetY !== undefined ? item.targetY : item.y) + item.entity.size.y / 2
                };

        var deviation = 12;
        var opacity = 45;
        var stepsDivider = 25;

        var posDiffX = (pos2.x - pos1.x);
        var posDiffY = (pos2.y - pos1.y);
        var distanceBetween = Math.sqrt(posDiffX * posDiffX + posDiffY * posDiffY);

        var steps = distanceBetween / stepsDivider;
        var xOff, yOff;
        var xStep = posDiffX / steps;
        var yStep = posDiffY / steps;

        for (var step = 1; step <= steps; step++) {
            xOff = xStep * step;
            yOff = yStep * step;

            ig.game.spawnEntityIfPosOnScreenPlusMargin(EntityDust,
                    pos1.x + 5 + xOff + Math.random() * deviation - deviation / 2,
                    pos1.y + 5 + yOff + Math.random() * deviation - deviation / 2,
                    {decay: (step / steps)*1, opacity: opacity,
                     uiEntity: true, drawLighter: true});
            if( ig.game.chance(15) ) {
                ig.game.spawnEntityIfPosOnScreenPlusMargin(EntityBigDust,
                        pos1.x + 5 + xOff + Math.random() * deviation - deviation / 2,
                        pos1.y + 5 + yOff + Math.random() * deviation - deviation / 2,
                        {decay: (step / steps) * 1, opacity: opacity, behindPlayers : true,
                         uiEntity: true, drawLighter: true});
            }
        }
    },
    
    getItemByLocalId: function(items, localId) {
        var item;
        if (localId) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].localId == localId) {
                    item = items[i];
                    break;
                }
            }
        }
        return item;
    },
    
    loadSetup: function(sendRestartWhenLoaded, callback) {
        var self = this;
        this.localIdCounter = 0;
        this.staticItems = [];
        this.movableItems = [];
        this.editHistory = [];
        this.allEntitiesLoaded = false;
        this.waitingForChangesSinceStartTimer = new ml.Timer();
        this.askForChangesOnceEntitiesLoaded = false;
        
        ig.game.httpApi.getMultithing(this.id).done(function(data){

            self.hashOfFullSetupAtStart =
                    ig.game.strings.getDistinctHash( JSON.stringify(data.data) );
            
            var unpackedData = self.getUnpackedSetup(data.data);
            self.weAreCreator = Boolean(data.isCreator);
            self.applySetupData(unpackedData);

            if (self.settings.maxParticipants == 0) {
                self.waitingForChangesSinceStartTimer = null;
            }
            else {
                var userWhoViewedFirst = self.getUserWhoViewedFirst();
                if (userWhoViewedFirst) {
                    if (userWhoViewedFirst.isOurPlayer) {
                        self.addParticipant(ig.game.ourPlayer);
                        self.waitingForChangesSinceStartTimer = null;
                    }
                    else {
                        self.askForChangesOnceEntitiesLoaded = true;
                    }
                }
            }

            if (!self.menuEntries) { self.initMenuEntriesData(); }

            if (sendRestartWhenLoaded) {
                ig.game.websocketComs.transmitMultithingActivity(
                        'restart', self.placementId);
            }
            else if (callback) {
                callback();
            }
            
        });
    },

    saveSetup: function() {
        var packedData = this.getPackedSetup();
        var self = this;

        /*
        var isValid = this.isValidMultithingsData(
                packedData.itemProps,
                packedData.staticItemsPropIndexAndXY,
                packedData.movableItemsPropIndexAndXY,
                packedData.settings);
        if (!isValid) { return; }
        */
        
        ig.game.httpApi.saveMultithing(this.id, packedData).done(function(data){
            if (data) {
                self.restart();
                ig.game.sounds.success.play();
            }
        });
    },

    /*
    isValidMultithingsData: function(itemProps, staticItemsPropIndexAndXY, movableItemsPropIndexAndXY, settings) {
        // shared between server and client's ui/multithing.js
        
        var isValid = false;
        var maxStaticItems = 1000;
        var maxMovableItems = 1000;
        
        if (staticItemsPropIndexAndXY === undefined) {
            staticItemsPropIndexAndXY = [];
        }
        if (movableItemsPropIndexAndXY === undefined) {
            movableItemsPropIndexAndXY = [];
        }
    
        if (itemProps !== undefined) {
            if (    Array.isArray(itemProps) &&
                    Array.isArray(staticItemsPropIndexAndXY) &&
                    Array.isArray(movableItemsPropIndexAndXY) ) {
                    
                if (staticItemsPropIndexAndXY.length <= maxStaticItems &&
                    movableItemsPropIndexAndXY.length <= maxMovableItems) {
                    isValid = true;
                    
                    isValid = this.isPropIndexAndXYArray(staticItemsPropIndexAndXY);
                    if (isValid) {
                        isValid = this.isPropIndexAndXYArray(movableItemsPropIndexAndXY);
                    }

                    if (isValid) {
                        isValid = this.areValidMultithingSettings(settings);

                        // we can add more validation here later
                    }

                }
                
             }
        }

        return isValid;
    },
    
    areValidMultithingSettings: function(settings) {
        var isValid = true;
        var allowedProperties = [
                'hasNeutralSections',
                'hasParticipantSections',
                'markSections',
                'fontName',
                'neutralSectionsShuffle',
                'participantSectionsShuffle',
                'maxParticipants',
                'wallpaperOpacity',
                'staticItemsRevealMode',
                'movableItemsRevealMode',
                'livelyBodies',
                'participantValueAtStart',
                'snapToGridRect',
                'neutralSections',
                'participantSections'
                ];
        if (settings) {
            for (var setting in settings) {
                var settingExists = allowedProperties.indexOf(setting) >= 0;
                if (!settingExists) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    },
    
    isPropIndexAndXYArray: function(items) {
        var isValid = true;
        for (var i = 0; i < items.length; i++) {
            var indexAndXY = items[i];
            if ( !(
                    indexAndXY && indexAndXY.length == 3 &&
                    this.isInteger(indexAndXY[0]) &&
                    this.isInteger(indexAndXY[1]) &&
                    this.isInteger(indexAndXY[2])
                    ) ) {
                isValid = false;
                break;
            }
        }
        return isValid;
    },

    isInteger: function(n) {
        return this.isNumber && parseInt(n) == n;
    },
    
    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    */

    getPackedSetup: function() {
        var data = {};
        // - itemProps: [
        //    {id: '123', flip: ..., state: ...}, // defaults like rot 0 won't appear
        //    {id: '123', rot: ..., possibleFutureProperty: ...},
        //    ]
        // - staticItemsPropIndexAndXY:  [ [1,200,120], [3,13,220], ... ]
        // - movableItemsPropIndexAndXY: [ [3,200,120], [6,13,220], ... ]
        // - settings

        this.sortItemsZIndex(this.staticItems);
        this.sortItemsZIndex(this.movableItems);
        
        data.itemProps = [];
        data.staticItemsPropIndexAndXY = [];
        data.movableItemsPropIndexAndXY = [];
        
        for (var itemType = 0; itemType <= 1; itemType++) {
            var items, dataItems;
            if (itemType == 0) {
                items = this.staticItems;
                dataItems = data.staticItemsPropIndexAndXY;
            }
            else {
                items = this.movableItems;
                dataItems = data.movableItemsPropIndexAndXY;
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var theseProps = this.getPackedPropsForItem(item);
                var index = this.getIndexForTheseProps(data.itemProps, theseProps);
                if (index == -1) {
                    data.itemProps.push(theseProps);
                    index = data.itemProps.length - 1;
                }

                dataItems.push([index, parseFloat(item.x), parseFloat(item.y)]);
            }
        }
        
        data.settings = this.getCurrentSettingsWhichAreNonDefault();

        return data;
    },
    
    getCurrentSettingsWhichAreNonDefault: function() {
        var delta = {};
        var defaultSettings = this.getDefaultSettings();
        var currentSettings = this.settings;
        
        for (var key in defaultSettings) {
            var sDefault = JSON.stringify(defaultSettings[key]);
            var sCurrent = JSON.stringify(currentSettings[key]);
            if (sDefault != sCurrent) {
                delta[key] = ig.game.cloneObject(currentSettings[key]);
            }
        }

        return delta;
    },
    
    getPackedPropsForItem: function(item) {
        var props = {};
        props.id = item.id;
        if (item.state)          { props.state          = parseInt(item.state); }
        if (item.flip)           { props.flip           = parseInt(item.flip); }
        if (item.rot)            { props.rot            = parseInt(item.rot); }
        if (item.wiggleSpeed)    { props.wiggleSpeed    = parseFloat(item.wiggleSpeed); }
        if (item.wiggleDistance) { props.wiggleDistance = parseFloat(item.wiggleDistance); }
        return props;
    },

    getIndexForTheseProps: function(itemProps, theseProps) {
        var index = -1;
        for (var i = 0; i < itemProps.length; i++) {
            var props = itemProps[i];
            var isSame = props.id == theseProps.id &&
                         props.state == theseProps.state &&
                         props.rot == theseProps.rot &&
                         props.flip == theseProps.flip &&
                         props.wiggleSpeed == theseProps.wiggleSpeed &&
                         props.wiggleDistance == theseProps.wiggleDistance;
            if (isSame) {
                index = i;
                break;
            }
        }
        return index;
    },
    
    getUnpackedSetup: function(packedData) {
        var data = {};
        data.staticItems = [];
        data.movableItems = [];
        data.settings = {};
        
        if (packedData) {
            if ( !Array.isArray(packedData.movableItemsPropIndexAndXY) ) {
                packedData.movableItemsPropIndexAndXY = [];
            }
            if ( !Array.isArray(packedData.staticItemsPropIndexAndXY) ) {
                packedData.staticItemsPropIndexAndXY = [];
            }
        
            for (var itemType = 0; itemType <= 1; itemType++) {
                var items, dataItems;
                if (itemType == 0) {
                    dataItems = packedData.staticItemsPropIndexAndXY;
                    items = data.staticItems;
                }
                else {
                    dataItems = packedData.movableItemsPropIndexAndXY;
                    items = data.movableItems;
                }
                
                for (var i = 0; i < dataItems.length; i++) {
                    var dataItem = dataItems[i];
                    var propIndex = dataItem[0];
                    var x =         dataItem[1];
                    var y =         dataItem[2];
                    
                    var props = packedData.itemProps[propIndex];
                    var item = {};
                    item.id = props.id;
                    item.x = x;
                    item.y = y;
                    if (props.state)          { item.state          = parseInt(props.state); }
                    if (props.rot)            { item.rot            = parseInt(props.rot); }
                    if (props.flip)           { item.flip           = parseInt(props.flip); }
                    if (props.wiggleSpeed)    { item.wiggleSpeed    = parseFloat(props.wiggleSpeed); }
                    if (props.wiggleDistance) { item.wiggleDistance = parseFloat(props.wiggleDistance); }
                    
                    items.push(item);
                }
            }

            data.settings = packedData.settings;
            if (data.settings === null) {
                data.settings = undefined;
            }
        }
        
        return data;
    },
    
    toBooleanIfNeeded: function(v) {
        if (typeof v === 'string') {
            v = Boolean(v === 'true');
        }
        return v;
    },
    
    applySetupData: function(data) {
        this.staticItems = data.staticItems;
        this.movableItems = data.movableItems;

        this.settings = this.getDefaultSettings();
        if (data.settings) {
            for (var key in this.settings) {
                if (data.settings[key] !== undefined) {
                    this.settings[key] = data.settings[key];
                }
            }
        }

        this.settings.markSections = this.toBooleanIfNeeded(this.settings.markSections);
        this.settings.hasParticipantSections = this.toBooleanIfNeeded(this.settings.hasParticipantSections);
        this.settings.hasNeutralSections = this.toBooleanIfNeeded(this.settings.hasNeutralSections);
        this.settings.neutralSectionsShuffle = this.toBooleanIfNeeded(this.settings.neutralSectionsShuffle);
        this.settings.participantSectionsShuffle = this.toBooleanIfNeeded(this.settings.participantSectionsShuffle);
        // this.settings.livelyBodies = this.toBooleanIfNeeded(this.settings.livelyBodies);
        if (this.settings.participantValueAtStart !== undefined) {
            this.settings.participantValueAtStart = parseInt(this.settings.participantValueAtStart);
        }
        if (this.settings.maxParticipants !== undefined) {
            this.settings.maxParticipants = parseInt(this.settings.maxParticipants);
        }

        this.applySettingSections();
        
        for (var i = 0; i < data.staticItems.length; i++) {
            var item = this.staticItems[i];
            item.x = parseFloat(item.x);
            item.y = parseFloat(item.y);
            item.isStatic = true;
            if (this.settings.staticItemsRevealMode == 'fromCenterBelow') {
                item.targetX = item.x;
                item.targetY = item.y;
                item.x = this.size.x / 2;
                item.y = this.size.y + ig.game.tileSize;
            }
        }
        for (var i = 0; i < data.movableItems.length; i++) {
            var item = this.movableItems[i];
            item.x = parseFloat(item.x);
            item.y = parseFloat(item.y);
            if (this.settings.movableItemsRevealMode == 'fromCenterBelow') {
                item.targetX = item.x;
                item.targetY = item.y;
                item.x = this.size.x / 2;
                item.y = this.size.y + ig.game.tileSize;
            }
        }
        this.sortItemsZIndex(this.staticItems);
        this.sortItemsZIndex(this.movableItems);
        
        this.movableItemsAtStart = ig.game.cloneObject(this.movableItems);
        this.staticItemsAtStart = ig.game.cloneObject(this.staticItems);

        for (var i = 0; i < data.staticItems.length; i++) {
            this.expandItemAndInstantiateEntity(this.staticItems[i]);
        }
        for (var i = 0; i < data.movableItems.length; i++) {
            this.expandItemAndInstantiateEntity(this.movableItems[i]);
        }

        this.doAddLastCancelledItemIfNeeded();
    },
    
    toRectNumbersIfNeeded: function(rect) {
        return {
                x: parseFloat(rect.x), 
                y: parseFloat(rect.y),
                width: parseFloat(rect.width),
                height: parseFloat(rect.height)
                };
    },

    applySettingSections: function() {
        if (this.settings.hasNeutralSections) {
            var i = 0;
            this.neutralSections[i] = this.toRectNumbersIfNeeded(this.settings.neutralSections[i]);
        }
        if (this.settings.hasParticipantSections) {
            this.participantSections = [];
            for (var i = 0; i < this.settings.maxParticipants; i++) {
                this.participantSections[i] = this.toRectNumbersIfNeeded(this.settings.participantSections[i]);
            }
        }

        for (var i = 0; i < this.movableItems.length; i++) {
            var item = this.movableItems[i];
            if (item.entity) {
                item.isInOtherPrivateSection = this.getIsInOtherPrivateSection(item);
            }
        }
    },

    getDefaultNeutralSections: function() {
        var tileSizeDynamic = 29;
        var padding = 2;
        var size = 4 * ig.game.tileSize;
        var neutralRectWidth = 7 * ig.game.tileSize;

        var rectTopMiddle = {
                x: this.size.x / 2 - neutralRectWidth / 2, y: padding,
                width: neutralRectWidth, height: tileSizeDynamic
                };

        return [rectTopMiddle];
    },
    
    getDefaultParticipantSections: function() {
        var tileSizeDynamic = 29;
        var padding = 2;
        var size = 4 * ig.game.tileSize;
        var topY = tileSizeDynamic + padding;
        var smallerHeight = 24;
        
        var bottomRight = {x: this.size.x - size - padding, y: this.size.y - size - padding,
                width: size, height: size};
        var bottomLeft = {x: padding, y: this.size.y - size - padding,
                width: size, height: size};
        var middleLeft = {x: padding, y: topY,
                width: size, height: size};
        var middleRight = {x: this.size.x - size - padding, y: topY,
                width: size, height: size};

        var topLeft = {x: padding, y: padding,
                width: 98, height: smallerHeight};
        var topRight = {x: this.size.x - topLeft.width - padding, y: padding,
                width: topLeft.width, height: smallerHeight};
        
        var bottomMiddleLeft = {x: middleLeft.x + middleLeft.width + 4, y: this.size.y - smallerHeight - padding,
                width: 86.5, height: smallerHeight};
        var bottomMiddleRight = {x: middleRight.x - 4 - bottomMiddleLeft.width, y: bottomMiddleLeft.y,
                width: bottomMiddleLeft.width, height: smallerHeight};

        return [bottomRight, bottomLeft, middleLeft, middleRight,
                topLeft, topRight, bottomMiddleLeft, bottomMiddleRight];
    },

    expandItemAndInstantiateEntity: function(item) {
        if (item.localId === undefined) { item.localId = ++this.localIdCounter; }
        var typesSupportingRanges = ['DYNATHING', 'DECOANIM'];

        var itemInfo = ig.game.itemCache.getItemBasic(item.id, 'ui_mt2');
        var self = this;
        itemInfo.imagesBeingGenerated.done(function(){
            item.rot = item.rot != undefined ? item.rot : 0;
            item.flip = item.flip != undefined ? item.flip : 0;
            itemInfo.rot = item.rot;
            itemInfo.flip = item.flip;

            var settings = {
                thingTypeId: itemInfo.id,
                flip: itemInfo.flip,
                attributes: itemInfo.attributes,
                animSheet: ig.game.entityManager.getAnimationForEntity(itemInfo, itemInfo.rot, itemInfo.flip),
                isInHolderOrDialog: true,
                isInDialog: true,
                isInMultithing: true
                };
            if (item.base == 'STACKWEARB') {
                settings.blinkInMultithing = self.settings.livelyBodies;
            }
                
            ig.game.entityManager.attachItemSettings( itemInfo.getBaseType(), itemInfo, settings, true );

            var pos = {x: self.pos.x + item.x, y: self.pos.y + item.y};
            
            item.name = itemInfo.name;
            item.base = itemInfo.base;
            item.attributes = ig.game.cloneObject(itemInfo.attributes);
            item.rotatable = itemInfo.rotatable;
            item.flippable = item.isStatic || item.base == 'STACKWEARB';
            if (!item.state) { item.state = undefined; }

            if ( typesSupportingRanges.indexOf(item.base) >= 0 ) {
                var stateRange = self.getStateRangeFromBaseAndName(item.base, item.name);
                if (stateRange) {
                    item.minState = stateRange.min;
                    item.maxState = stateRange.max;
                    if (!item.state) { item.state = item.minState; }
                }
            }

            var entityName = 'Entity' + ig.game.strings.toUpperCaseFirst( itemInfo.base.toLowerCase() );
            if ( !ig.global[entityName] ) { entityName = 'EntityDefault'; }
            item.entity = new ( ig.global[entityName] ) (pos.x, pos.y, settings);

            item.entity.update();
            item.isInOtherPrivateSection = self.getIsInOtherPrivateSection(item);
        });
    },
    
    getStateRangeFromBaseAndName: function(base, name) {
        var range;
        if (base == 'DECOANIM') {
            range = {min: 1, max: 2};
        }
        else if (base == 'DYNATHING') {
            var nameParts = name.split(' ');
            var lastPart = nameParts[nameParts.length - 1];
            var potentialRange = lastPart.split('-');
            if (potentialRange.length == 2) {
                potentialRange[0] = potentialRange[0].trim();
                potentialRange[1] = potentialRange[1].trim();
                if ( this.stringMayBeInteger(potentialRange[0]) &&
                     this.stringMayBeInteger(potentialRange[1]) ) {
                    range = { min: parseInt(potentialRange[0]),
                              max: parseInt(potentialRange[1]) };
                }
            }
        }
        return range;
    },
    
    stringMayBeInteger: function(s) {
        return !isNaN(s) && s == parseInt(s);
    },
    
    addItem: function(id, rotation, flip, optionalX, optionalY, wiggleSpeed, wiggleDistance) {
        if (this.weAreCreator) {
            if (this.isEditingStatic || this.isEditingMovables) {
                var allowedTypes, maxItems, currentItems;
                if (this.isEditingStatic) {
                    allowedTypes = this.allowedTypesStatic;
                    maxItems =     this.maxStaticItems;
                    currentItems = this.staticItems;
                }
                else {
                    allowedTypes = this.allowedTypesMovable;
                    maxItems =     this.maxMovableItems;
                    currentItems = this.movableItems;
                }

                if (currentItems.length < maxItems) {
                    var item = ig.game.itemCache.getItemBasic(id, 'ui_mt1');

                    if (item) {
                        if ( allowedTypes.indexOf(item.base) >= 0 ) {
                            this.doAddItem(id, rotation, flip, optionalX, optionalY,
                                    wiggleSpeed, wiggleDistance);
                        }
                        else {
                            var modeVerbose = this.isEditingStatic ? ' static background' : 'movables';
                            ig.game.alertDialog.openSmall(
                                    'The following can be included for Multi ' + modeVerbose + ': ' +
                                    ml.Misc.getVerboseTypeFromKeyList(allowedTypes) + '.'
                                    );
                            ig.game.sounds.nocando.play();
                        }
                    }
                }
                else {
                    var message = "i reached the " +
                            (this.isEditingStatic ? 'static' : 'movable') +
                            " items limit";
                    ig.game.ourPlayer.say(message);
                    ig.game.sounds.nocando.play();
                }
            }
            else {
                this.lastCancelledAddItem = {id: id, rotation: rotation, flip: flip};
                this.lastCancelledAddItem.x = Math.round(ig.input.mouse.x - this.pos.x - ig.game.tileSize / 2);
                this.lastCancelledAddItem.y = Math.round(ig.input.mouse.y - this.pos.y - ig.game.tileSize / 2);

                this.openMenuAndMentionEditMode();
            }
        }
        else {
            ig.game.sounds.nocando.play();
        }
    },
    
    openMenuAndMentionEditMode: function() {
        ig.game.ourPlayer.say('i need to go into set up mode');
        this.menuIsOpen = true;
        ig.game.sounds.shortWhoosh.play();
    },
    
    doAddItem: function(id, rotation, flip, optionalX, optionalY, wiggleSpeed, wiggleDistance) {
        var items = this.isEditingStatic ? this.staticItems : this.movableItems;
        var item = {};
        item.id = id;
        item.x = optionalX !== undefined ?
                optionalX : Math.round(ig.input.mouse.x - this.pos.x - ig.game.tileSize / 2);
        item.y = optionalY !== undefined ?
                optionalY : Math.round(ig.input.mouse.y - this.pos.y - ig.game.tileSize / 2);
        item.rot = parseInt(rotation);
        item.flip = parseInt(flip);
        item.isStatic = this.isEditingStatic;
        if (wiggleSpeed) { item.wiggleSpeed = wiggleSpeed; }
        if (wiggleDistance) { item.wiggleDistance = wiggleDistance; }
        var index = items.length;
        items[index] = item;
        this.lastActiveItem = items[index];
        this.expandItemAndInstantiateEntity(items[index]);
        ig.game.sounds.putdown.play();
        
        this.addToEditHistory({
            action: 'add', localId: item.localId
            });
    },
    
    rotateOrFlipItem: function(item) {
        if (item.rotatable || item.flippable) {

            if (item.rotatable) {
                if (item.flippable) {
                    if (item.rot == 3) {
                        item.flip = item.flip ? 0 : 1;
                        item.rot = 0;
                    }
                    else {
                        item.rot++;
                    }
                }
                else {
                    item.rot = item.rot == 3 ? 0 : item.rot + 1;
                }
            }
            else if (item.flippable) {
                item.flip = item.flip ? 0 : 1;
                item.entity.currentAnim.flip.x = Boolean(item.flip);
            }

            if (item.base != 'STACKWEARB') {
                item.entity = null;
                this.expandItemAndInstantiateEntity(item);
            }
            
            ig.game.sounds.shortWhoosh.play();
            
        }
    },

    tidyUpEntities: function(items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.entity && item.entity.tidyUp) { item.entity.tidyUp(); }
            delete item.entity;
        }
    },
    
    restart: function() {
        this.menuIsOpen = false;
        if ( this.getWeAreMaster() ) {
            this.allEntitiesLoaded = false;
            this.locallyEditableTexts = {};
            this.loadSetup(true);
            ig.game.sounds.whoosh.play();
        }
        else {
            ig.game.ourPlayer.say('only the one who started can restart');
        }
    },

    startEditStatic: function() {
        if (this.weAreCreator) {
            if ( this.getWeAreMaster() ) {
                if (!this.isEditingStatic) {
                    if (this.isEditingMovables) {
                        this.saveSetup();
                        this.isEditingStatic = true;
                        this.isEditingMovables = false;
                    }
                    else {
                        this.isEditingStatic = true;
                        this.isEditingMovables = false;
                        this.loadSetup();
                    }
                    this.saveClickText = null;
                }
            }
            else {
                this.alertOnlyMasterCanEdit();
            }
            
        }
        else {
            this.alertOnlyCreatorCanDoThis();
        }
        this.menuIsOpen = false;
    },
    
    alertOnlyMasterCanEdit: function() {
        ig.game.ourPlayer.say(this.name + ' was already started here');
    },
    
    doAddLastCancelledItemIfNeeded: function() {
        var item = this.lastCancelledAddItem;
        if (item) {
            this.addItem(item.id, item.rotation, item.flip, item.x, item.y);
            this.lastCancelledAddItem = null;
        }
    },
    
    startEditMovables: function() {
        if (this.weAreCreator) {
            if ( this.getWeAreMaster() ) {
                if (!this.isEditingMovables) {
                    if (this.isEditingStatic) {
                        this.saveSetup();
                        this.isEditingStatic = false;
                        this.isEditingMovables = true;
                    }
                    else {
                        this.isEditingStatic = false;
                        this.isEditingMovables = true;
                        this.loadSetup();
                    }
                    this.saveClickText = null;
                }
            }
            else {
                this.alertOnlyMasterCanEdit();
            }

        }
        else {
            this.alertOnlyCreatorCanDoThis();
            
        }
        this.menuIsOpen = false;
    },
    
    saveEdits: function() {
        this.isEditingStatic = false;
        this.isEditingMovables = false;
        this.saveClickText = null;
        this.saveSetup();
    },
    
    alertOnlyCreatorCanDoThis: function() {
        ig.game.alertDialog.openSmall('only the creator can do this');
    },
    
    openHelp: function() {
        ml.Misc.openUrl('/info-multi');
        this.menuIsOpen = false;
    },
    
    toggleOpenMenu: function() {
        if ( !( this.isEditingStatic || this.isEditingMovables ||
                (ig.game.alertDialog && ig.game.alertDialog.isOpen) ) ) {
            this.menuIsOpen = !this.menuIsOpen
        }
    },
    
    clickedClose: function() {
        if (this.isEditingStatic || this.isEditingMovables) {
            if ( confirm( 'cancel changes?'.toUpperCase() ) ) {
                this.isEditingStatic = false;
                this.isEditingMovables = false;
                this.saveClickText = null;
                this.loadSetup();
            }
        }
        else {
            this.close();
        }
    },
    
    reloadThenStartEditSettings: function() {
        var self = this;
        this.loadSetup( undefined,
            function() {
                self.startEditSettings();
            }
            );
    },
    
    startEditSettings: function() {
        this.menuIsOpen = false;

        var html = '';
        var self = this;
        var callback = function() { self.saveSettings(); }

        var defaultNeutralSections = this.getDefaultNeutralSections();
        var defaultParticipantSections = this.getDefaultParticipantSections();
        
        var participantsArray = [];
        for (var i = 0; i <= this.maxParticipantsPossible; i++) {
            participantsArray.push(i);
        }

        var fonts = [], fontLabels = [], i = 1;
        for (var fontName in ig.game.availableFonts) {
            fonts.push(fontName);
            fontLabels.push(i++);
        }

        html += '<div class="multithingSettings">';

        html += this.getSelectBoxHtml('maxParticipants', 'Suggested max. active participants',
                participantsArray, this.settings.maxParticipants);

        html += this.getCheckboxHtml('hasNeutralSections', 'Has neutral section', this.settings.hasNeutralSections);
        html += this.getCheckboxHtml('hasParticipantSections', 'Has participant sections', this.settings.hasParticipantSections);
        html += this.getCheckboxHtml('markSections', 'Mark sections', this.settings.markSections);
        html += this.getSelectBoxHtml('fontName', 'font', fonts, this.settings.fontName, fontLabels);
        html += this.getCheckboxHtml('neutralSectionsShuffle', 'Neutral section shuffles', this.settings.neutralSectionsShuffle);
        html += this.getCheckboxHtml('participantSectionsShuffle', 'Participant sections shuffle', this.settings.participantSectionsShuffle);
        // html += this.getCheckboxHtml('livelyBodies', 'Lively bodies', this.settings.livelyBodies);
        html += this.getInputHtml('wallpaperOpacity', 'Background opacity (0-1)', this.settings.wallpaperOpacity);
        html += this.getInputHtml('participantValueAtStart', "Everyone's start value", this.settings.participantValueAtStart);
        html += this.getInputHtml('participantValuePrefix', "Value prefix", this.settings.participantValuePrefix);
        html += this.getSelectBoxHtml('staticItemsRevealMode', 'Statics reveal mode', ['none', 'fromCenterBelow'],
                this.settings.staticItemsRevealMode);
        html += this.getSelectBoxHtml('movableItemsRevealMode', 'Movables reveal mode', ['none', 'fromCenterBelow'],
                this.settings.movableItemsRevealMode);
        html += this.getRectInputHtml( 'snapToGridRect', 'snap to grid (18 x 10)', this.settings.snapToGridRect,
                this.getDefaultSnapToGridRect() );
                
        var clickCall = "jQuery('#sectionPositions').slideToggle()";
        html += '<p class="pseudoLink" onclick="' + clickCall + '" ' +
                'style="background-color: rgba(0,0,0,.1)">Section Positions</p>';
        var sectionPositionsStyle = 'display: none';
        html += '<div id="sectionPositions" style="' + sectionPositionsStyle + '">';
        for (var i = 0; i < this.settings.neutralSections.length; i++) {
            html += this.getRectInputHtml('neutralSections_0', 'neutral section',
                this.settings.neutralSections[i], defaultNeutralSections[i]);
        }
        for (var i = 0; i < this.settings.participantSections.length; i++) {
            html += this.getRectInputHtml('participantSections_' + i, 'participant section ' + (i + 1),
                    this.settings.participantSections[i], defaultParticipantSections[i]);
        }
        html += '</div>';

        html += '</div>';
        this.isEditingSettings = true;
        ig.game.alertDialog.open({html: html, callbackForOk: callback, buttonText: 'done',
                doShowAtSide: true});
    },
    
    getDefaultSettings: function() {
        return {
                hasNeutralSections: false,
                hasParticipantSections: false,
                markSections: true,
                fontName: 'blackWhite',
                neutralSectionsShuffle: true,
                participantSectionsShuffle: false,
                maxParticipants: this.maxParticipantsDefault,
                wallpaperOpacity: 1,
                staticItemsRevealMode: 'none',
                movableItemsRevealMode: 'none',
                // livelyBodies: true,
                participantValueAtStart: undefined,
                participantValuePrefix: undefined,
                snapToGridRect: this.getDefaultSnapToGridRect(),
                neutralSections: this.getDefaultNeutralSections(),
                participantSections: this.getDefaultParticipantSections()
                };
    },
    
    getDefaultSnapToGridRect: function() {
        return {x: null, y: null, width: null, height: null};
    },

    getSelectBoxHtml: function(id, label, values, defaultValue, optionalLabels) {
        var html = '';
        var style = 'min-width: ' + 30 * ig.system.scale + 'px';
        html += '<p>' + ig.game.strings.htmlEscape(label) + ': ';
        html += '<select id="' + ig.game.strings.htmlEscape(id) + '" ' +
                'style="' + style + '" onchange="ig.game.multithing.setSettingsFromDialog()">';
                
        for (var i = 0; i < values.length; i++) {
            var sDefault = values[i] == defaultValue ? ' selected="selected"' : '';
            var value = values[i];

            var label;
            if (optionalLabels) {
                label = optionalLabels[i];
            }
            else {
                label = value;
                if (typeof value === 'string') {
                    label = ig.game.strings.camelCaseToWords(label).toUpperCase();
                }
            }

            var escapedValue = ig.game.strings.htmlEscape(value);
            var escapedLabel = ig.game.strings.htmlEscape(label);
            html += '<option value="' + escapedValue + '"' + sDefault + '>' +
                    escapedLabel + '</option>';
        }
        html += '</select>';
        html += '</p>';
        return html;
    },
    
    getRectInputHtml: function(id, label, value, placeholder) {
        var html = '';
        var style = 'width: 40px';
        html += '<p>' + ig.game.strings.htmlEscape(label) + ':<br/>';
        
        var keyLabels = {x: 'left', y: 'top'};

        var i = 0;
        for (var key in value) {
            var keyLabel = keyLabels[key] ? keyLabels[key] : key;
            var thisValue = value[key] !== null ? value[key] : '';
            var thisPlaceholder = placeholder[key] ? placeholder[key] : '';
            html += '<span style="color: rgb(100,100,100); font-size: 90%">' +
                    ig.game.strings.htmlEscape(keyLabel) +
                    '&nbsp;<input id="' + ig.game.strings.htmlEscape(id + '_' + key) + '" type="text" ' +
                    'onchange="ig.game.multithing.setSettingsFromDialog()" ' +
                    'value="' + ig.game.strings.htmlEscape(thisValue) + '" ' +
                    'placeholder="' + ig.game.strings.htmlEscape(thisPlaceholder) + '" ' +
                    'style="' + style + '" ' +
                    '/>&nbsp;&nbsp;</span>';
            if (++i == 2) { html += '<br/>'; }
        }
        html += '</p>';
        return html;
    },
    
    getInputHtml: function(id, label, value, ignoreOnChange) {
        var html = '';
        if (value === undefined) { value = ''; }
        html += '<p>' + ig.game.strings.htmlEscape(label) + ': ';
        html += '<input id="' + ig.game.strings.htmlEscape(id) + '" type="text" ';
        if (!ignoreOnChange) {
            html += 'onchange="ig.game.multithing.setSettingsFromDialog()" ';
        }
        html += 'value="' + ig.game.strings.htmlEscape(value) + '"/>';
        html += '</p>';
        return html;
    },

    getCheckboxHtml: function(id, label, isOn) {
        var checkboxImage = ig.game.staticResourcePrefix + 'media/checkbox/' +
                (isOn ? 'on' : 'off') + '/' + Math.min(ig.system.scale, 5) + '.png';
        return '<p class="disableContentSelect" style="cursor: default" ' +
                'onclick="ig.game.settings.toggleCheckbox(' + "'" + id + "'" + ');ig.game.multithing.setSettingsFromDialog()"' +
                '>' +
                '<img src="' + checkboxImage +'" alt="" id="checkbox_' + id + '" /> ' +
                ig.game.strings.htmlEscape(label) +
                '<span id="' + id + 'Info" style="display: inline-block; opacity: .5; margin-left: 28px; font-size: 90%"></span>' +
                '</p>';
    },

    setSettingsFromDialog: function() {
        this.settings.maxParticipants = parseInt( jQuery('#maxParticipants').val() );
        this.settings.hasNeutralSections = jQuery('#checkbox_hasNeutralSections').attr('src').indexOf('/on/') >= 0;
        this.settings.hasParticipantSections = jQuery('#checkbox_hasParticipantSections').attr('src').indexOf('/on/') >= 0;
        this.settings.markSections = jQuery('#checkbox_markSections').attr('src').indexOf('/on/') >= 0;
        this.settings.neutralSectionsShuffle = jQuery('#checkbox_neutralSectionsShuffle').attr('src').indexOf('/on/') >= 0;
        this.settings.participantSectionsShuffle = jQuery('#checkbox_participantSectionsShuffle').attr('src').indexOf('/on/') >= 0;
        // this.settings.livelyBodies = jQuery('#checkbox_livelyBodies').attr('src').indexOf('/on/') >= 0;
        
        this.settings.fontName = jQuery('#fontName').val();

        this.settings.participantValueAtStart = jQuery('#participantValueAtStart').val();
        if ( ml.Misc.isInteger(this.settings.participantValueAtStart) ) {
            this.settings.participantValueAtStart = parseInt(this.settings.participantValueAtStart);
        }
        else {
            this.settings.participantValueAtStart = undefined;
        }
        this.settings.participantValuePrefix = String( jQuery('#participantValuePrefix').val() );
        if (this.settings.participantValuePrefix == '') {
            this.settings.participantValuePrefix = undefined;
        }
        else {
            this.settings.participantValuePrefix = ig.game.strings.cutLength(this.settings.participantValuePrefix, 15);
        }

        this.settings.wallpaperOpacity = this.getValidOpacityValue( jQuery('#wallpaperOpacity').val() ,
                this.settings.wallpaperOpacity );
        jQuery('#wallpaperOpacity').val(this.settings.wallpaperOpacity);

        this.settings.staticItemsRevealMode = jQuery('#staticItemsRevealMode').val();
        this.settings.movableItemsRevealMode = jQuery('#movableItemsRevealMode').val();
        
        this.settings.snapToGridRect = this.getValidRectValue( 'snapToGridRect',
                this.getDefaultSnapToGridRect() );

        var defaultNeutralSections = this.getDefaultNeutralSections();
        var defaultParticipantSections = this.getDefaultParticipantSections();

        for (var i = 0; i < this.settings.neutralSections.length; i++) {
            this.settings.neutralSections[i] = this.getValidRectValue('neutralSections_' + i,
                    defaultNeutralSections[i]);
        }
        
        for (var i = 0; i < this.settings.participantSections.length; i++) {
            this.settings.participantSections[i] = this.getValidRectValue('participantSections_' + i,
                    defaultParticipantSections[i]);
        }

        this.applySettingSections();
    },

    getValidRectValue: function(id, defaultValue) {
        var rect = {x: 0, y: 0, width: 1, height: 1};
        for (var key in rect) {
            var userValue = jQuery('#' + id + '_' + key).val();
            rect[key] = userValue.trim() == '' ?
                    defaultValue[key] : this.getValidNumber(userValue);
        }
        rect.x = ml.Misc.limitFloat(rect.x, 0, this.size.x);
        rect.y = ml.Misc.limitFloat(rect.y, 0, this.size.y);
        rect.width = ml.Misc.limitFloat(rect.width, 0, this.size.x);
        rect.height = ml.Misc.limitFloat(rect.height, 0, this.size.y);
        
        if (rect.x + rect.width > this.size.x) {
            rect.width = this.size.x - rect.x;
        }
        if (rect.y + rect.height > this.size.y) {
            rect.height = this.size.y - rect.y;
        }
        
        return rect;
    },
    
    getValidNumber: function(v) {
        v = ig.game.strings.replaceAll(v, ',', '.');
        if ( ml.Misc.isNumber(v) ) {
            v = parseFloat(v);
        }
        else {
            v = 0;
        }
        return v;
    },
    
    getValidOpacityValue: function(v, defaultValue) {
        v = ig.game.strings.replaceAll(v, ',', '.');
        var vFloat = parseFloat(v);
        if ( v.length <= '0.000'.length &&
                ml.Misc.isNumber(vFloat) && vFloat >= 0 && vFloat <= 1 ) {
            v = vFloat;
        }
        else {
            v = defaultValue;
            ig.game.sounds.nocando.play();
        }
        return v;
    },
    
    saveSettings: function() {
        this.isEditingSettings = false;
        this.saveSetup();
    },

    resetParticipantValues: function(doTransmit) {
        if (this.settings.participantValueAtStart !== undefined) {
            for (var remoteId in this.participants) {
                this.participants[remoteId].value =
                        parseFloat(this.settings.participantValueAtStart);
            }

            if (doTransmit) {
                ig.game.websocketComs.transmitMultithingActivity(
                        'resetParticipantValues', this.placementId);
            }

            ig.game.sounds.click.play();
        }
    },

    handlePotentialParticipantValueCommand: function(s) {
        if (this.isOpen && s && this.settings.participantValueAtStart !== undefined &&
                this.participants[ig.game.ourPlayer.remoteId] ) {
        
            if (s == 'reset everyone') {
                this.resetParticipantValues(true);

            }
            else {
                var operators = ['plus', 'minus', 'times', 'divided_by', 'set'];
                s = s.toLowerCase().trim();
                s = ig.game.strings.replaceAll(s, 'divided by', 'divided_by');
                s = ig.game.strings.replaceAll(s, 'multiplied by', 'times');
                var parts = s.split(' ');

                if (parts.length >= 3) {
                    var operator, value, name;

                    if ( operators.indexOf(parts[0]) >= 0 ) {
                        operator = parts[0];
                        value = parts[1];
                        name = ml.Misc.joinRestOfArray(parts, ' ', 2);
                    }
                    else {
                        for (var i = 0; i < operators.length; i++) {
                            parts = s.split(' ' + operators[i] + ' ');
                            if (parts.length == 2) {
                                name = parts[0];
                                operator = operators[i];
                                value = parts[1];
                                break;
                            }
                        }
                    }
                    
                    if (value !== undefined) {
                        if ( ml.Misc.isNumber(value) ) { value = parseFloat(value); }
                        else { value = undefined; }
                    }

                    if (operator !== undefined && value !== undefined && name !== undefined) {
                        var remoteId = this.getParticipantRemoteIdByName(name);
                        if (remoteId) {
                            var participant = this.participants[remoteId];
                            var oldValue = participant.value;
                            switch (operator) {
                                case 'set':        participant.value = value;  break;
                                case 'plus':       participant.value += value; break;
                                case 'minus':      participant.value -= value; break;
                                case 'divided_by': participant.value /= value; break;
                                case 'times':      participant.value *= value; break;
                            }
                            
                            this.playParticipantValueChangeSound(oldValue, participant.value);
                                
                            ig.game.websocketComs.transmitMultithingActivity(
                                    'participantValueChange', this.placementId,
                                    {userId: remoteId, value: participant.value});
                        }

                    }
                    
                }
                
            }
        }
    },

    playParticipantValueChangeSound: function(oldValue, newValue) {
        var soundName;
        if      (newValue > oldValue) { soundName = 'score_up'; }
        else if (newValue < oldValue) { soundName = 'score_down'; }
        else                          { soundName = 'click'; }
        ig.game.sounds[soundName].play();
    },

    getParticipantRemoteIdByName: function(name) {
        var remoteId;
        if (name == 'me') {
            remoteId = ig.game.ourPlayer.remoteId;
        }
        else if ( name == 'you' && ml.Misc.getObjectLength(this.participants) == 2 ) {
            for (var thisRemoteId in this.participants) {
                if (thisRemoteId != ig.game.ourPlayer.remoteId) {
                    remoteId = thisRemoteId;
                    break;
                }
            }
        }
        else {
            for (var thisRemoteId in this.participants) {
                var user = ml.Misc.getUserByRemoteId(thisRemoteId);
                if ( user && user.screenName.indexOf(name) === 0 ) {
                    remoteId = thisRemoteId;
                    break;
                }
            }
        }
        return remoteId;
    },

    addParticipant: function(user) {
        var didAdd = false;
        if ( !this.participants[user.remoteId] && !this.getMaxParticipantsReached() ) {
            this.participants[user.remoteId] = {
                entity: user,
                index: this.getLowestFreeIndex()
            };
            if (user.isOurPlayer) {
                this.regenerateAllIsInOtherPrivateSection();
            }
            didAdd = true;
        }
        return didAdd;
    },

    getLowestFreeIndex: function() {
        var index = -1;
        for (var i = 0; i < this.settings.maxParticipants; i++) {
            var participant = this.getParticipantByIndex(i);
            if (!participant) {
                index = i;
                break;
            }
        }
        return index;
    },

    removeParticipant: function(user) {
        delete this.participants[user.remoteId];
        if (user.isOurPlayer) {
            this.regenerateAllIsInOtherPrivateSection();
        }
    },
    
    getWeAreMaster: function() {
        var master = this.getUserWhoViewedFirst();
        return Boolean(master && master.isOurPlayer);
    },

    getMaxParticipantsReached: function() {
        return Boolean( !this.settings.maxParticipants ||
                ml.Misc.getObjectLength(this.participants) >= parseInt(this.settings.maxParticipants) );
    },

    expandParticipantEntities: function() {
        for (var remoteId in this.participants) {
            var participant = this.participants[remoteId];
            if (!participant.entity) {
                participant.entity = ml.Misc.getUserByRemoteId(remoteId);
                if (!participant.entity) {
                    delete this.participants[remoteId];
                }
            }
        }
    },
    
    removeParticipantsWhoStoppedViewing: function() {
        for (var remoteId in this.participants) {
            if (remoteId != ig.game.ourPlayer.remoteId) {
                var participant = this.participants[remoteId];
                if (!participant.entity ||
                        participant.entity.viewingMultithingPlacementId != this.placementId) {
                    delete this.participants[remoteId];
                }
                else {
                    var user = ml.Misc.getUserByRemoteId(remoteId);
                    if (!user) {
                        delete this.participants[remoteId];
                    }
                }
            }
        }
    },

    close: function() {
        if (this.isOpen) {
            ig.game.multithingManager.stopUserViewing(ig.game.ourPlayer, this.placementId);

            this.isOpen = false;
            this.tidyUpEntities(this.staticItems);
            this.tidyUpEntities(this.movableItems);
            this.locallyEditableTexts = {};
            this.name = null;
            this.waitingForChangesSinceStartTimer = null;
            this.masterUser = null;
            this.placementId = null;
            this.movableItemsAtStart = [];
            this.staticItemsAtStart = [];
            this.askForChangesOnceEntitiesLoaded = false;
            this.sourceEntity = null;
            this.editHistory = [];

            this.localIdCounter = 0;
            this.staticItems = [];
            this.movableItems = [];
            this.draggedItem = null;
            this.dragStartTimer = null;
            this.dragStartPos = null;
            this.participants = {};
            this.menuEntries = null;

            this.parent();
            
            if (ig.ua.mobile) { ig.game.virtualJoystick.initClickSpots(); }
        }
    },

});

});