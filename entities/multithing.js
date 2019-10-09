ig.module('game.entities.immobile.multithing')
.requires('impact.entity')
.defines(function(){
'use strict';

window.EntityMultithing = ig.Entity.extend({

    size: {x: 38, y: 38},
    gravityFactor: 0,
    decorative: false,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    pseudoEntity: null,
    placementId: null,
    hasItsDialogOpen: false,
    isMultithing: true,
    
    init: function(x, y, settings) {
        if (settings.attributes) { this.attributes = settings.attributes; }
        this.parent(x, y, settings);
        this.placementId = x + '_' + y;
        this.addAnim('main', 1, [0]);
        this.addAnim('back', 1, [1]);
        if (!this.attributes) { this.attributes = {}; }
        if (this.attributes.inFront) { this.decorative = true; }
        this.pseudoEntity = {
            pos: this.getPosWithOffset( ig.game.cloneObject(this.pos) ), size: ig.game.cloneObject(this.size)
        };
    },

    update: function() {
        this.hasItsDialogOpen = ig.game.multithing && ig.game.multithing.isOpen &&
                ig.game.multithing.placementId == this.placementId;
                
        if (this.hasItsDialogOpen) {
            if (ig.game.actioninfo.isOpen) {
                ig.game.actioninfo.close();
            }
        }
        else {
            this.ourPlayerTouchingPrevious = this.ourPlayerTouching;
            this.ourPlayerTouching = ml.Misc.touchesCheckFullBodySize(this, ig.game.ourPlayer);

            if (this.ourPlayerTouching && !this.ourPlayerTouchingPrevious) {
                ig.game.actioninfo.open(this, this.pos.x, this.pos.y, this.givenName);
                ig.game.multithingAtOurPlayer = this;
            }
            else if (!this.ourPlayerTouching && this.ourPlayerTouchingPrevious) {
                ig.game.actioninfo.close();
                ig.game.multithingAtOurPlayer = null;
            }
        }
        
        ig.game.decorator.handleAttributeEffects(this.pseudoEntity, this);
    },

    draw: function() {
        var pos = this.getPosWithOffset( {x: this.pos.x - ig.game._rscreen.x, y: this.pos.y - ig.game._rscreen.y} );
        this.anims.main.draw(pos.x, pos.y);
    },
    
    openDialogIfNeeded: function() {
        if (ig.ua.iPhone) {
            ig.game.ourPlayer.say('this requires a bigger view');
        }
        else if (ig.game.multithing && !ig.game.multithing.isOpen) {
            ig.game.multithing.open(this, !this.attributes.noDustTrails);
        }
    },

    getPosWithOffset: function(pos) {
        if (this.size.x > ig.game.tileSize) { pos.x -= Math.floor(this.size.x / 4); }
        else if (this.size.x < ig.game.tileSize) { pos.x += Math.floor( (ig.game.tileSize - this.size.x) / 2 ); }
        pos.y -= Math.floor(this.size.y - ig.game.tileSize);
        return pos;
    },
    
    tidyUp: function() {
        if (ig.game.multithing && ig.game.multithing.isOpen &&
                ig.game.multithing.placementId == this.placementId) {
            ig.game.multithing.close();
        }
        if (ig.game.multithingAtOurPlayer &&
                ig.game.multithingAtOurPlayer.placementId == this.placementId) {
            ig.game.multithingAtOurPlayer = null;
        }
    },

});

});