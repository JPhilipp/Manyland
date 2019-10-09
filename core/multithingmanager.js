ig.module('game.core.multithingmanager')
.requires()
.defines(function(){
'use strict';
window.MultithingManager = ig.Class.extend({

    receiveRemoteMessage: function(originator, packedMessage) {
        if ( originator && packedMessage && Array.isArray(packedMessage) && packedMessage.length == 3 ) {
            var mode =        packedMessage[0];
            var placementId = packedMessage[1];
            var data =        packedMessage[2];
            if (mode == 'i') { mode = 'itemChange'; }
            if (data.s !== undefined) { data.state = data.s; delete data.s; }
            if (data.r !== undefined) { data.rot = data.r; delete data.r; }
            
            if (mode == 'startViewing') {
                if (originator.isOurPlayer) {
                    originator.viewingMultithingSince = data.viewingMultithingSince;
                }
                else {
                    originator.viewingMultithingPlacementId = placementId;
                    originator.viewingMultithingSince = data.viewingMultithingSince;
                    ig.game.sounds.playIfOnScreen(ig.game.sounds.shortWhoosh, originator);
                }
            }
            else if (mode == 'stopViewing') {
                this.stopUserViewing(originator);
            }
            else if (ig.game.multithing) {
                if (ig.game.multithing.isOpen && ig.game.multithing.placementId == placementId) {
                    ig.game.multithing.receiveRemoteData(originator, mode, placementId, data);
                }
                else {
                    var entity = this.getEntityByPlacementId(placementId);
                    if (entity) {
                        var deviation = 8, opacity = 65, stepsDivider = 15, drawLighter = true;
                        ig.game.decorator.drawTrail(originator, null, entity.homeMapLocation, true,
                                deviation, opacity, stepsDivider, drawLighter);
                        ig.game.sounds.playWithVol(ig.game.sounds.shortWhoosh, .35);
                    }
                }
            }
        }
    },

    getEntityByPlacementId: function(placementId) {
        var targetEntity;
        if (ig.game.entitiesByType) {
            var layers = ['default', 'decoEffects'];
            for (var layerI = 0; layerI < layers.length; layerI++) {
                var layer = ig.game.entitiesByType[ layers[layerI] ];
                
                if (layer) {
                    for (var i = 0; i < layer.length; i++) {
                        var entity = layer[i];
                        if (!entity._killed && entity.isMultithing &&
                                entity.placementId == placementId) {
                            targetEntity = entity;
                            break;
                        }
                    }
                }

            }
        }
        return targetEntity;
    },
    
    addParticipant: function(user) {
        var user = ml.Misc.getUserByRemoteId(user.remoteId);
        if (user && ig.game.multithing && ig.game.multithing.isOpen) {
            user.hasMultithingAddButton = false;
            var didAdd = ig.game.multithing.addParticipant(user);

            if (didAdd) {
                ig.game.websocketComs.transmitMultithingActivity(
                        'addParticipant', ig.game.multithing.placementId,
                        {userId: user.remoteId});
            }
            else {
                ig.game.ourPlayer.say('the participants limit has been reached');
            }

            ig.game.sounds.success.play();
        }
    },
    
    removeParticipant: function(user) {
        var user = ml.Misc.getUserByRemoteId(user.remoteId);
        if (user && ig.game.multithing && ig.game.multithing.isOpen) {
            user.hasMultithingAddButton = false;
            ig.game.multithing.removeParticipant(user);

            ig.game.websocketComs.transmitMultithingActivity(
                    'removeParticipant', ig.game.multithing.placementId,
                    {userId: user.remoteId});

            ig.game.sounds.pickup.play();
        }
    },

    updateUserDetails: function(user) {
        if (ig.game.multithing) {

            if (user.viewingMultithingPlacementId) {
                if (user.isOurPlayer) {
                    if (!user.multithingPos) {
                        var entity = this.getEntityByPlacementId(user.viewingMultithingPlacementId);
                        if (entity) { user.multithingPos = ig.game.cloneObject(entity.pos); }
                    }
                    if (user.multithingPos) {
                        var distance = ml.Misc.distanceBetween(ig.game.ourPlayer.pos, user.multithingPos);
                        if (distance >= 350) { ig.game.multithing.close(); }
                    }
                }
                else  {
                    if (!user.viewingMultithingName) {
                        var entity = this.getEntityByPlacementId(user.viewingMultithingPlacementId);
                        if (entity) {
                            user.viewingMultithingName = ig.game.strings.cutLength(entity.givenName, 15);
                            user.hasMultithingAddButton = ig.game.multithing.isOpen &&
                                    ig.game.multithing.placementId == user.viewingMultithingPlacementId &&
                                    ig.game.multithing.getWeAreMaster() &&
                                    !ig.game.multithing.getMaxParticipantsReached();
                        }
                    }
                    else if (user.viewingMultithingSince && user.hasMultithingAddButton) {
                        var secondsAgo = ( Date.now() - user.viewingMultithingSince ) / 1000;
                        if (secondsAgo >= 15) {
                            user.hasMultithingAddButton = false;
                        }
                    }
                }

            }
            else if (user.viewingMultithingName) {
                delete user.viewingMultithingName;
                delete user.hasMultithingAddButton;
                delete user.multithingPos;
                
            }

        }
    },
    
    stopUserViewing: function(user, placementId) {
        delete user.viewingMultithingPlacementId;
        delete user.viewingMultithingSince;
        delete user.viewingMultithingName;
        delete user.hasMultithingAddButton;
        delete user.multithingPos;

        ig.game.sounds.playIfOnScreen(ig.game.sounds.shortWhoosh, user, .35);
        
        if (user.isOurPlayer) {
            ig.game.websocketComs.transmitMultithingActivity(
                    'stopViewing', placementId);
        }
    },
    
    toggleParticipation: function(userId) {
        console.log('toggleParticipation', userId);
    },
 
});

});
