ig.module('game.ui.interactingdialog')
.requires('game.ui.components.uidialog')
.defines(function(){
"use strict";
window.InteractingDialog = UIDialog.extend({
    isOpen: false,

    open: function(text) {
        if (this.isOpen) { return; }
        this.isOpen = true;

        var dialogSize = {x: ig.system.width * .8, y: ig.system.height * .8};
        dialogSize.x = (dialogSize.x).limit(180, 300);

        var gameCanvas = jQuery('#' + ig.game.canvasId);
        var gameCanvasPos = gameCanvas.position();
        var gameCanvasWidth = gameCanvas.width(), gameCanvasHeight = gameCanvas.height();
        var x = gameCanvasPos.left + gameCanvasWidth / 2 - (dialogSize.x * ig.system.scale) / 2;
        var y = gameCanvasPos.top + gameCanvasHeight / 2 - (dialogSize.y * ig.system.scale) / 2;

        var borderSize = 1 * ig.system.scale;
        var containerStyle = 'font-size: ' + (6 + ig.system.scale * 2) + 'px;' +
                'border-top: ' + borderSize + 'px solid #eee; ' +
                'border-left: ' + borderSize + 'px solid #eee; ' +
                'border-bottom: ' + borderSize + 'px solid #eee; ' +
                'border-right: ' + borderSize + 'px solid #eee;' +
                'padding: ' + ig.system.scale * 3 + 'px';
        var html = '<textarea id="interactingDialog" autofocus="autofocus" maxlength="1000000" ' +
                'style="' + containerStyle + '">' + ig.game.strings.htmlEscape(text) + '</textarea>';

        var div = jQuery(html);
        div.attr('width', dialogSize.x * ig.system.scale);
        div.attr('height', dialogSize.y * ig.system.scale);
        div.css('width', dialogSize.x * ig.system.scale + 'px'); 
        div.css('height', dialogSize.y * ig.system.scale + 'px');
        div.css('left', x + 'px');
        div.css('top', y + 'px');
        div.appendTo('body');
    },

});

});