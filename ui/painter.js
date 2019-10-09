ig.module('game.ui.painter')
.requires(
    'game.ui.interactingdialog',
    'game.ui.thingreferencesdialog'
)
.defines(function(){
window.Painter = ig.Class.extend({

    types: {
        solidGroup:         {title: 'solid', iconRow: 1},
            solid:          {title: 'solid', key: 'SOLID', iconRow: 1, exampleRow: 1, requiredBorders: 3, parent: 'solidGroup'},
            passable:       {title: 'one-way', key: 'PASS', requiredBorders: 3, hasDirection: true, iconRow: 18, exampleRow: 19, parent: 'solidGroup'},
            sticky:         {title: 'Sticky', key: 'STICKY', exampleRow: 47, iconRow: 9, parent: 'solidGroup'},
        backGroup:          {title: 'back', iconRow: 22},
            thingBack:      {title: 'back', key: 'DECOBG', exampleRow: 35, iconRow: 22, parent: 'backGroup'},
            farBack:        {title: 'far back', key: 'FARBACK', iconRow: 22, requiredBorders: 0, tileSize: {width: 19 * 2, height: 19 * 2}, hasOptionalCells: true, parent: 'backGroup'},
        thingGroup:         {title: 'thing', iconRow: 14},
            thing:          {title: 'thing', key: 'DECO', requiredBorders: 1, exampleRow: 15, parent: 'thingGroup'},
            thingFront:     {title: 'thing in front', key: 'DECOFG', requiredBorders: 1, exampleRow: 16, parent: 'thingGroup'},
        changingThingGroup: {title: 'changing thing', iconRow: 15},
            animatedThing:  {title: 'changing thing', key: 'DECOANIM', isAnimated: true, requiredBorders: 1, iconRow: 15, exampleRow: 36, parent: 'changingThingGroup'},
            touchableThing: {title: 'changing on touch', key: 'DECOTCH', isAnimated: true, requiredBorders: 2, exampleRow: 36, parent: 'changingThingGroup'},
            lively:         {title: 'lively thing', key: 'LIVELY', exampleRow: 42, isAnimated: true, requiredBorders: 0, parent: 'changingThingGroup'},
            sparkling:      {title: 'sparkling', key: 'SPARKLING', isAnimated: true, requiredBorders: 0, iconRow: 15, exampleRow: 54, parent: 'changingThingGroup'},
            thrower:        {title: 'item thrower', key: 'THROWER', iconRow: 37, exampleRow: 41, isAnimated: true, requiredBorders: 1, hasDirection: true, hasMultiDirection: true, needsGoodVisibility: true, parent: 'changingThingGroup'},
        bigThingGroup:      {title: 'big thing', iconRow: 44},
            bigThing:       {title: 'big thing', key: 'DECOBIG', exampleRow: 59, requiredBorders: 0, tileSize: {width: 38, height: 38}, autoCropped: true, iconRow: 44, parent: 'bigThingGroup'},
            backAndFrontThing: {title: 'back + front', key: 'DECOFB', requiredBorders: 1, exampleRow: 21, isAnimated: true, tileSize: {width: 38, height: 38}, autoCropped: true, parent: 'bigThingGroup'},
            transforming:   {title: 'transforming', key: 'TRANSFORM', requiredBorders: 0, hasOptionalCells: true, tileSize: {width: 38, height: 38}, isMultiAnimated: true, needsGoodVisibility: true, parent: 'bigThingGroup'},
            veryBigThing: {title: 'very big thing', key: 'DECOVBIG', exampleRow: 59, requiredBorders: 0, tileSize: {width: 57, height: 57}, autoCropped: true, iconRow: 44, parent: 'bigThingGroup'},
        livingGroup:        {title: 'living', iconRow: 5},
            living:         {title: 'flipping living', key: 'LIVING', flips: true, requiredBorders: 0, iconRow: 5, exampleRow: 39, parent: 'livingGroup', tileSize: {width: 29, height: 29}, autoCropped: true},
            livingChanging: {title: 'changing living', key: 'LIVANIM', requiredBorders: 0, iconRow: 5, exampleRow: 39, isAnimated: true, parent: 'livingGroup', tileSize: {width: 29, height: 29}, autoCropped: true},
            livingMoving:   {title: 'moving living', key: 'LIVMOV', requiredBorders: 0, iconRow: 5, exampleRow: 37, isAnimated: true, parent: 'livingGroup', tileSize: {width: 29, height: 29}, autoCropped: true},
        holdableGroup:      {title: 'holdable', iconRow: 17},
            holdableItem:   {title: 'item', key: 'STACKHOLD', requiredBorders: 0, exampleRow: 25, autoCropped: true, parent: 'holdableGroup'},
            equipment:      {title: 'equipment', key: 'EQUIPMENT', requiredBorders: 0, exampleRow: 25, autoCropped: true, canHaveMotionId: true, parent: 'holdableGroup'},
            emitter:        {title: 'emitter', key: 'EMITTER', requiredBorders: 0, exampleRow: 25, autoCropped: true, isAnimated: true, canHaveMotionId: true, parent: 'holdableGroup'},
            consumable:     {title: 'consumable', key: 'CONSUMAB', requiredBorders: 0, exampleRow: 25, autoCropped: true, canHaveMotionId: true, parent: 'holdableGroup'},
            aimable:        {title: 'aimable', key: 'AIMABLE', requiredBorders: 0, autoCropped: true, isAnimated: true, parent: 'holdableGroup'},
            hook:           {title: 'swing line', key: 'HOOK', requiredBorders: 0, exampleRow: 25, autoCropped: true, parent: 'holdableGroup'},
            liner:          {title: 'liner', key: 'LINER', requiredBorders: 0, exampleRow: 25, autoCropped: true, parent: 'holdableGroup'},
        climbable:      {title: 'climbable', key: 'CLIMB', iconRow: 19, requiredBorders: 2, exampleRow: 20},
        crumblingGroup:     {title: 'crumbling', iconRow: 14},
            crumbling:      {title: 'crumbling', key: 'CRUMBLING', exampleRow: 14, parent: 'crumblingGroup'},
            flexible:       {title: 'flexible', key: 'FLEXIBLE', exampleRow: 53, isAnimated: true, requiredBorders: 1, parent: 'crumblingGroup'},
        pushy:              {title: 'pushing', key: 'PUSH', hasDirection: true, iconRow: 16, exampleRow: 17},
        bouncyGroup:        {title: 'bouncy', iconRow: 10},
            bouncy:         {title: 'bouncy', key: 'BOUNCEY', hasDirection: true, exampleRow: 10, parent: 'bouncyGroup'},
            tiltedBouncy:   {title: 'tilted bouncy', key: 'BOUNCEYT', hasDirection: true, exampleRow: 11, parent: 'bouncyGroup', isDiagonal: true},
        movingGroup:        {title: 'moving', key: 'MOVING', iconRow: 3, exampleRow: 3},
            moving:            {title: 'moving', key: 'MOVING', exampleRow: 3, parent: 'movingGroup'},
            mover:             {title: 'mover', key: 'MOVER', requiredBorders: 0, parent: 'movingGroup'},
        slidey:             {title: 'slidey', key: 'SLIDEY', iconRow: 7, exampleRow: 7},
        slopeGroup:         {title: 'slope', iconRow: 11},
            slope:          {title: 'slope', key: 'SLOPE', isDiagonal: true, hasDirection: true, exampleRow: 12, parent: 'slopeGroup', requiredBorders: 2},
            slideySlope:    {title: 'slidey slope', key: 'SLSLOPE', isDiagonal: true, hasDirection: true, exampleRow: 13, parent: 'slopeGroup', requiredBorders: 2},
            passableSlope:  {title: 'passable slope', key: 'PASSSLOPE', isDiagonal: true, hasDirection: true, exampleRow: 12, parent: 'slopeGroup', requiredBorders: 0},
        liquid:             {title: 'liquid', key: 'LIQUID', iconRow: 26, exampleRow: 27, isAnimated: true, requiredBorders: 3},
        transportGroup:     {title: 'transporting', iconRow: 20, requiredBorders: 3},
            transport:      {title: 'transporting', key: 'PORTAL', iconRow: 20, isAnimated: true, requiredBorders: 3, parent: 'transportGroup'},
            dirTransport:   {title: 'dir. transport.', key: 'PORTALDIR', iconRow: 20, isAnimated: true, hasDirection: true, requiredBorders: 3, parent: 'transportGroup'},
        activatorGroup:         {title: 'activator', iconRow: 8, exampleRow: 8, requiredBorders: 0},
            activator:          {title: 'activator', key: 'ACTIVATOR', iconRow: 8, exampleRow: 8, requiredBorders: 0, parent: 'activatorGroup'},
            activatableOpen:    {title: 'open on activate', key: 'OPENABLE', exampleRow: 9, parent: 'activatorGroup'},
            activatableThing: {title: 'chn. on activator', key: 'DECOACT', isAnimated: true, requiredBorders: 2, exampleRow: 38, parent: 'activatorGroup'},
            walkable:       {title: 'walkable', key: 'WALKABLE', exampleRow: 48, parent: 'backGroup'},
        bodyGroup:          {title: 'body', iconRow: 12},
            body:               { title: 'body', key: 'STACKWEARB', requiredBorders: 0, isMultiAnimated: true, needsGoodVisibility: true, tileSize: {width: 29, height: 29}, parent: 'bodyGroup', autoCropped: true },
            motion:             {title: 'motion', key: 'MOTION', requiredBorders: 0, tileSize: {width: 29, height: 29}, isAnimated: true, autoCropped: true, parent: 'bodyGroup' },
        wearableGroup:      {title: 'wearable', iconRow: 4},
            wearableBig:        {title: 'wearable', key: 'STACKWEAR', requiredBorders: 0, isAnimated: true, exampleRow: 34, tileSize: {width: 38, height: 38}, parent: 'wearableGroup' },
            wearable:           {title: 'smaller wearable', key: 'STACKWEAR', requiredBorders: 0, isAnimated: true, exampleRow: 34, parent: 'wearableGroup'},
        instrument:         {title: 'instrument', key: 'STACKINSTR', requiredBorders: 0, iconRow: 36, exampleRow: 45, autoCropped: true},
        soundGroup:         {title: 'music', iconRow: 28},
            music:              {title: 'music', key: 'MUSIC', iconRow: 28, exampleRow: 44, requiredBorders: 0, needsGoodVisibility: true, parent: 'soundGroup'},
            musicSheet:         {title: 'music sheet', key: 'MUSICSHEET', iconRow: 28, isMultiAnimated: true, requiredBorders: 0, hasOptionalCells: true, tileSize: {width: 32, height: 36}, parent: 'soundGroup'},
        lightGroup:         {title: 'light', iconRow: 24},
            light:          {title: 'light', key: 'LIGHT', exampleRow: 33, requiredBorders: 0, parent: 'lightGroup', needsGoodVisibility: true},
            lighttop:       {title: 'top light', key: 'LIGHTTOP', exampleRow: 5, requiredBorders: 0, parent: 'lightGroup', needsGoodVisibility: true},
            fillLight:       {title: 'fill light', key: 'FILLLIGHT', exampleRow: 5, requiredBorders: 0, parent: 'lightGroup', needsGoodVisibility: true},
            vignette:        {title: 'surround light', key: 'VIGNETTE', exampleRow: 5, requiredBorders: 0, parent: 'lightGroup', needsGoodVisibility: true},
            glow:           {title: 'light glow', key: 'GLOW', exampleRow: 6, requiredBorders: 0, parent: 'lightGroup', isAnimated: true, tileSize: {width: 38, height: 38}},
        environmentGroup:      {title: 'environment', iconRow: 33, exampleRow: 46},
            environment:       {title: 'environment', key: 'ENVIRONM', requiredBorders: 0, iconRow: 33, exampleRow: 46, needsGoodVisibility: true, parent: 'environmentGroup'},
            interactiveEnvironment: {title: 'Interactive Env.', key: 'INTERENV', requiredBorders: 0, exampleRow: 51, parent: 'environmentGroup'},
        mountableGroup:     {title: 'mountable', iconRow: 35},
            mountableGround: {title: 'mountable', key: 'MNTGROUND', iconRow: 35, requiredBorders: 0, needsGoodVisibility: true, tileSize: {width: 38, height: 38}, isAnimated: true, isMountable: true, parent: 'mountableGroup', autoCropped: true},
            mountableAir:    {title: 'flying mountable', key: 'MNTAIR', iconRow: 35, requiredBorders: 0, needsGoodVisibility: true, tileSize: {width: 38, height: 38}, isAnimated: true, isMountable: true, parent: 'mountableGroup', autoCropped: true},
        gatherable:         {title: 'Gatherable', key: 'GATHER', isAnimated: true, requiredBorders: 0, exampleRow: 43, iconRow: 43},
        placesGroup:        {title: 'Places', iconRow: 39},
            pointer:        {title: 'pointer', key: 'POINTER', exampleRow: 24,  requiredBorders: 0, tileSize: {width: 38, height: 38}, parent: 'placesGroup'},
            placeName:      {title: 'place name', key: 'PLACENAME', exampleRow: 49, requiredBorders: 0, autoCropped: true, tileSize: {width: 38, height: 38}, parent: 'placesGroup'},
        harmfulGroup:       {title: 'harmful', iconRow: 2},
            harmful:        {title: 'harmful', key: 'HARM', iconRow: 27, exampleRow: 28, parent: 'harmfulGroup', needsGoodVisibility: true},
            harmfulAnim:    {title: 'changing harmful', key: 'HARMANIM', isAnimated: true, iconRow: 27, exampleRow: 28, parent: 'harmfulGroup', needsGoodVisibility: true},
            deadly:         {title: 'deadly', key: 'DEADLY', iconRow: 2, exampleRow: 2, parent: 'harmfulGroup', needsGoodVisibility: true},
            deadlyMoving:   {title: 'deadly moving', key: 'DEADLYMV', iconRow: 4, exampleRow: 4, parent: 'harmfulGroup', needsGoodVisibility: true},
            deadlyEmerge:   {title: 'deadly emerging', key: 'DEADLYEM', hasDirection: true, iconRow: 25, exampleRow: 26, parent: 'harmfulGroup', needsGoodVisibility: true},
        viewableGroup:      {title: 'viewable', iconRow: 34, exampleRow: 40},
            viewable:       { title: 'viewable', key: 'VIEWABLE', exampleRow: 40, isMultiAnimated: true, tileSize: {width: 19 * 2, height: 19 * 2}, requiredBorders: 0, hasOptionalCells: true, parent: 'viewableGroup'},
            medium:         {title: 'medium', key: 'MEDIUM', requiredBorders: 0, parent: 'viewableGroup'},
        textualGroup:       {title: 'Textual', iconRow: 40},
            readable:       {title: 'Readable', key: 'READABLE', exampleRow: 50, requiredBorders: 0, parent: 'textualGroup'},
            writable:       {title: 'Writable', key: 'WRITABLE', requiredBorders: 0, parent: 'textualGroup', rankNeeded: 2},
        holderGroup:        {title: 'Holder', iconRow: 29},
            holder:            {title: 'holder', key: 'HOLDER', requiredBorders: 0, isAnimated: true, needsGoodVisibility: true, tileSize: {width: 29, height: 29}, parent: 'holderGroup'},
            multithing:        {title: 'multi', key: 'MULTITHING', exampleRow: 60, requiredBorders: 0, isAnimated: true, tileSize: {width: 38, height: 38}, parent: 'holderGroup'},
        interactingGroup:   {title: 'interacting', iconRow: 42 },
            interacting:       {title: 'interacting', key: 'INTERACT', exampleRow: 52, requiredBorders: 0, iconRow: 5, isAnimated: true, tileSize: {width: 29, height: 29}, parent: 'interactingGroup'},
            interactingMotion: {title: 'interact. motion', key: 'INTERMOT', requiredBorders: 0, tileSize: {width: 29, height: 29}, isAnimated: true, parent: 'interactingGroup'},
            helper:            {title: 'helper', key: 'HELPER', requiredBorders: 0, parent: 'interactingGroup', exampleRow: 58},
        dynamicThing:       {title: 'dynamic', key: 'DYNATHING', isMultiAnimated: true, iconRow: 38, requiredBorders: 0, tileSize: {width: 29, height: 29}, hasOptionalCells: true},
        happeningGroup:     {title: 'happening', iconRow: 47},
            happening:      {title: 'happening', key: 'HAPPENING', isMultiAnimated: true, irequiredBorders: 0, tileSize: {width: 29, height: 29}, hasOptionalCells: true, parent: 'happeningGroup'},
            brain:          {title: 'brain', key: 'BRAIN', exampleRow: 55, requiredBorders: 0, parent: 'happeningGroup'},
            changer:        {title: 'changer', key: 'CHANGER', exampleRow: 56, requiredBorders: 0, parent: 'happeningGroup'},
        mift:               {title: 'mift', key: 'MIFT', iconRow: 46, exampleRow: 57, requiredBorders: 0, rankNeeded: 2},
    },

    isRunning                  : false,
    hasBeenInited              : false,
    tileWidthDefault           : 19,
    tileHeightDefault          : 19,
    tileWidth                  : null,
    tileHeight                 : null,
    pageZoom                   : 1,
    drawingZoom                : 8,
    drawingZoomDefault         : 8,
    selectedColor              : 0,
    selectedCell               : 0,
    selectedPalettePage        : 0,
    palettePagesMax            : 5,
    colorsPerPalettePage       : 11,
    maxColors                  : 11 * 5 + 1,
    transparentIndex           : 11,
    secondaryColorIndex        : 11,
    maxCellsDefault            : 2,
    maxCells                   : 2,
    previewCell                : 0,
    closedDialogCallback       : null,
    cursorX                    : null,
    cursorY                    : null,
    cursorIsDown               : false,
    cursorRightIsDown          : false,
    cursorDoubleClicked        : false,
    inputBoxId                 : 'nameInput',
    inputBoxIsOpen             : false,
    context                    : null,
    images                     : {},
    imagePath                  : null,
    mode                       : 'default',
    modeOld                    : 'default',
    cursorWasUpSinceMode       : true,
    positionOnPicker           : [],
    positionOnPickerTypeB      : {},
    typePickerRowsPerColumn    : 17,
    canvasSnapshot             : null,
    timeouts                   : {preview: null, staticTemplateCell: null, handleClicks: null, switchToNextTypeInGroup: null, drawBig: null},
    handleClicks               : false,
    cursorMode                 : 'default',
    oldData                    : {name: null, type: null, direction: null},
    clipboardPixels            : null,
    dataHistory                : [],
    dataHistoryMax             : 50,
    dataHistoryIndex           : 0,
    directionMax               : 4,
    multiDirectionMax          : 8,
    fadeOpacity                : 0,
    drawSymmetric              : false,
    drawImageMessageMaxOpacity : .6,
    callbackContext            : null,
    previewIsFlipped           : false,
    minSizeForItems            : 2,
    minSizeForThings           : 2,
    minSizeForBodies           : 11,
    minSizeForMountableAirs    : 8,
    bodyCells                  : {'stand': 0, 'walk': 1, 'jump': 2, 'fall': 3, 'climb': 4, 'create': 5, 'sit': 6, 'blink': 7, 'talk': 8},
    bodyCellsOld               : {'stand': 0, 'walk': 1, 'jump': 2, 'fall': 3, 'climb': 4, 'create': 5, 'blink': 6},
    previewColorTargetIndex    : null,
    previewColor               : {r: 0, g: 0, b: 0, alpha: 1},
    backgroundRgb              : {r: 154, g: 150, b: 145, alpha: 1},
    canvasOverlayRgb           : {r: 125, g: 125, b: 125, alpha: 1},
    changeColorModes           : {},
    moderatorRank              : 10,
    spritesheetImages          : {},
    colorsBeforeColorChanges   : null,
    previewColors              : null,
    areas                      : null,
    data                       : null,
    defaultFont                : null,
    inputBoxBackgroundColor    : 'rgb(182,179,175)',
    useColorChangeStrong       : true,
    fontOffsetY                : 0,
    staticTemplateCell         : 1,
    optionalCellCount          : 2,
    optionalCellCountMax       : 6,
    singleColorIndexToChange   : null,
    avatarTemplatePosition     : {x: 0, y: 0, rotation: 0},
    typeToSetAfterLoading      : null,
    propToSetAfterLoading      : null,
    colorPickerType            : 'b',
    colorPickerB               : {rgbaBase: null, rgbaTint: null, baseY: null, tintX: null},
    updateColorPickNextTime    : true,
    didWheelThisSession        : false,
    interactingDialog          : null,
    thingReferencesDialog      : null,
    didShowCopyrightAlert      : false,
    didSetDirection            : false,
    lastPointDrawn             : {x: null, y: null},
    lKeyIsPressed              : false,
    shiftKeyIsPressed          : false,
    lastPixelSeenOnClick       : {x: null, y: null},
    typesWithSoundId           : ['DYNATHING', 'LIVING', 'LIVANIM', 'MOTION', 'STACKHOLD', 'STACKWEAR', 'DECOANIM', 'INTERMOT', 'DECOTCH',
                                  'EQUIPMENT', 'EMITTER', 'CONSUMAB', 'GATHER', 'MNTGROUND', 'MNTAIR', 'ENVIRONM', 'VIEWABLE', 'ACTIVATOR',
                                  'OPENABLE', 'HOLDER', 'BRAIN', 'CHANGER', 'MIFT', 'HAPPENING', 'MOVER', 'FARBACK', 'TRANSFORM'],
    brushType: 0,
    brushTypesMax: 5,
    instruments                : [],
    musicSheetSpecialIndex     : {10: 'terminator'},
    musicSheetTimer            : undefined,
    noteDelayMSDefault         : 250,
    noteDelayMSMin             : 50,
    noteDelayMSMax             : 1000,
    currentLayer               : 0,
    dynamicTextMaxLength       : 5000,
    farBackTextMaxLength       : 5000,
    miftTextMaxLength          : 60,
    isCurrentlySavingToServer  : false,
    showGrid                   : false,
    painterCanvasSize          : {x:166, y: 240},
    writableRightsSetting      : 0,
    alertedToWhyMiftsAreFree   : false,
    typesWithLivePreview:      ['dynamicThing', 'farBack', 'lively'],
    somethingChangedSinceLivePreview: false,
    farBackCellsMax: 9,
    transformingCellsMax: 4,
    didInformAboutToAreaAttribute: false,
    doCloneContents: false,
    lastClonedFromId: null,

    init: function(backgroundImage) {
        if (!this.hasBeenInited) {
            // this.clearEmergencyBackup();

            this.imagePath = '/media/painter/';
            if (!ml.Misc.isRunningLocally()) { this.imagePath = 'http://static.manyland.com' + this.imagePath; }
            
            this.initInstruments();
            
            this.pageZoom = ig.system.scale;

            this.backgroundImage = backgroundImage;
            
            if (ig.ua.mobile && !ig.game.hasMinfinity) { delete this.types.mift; }

            this.initTypes();
            this.initSettingValues();

            this.secondaryColorIndex = this.transparentIndex;
            this.initChangeColorModes();
        }
    },

    initTypes: function() {
        for (var key in this.types) {
            var thisType = this.types[key];
            if (thisType.tileSize == undefined || thisType.tileSize == null) {
                thisType.tileSize = {width: this.tileWidthDefault, height: this.tileHeightDefault};
            }
        }
    },

    initInstruments: function() {
        this.instruments = this.getObjectPropertiesAsArray(ig.game.sounds.instruments);
        var musicSheetSpecialIndexNumber = 10;
        this.instruments.splice(musicSheetSpecialIndexNumber, 0, null);
        this.instruments.splice(this.transparentIndex, 0, null);
    },

    initAreas: function() {
        var specialTileSize = this.data && this.data.type && this.types[this.data.type].tileSize ? this.types[this.data.type].tileSize : null;
        if (specialTileSize) {
            this.tileWidth = specialTileSize.width;
            this.tileHeight = specialTileSize.height;
        }
        else {
            this.tileWidth = this.tileWidthDefault;
            this.tileHeight = this.tileHeightDefault;
        }
        var isMotion = this.data && (this.data.type == 'motion' || this.data.type == 'interactingMotion');

        if (this.tileWidth == ig.game.tileSizeBig && this.tileHeight == ig.game.tileSizeBig) { this.drawingZoom = 4; }
        else if (this.tileWidth == ig.game.tileSizeVeryBig && this.tileHeight == ig.game.tileSizeVeryBig) { this.drawingZoom = 2.665; }
        else if ( (this.tileWidth == 29 && this.tileHeight == 29) || isMotion ) { this.drawingZoom = 5.23; }
        else if (this.tileWidth == 32 && this.tileHeight == 36) { this.drawingZoom = 4.23; }
        else if (this.tileWidth == 19 * 4) { this.drawingZoom = 2; }
        else { this.drawingZoom = this.drawingZoomDefault; }

        var all = {x1: 0, y1: 0, width: 166, height: 261};
        var drawing = {width: this.tileWidth * this.drawingZoom - 1, height: this.tileHeight * this.drawingZoom - 1};
        var drawingMax = {width: this.tileWidthDefault * this.drawingZoom - 1, height: this.tileHeightDefault * this.drawingZoom - 1};
        if (this.drawingZoom != this.drawingZoomDefault) {
            drawingMax = {width: this.tileWidth * this.drawingZoom - 1, height: this.tileHeight * this.drawingZoom - 1};

            if (isMotion) {
                drawingMax = {width: this.types.body.tileSize.width * this.drawingZoom, height: this.types.body.tileSize.height * this.drawingZoom - 1 + 1};
                drawing.height += 1;
            }
        }

        var drawingYStatic = 13;
        var drawingOffset = {x1: all.width / 2 - drawing.width / 2, y1: drawingYStatic + drawingMax.height - drawing.height};
        var drawingMaxOffset = {x1: 7, y1: drawingYStatic};

        var drawBigMessage = {width: 61, height: 15};

        this.areas = {
            all: all,
            drawing: drawing,
            drawingMax: drawingMax,
            drawingOffset: drawingOffset,
            drawingMaxOffset: drawingMaxOffset,
            typeIcon: {width: 13, height: 10},
            typePickerGrid: {width: 81, height: 10},
            drawBigMessage: {
                    x1: drawing.width / 2 + drawingOffset.x1 - drawBigMessage.width / 2,
                    y1: drawing.height / 2 + drawingOffset.y1 - drawBigMessage.height / 2,
                    width: drawBigMessage.width, height: drawBigMessage.height},
            textBoxPadding: {x1: 2, y1: 6},
            colorPicker: {x1: drawingMaxOffset.x1, y1: 168, x2: drawingMaxOffset.x1 + drawingMax.width, y2: 194},
            typePicker: {x1: 1, y1: 16, width: 164, y2: 177},
            typePickerSelections: {x1: 2, y1: 27, width: 162, height: 170},
            typePickerSingleSelection: {x1: 3, y1: 3, width: 17, height: 17},
            closeButton: {x1: 155, y1: 2, x2: 163, y2: 10},
            colorPickerDialog: {x1: 1, y1: 2, x2: 163, y2: 169},
            colorPickerDialogInner: {x1: 2, y1: 2, x2: 163, y2: 171},
            colorPickerCloseButton: {x1: 157, y1: 4, x2: 163, y2: 11},
            colorPickerDot: {width: 2, height: 2},

            colorPickerTypeToggler: {x1: 3, y1: 4, x2: 9, y2: 11},

            colorPickerB_base: {x1: 148, y1: 13, x2: 163, y2: 172},
            colorPickerB_tintOff: {x1: 15, y1: 4, x2: 23, y2: 10},
            colorPickerB_tint: {x1: 25, y1: 4, x2: 146, y2: 10},
            colorPickerB_main: {x1: 2, y1: 13, x2: 147, y2: 173},

            palettePageButton: {x1: 146, y1: 184, width: 11, height: 9},            

            paletteBox: {width: 12, height: 12},
            paletteBoxes: {x1: 8, y1: 168},
            changeColor: {x1: 4, y1: 115, x2: 161, y2: 232},
            changeColorCloseButton: {x1: 144, y1: 116, x2: 157, y2: 127},
            changeColorOffset: {x1: 5, y1: 4, width: 39, height: 33},
            changeColorToggleStrength: {x1: 132, y1: 94, width: 4, height: 4},
            betweenColorAndColorPicker: {y1: 182},
            menu: {x1: 6, y1: 9, width: 98, height: 165},
            menuButton: {x1: 7, y1: 3, x2: 17, y2: 9},
            menuSymmetry: {x1: 44, y1: 34, x2: 0, y2: 0},
            mirrorFlipRotateSeparator1: {x1: 37, y1: 0},
            mirrorFlipRotateSeparator2: {x1: 63, y1: 0},
            symmetryLine: {x1: 82, y1: 13, x2: 83, y2: 164},
            cell0: {x1: 21, y1: 3, width: 37, height: 10},
            cell1: {x1: 59, y1: 3, width: 36, height: 10},
            
            playMusicButton: {x1: 30, y1: 217, width: 30, height: 9},
            convertMusicSheetButton: {x1: 30, y1: 227, width: 30, height: 9},

            sizeButton: {x1: 30, y1: 217, width: 30, height: 9},
            needsButton: {x1: 30, y1: 227, width: 30, height: 9},
            
            timeButton: {x1: 30, y1: 217, width: 30, height: 9},
            givesButton: {x1: 30, y1: 227, width: 30, height: 9},

            useAtGetButtons: {x1: 24, y1: 2, width: 124, height: 10},

            useButton: {x1: 97, y1: 2, width: 25, height: 10},
            hasButton: {x1: 124, y1: 2, width: 25, height: 10},
            holdableButton: {x1: 124, y1: 2, width: 25, height: 10},
            motionIdButton: {x1: 124, y1: 2, width: 25, height: 10},
            wearableButton: {x1: 124 - (25 + 2), y1: 2, width: 25, height: 10},
            protectPercentButton: {x1: 124 - (25 + 2) * 2, y1: 2, width: 25, height: 10},
            moverUseButton: {x1: 124 - (25 + 2) * 3, y1: 2, width: 25, height: 10},
            
            toButton: {x1: 20, y1: 3, width: 25, height: 10},
            
            dynamicTextButton:  {x1: 29, y1: 217, width: 30, height: 9},
            specsButton:  {x1: 29, y1: 217, width: 30, height: 9},
            dynamicHelpButton:  {x1: 29, y1: 227, width: 30, height: 9},
            dynamicEmitsButton: {x1: 61, y1: 217, width: 30, height: 9},

            linerAddEnvironmentButton: {x1: 96, y1: 2, width: 25, height: 10},
            linerAddAtButton:          {x1: 124, y1: 2, width: 25, height: 10},
            
            creditButton: {x1: 114, y1: 2, width: 25, height: 10},

            useButtonAlternative: {x1: 122, y1: 2, width: 25, height: 10},

            multiCells: {x1: 22, y1: 3, width: 108, height: 10},
            optionalThirdCell: {x1: 108, y1: 3, width: 30, height: 10},

            cellAdd: {x1: 134, y1: 4, width: 6, height: 6},
            cellRemove: {x1: 144, y1: 4, width: 6, height: 6},

            fontSize: {width: 4, height: 4},
            drawInBothCells: {x1: 108, y1: 3, width: 33, height: 9},

            changeDirection: {x1: 30, y1: 225, width: 11, height: 11},
            changeBehavior: {x1: 61, y1: 217, width: 30, height: 9},
            soundButton:    {x1: 61, y1: 217, width: 30, height: 9},
            changeAttributes: {x1: 61, y1: 227, width: 30, height: 9},
            changeNoteDelay: {x1: 61, y1: 227, width: 30, height: 9},
            pasteButton: {x1: 61, y1: 227, width: 30, height: 9},
            pasteButtonAlternative: {x1: 61 - 32, y1: 227, width: 30, height: 9},
            rightsButton: {x1: 30, y1: 217, width: 30, height: 9},

            example: {x1: 30, y1: 217, x2: 57, y2: 236},
            moveAvatarArrows: {x1: 30, y1: 217, x2: 58, y2: 236},
            exampleText: {x1: 30, y1: 217, width: 30, height: 8},

            preview: {x1: 7, y1: 217, x2: 7 + this.tileWidthDefault, y2: 217 + this.tileHeightDefault},
            changeName: {x1: 8, y1: 201, x2: 79, y2: 207},
            changeTypeFuzzy: {x1: 83, y1: 197, width: 83, height: 18},
            changeType: {x1: 86, y1: 201, x2: 158, y2: 207},
            createButton: {x1: 121, y1: 219, x2: 157, y2: 234}
        };

        this.areas.textualButton = {
                x1: this.areas.multiCells.x1 + this.areas.multiCells.width / 2, y1: this.areas.multiCells.y1,
                width: 15, height: 9};

        this.areas.textualButtonWhenAnimated = ig.game.cloneObject(this.areas.textualButton);
        this.areas.textualButtonWhenAnimated.x1 += 40;

        this.areas.interactingHelpButton = ig.game.cloneObject(this.areas.textualButtonWhenAnimated);
        this.areas.interactingHelpButton.x1 -= 15;
        
        this.areas.helpButton = ig.game.cloneObject(this.areas.textualButtonWhenAnimated);
        this.areas.helpButton.x1 += 25;

        this.areas.brainHelpButton = ig.game.cloneObject(this.areas.helpButton);

        this.areas.thingReferencesButton = ig.game.cloneObject(this.areas.textualButtonWhenAnimated);
        this.areas.thingReferencesButton.x1 += 19;

        this.defaultFont = (this.areas.fontSize.width * this.pageZoom) + 'px "Press Start 2P"';
        this.completeAreaValues();
    },

    completeAreaValues: function() {
        for (var name in this.areas) {
            var a = this.areas[name];
            if (a.x1 == undefined || a.x1 == null) { a.x1 = 0; }
            if (a.y1 == undefined || a.y1 == null) { a.y1 = 0; }

            if (a.width) {
                this.areas[name] = {
                        x1: parseInt(a.x1), y1: parseInt(a.y1),
                        x2: parseInt(a.x1 + a.width), y2: parseInt(a.y1 + a.height),
                        width: parseInt(a.width), height: parseInt(a.height)
                        };
            }
            else if (a.x2) {
                this.areas[name] = {
                        x1: parseInt(a.x1), y1: parseInt(a.y1),
                        x2: parseInt(a.x2), y2: parseInt(a.y2),
                        width: parseInt(a.x2 - a.x1), height: parseInt(a.y2 - a.y1)
                        };
            }
            else {
                this.areas[name] = {
                        x1: parseInt(a.x1), y1: parseInt(a.y1),
                        x2: 0, y2: 0,
                        width: 0, height: 0
                        };
            }
        }
    },

    createCanvas : function() {
        var gameCanvas      = jQuery('#'+ig.game.canvasId);
        var gameCanvasPos   = gameCanvas.position();
        var gameCanvasWidth = gameCanvas.width();
        var painterCanvas   = jQuery('<canvas id="painter" style="position:absolute"/>');
        painterCanvas.attr('width', this.painterCanvasSize.x * ig.system.scale);
        painterCanvas.attr('height', this.painterCanvasSize.y * ig.system.scale);
        painterCanvas.css('width', this.painterCanvasSize.x * ig.system.scale + 'px');
        painterCanvas.css('height', this.painterCanvasSize.y * ig.system.scale + 'px');

        var x = gameCanvasPos.left + gameCanvasWidth / 2 - (this.painterCanvasSize.x * ig.system.scale) / 2;
        var y = (ig.ua.smallMobile ? 0 : 10) * ig.system.scale;

        painterCanvas.css('top', y + 'px');
        painterCanvas.css('left', x + 'px');
        painterCanvas.appendTo('body');

        this.canvas = document.getElementById('painter');
    },

    destroyCanvas : function() {
        jQuery('#painter').remove(); //remove painter canvas
        ig.game.restoreFocus();
    },

    launch: function() {
        if (ig.game.boostDialog && ig.game.boostDialog.isOpen) {
            ig.game.boostDialog.close();
        }
        
        this.createCanvas();

        this.currentLayer = 0;
        this.didSetDirection = false;
        this.initCanvasSnapshot();
        ig.game.ourPlayer.accel = {x: 0, y: 0};
        this.handleClicks = false;
        this.didWheelThisSession = false;
        this.lastPointDrawn = {x: null, y: null};
        this.lineKeyIsPressed = false;
        this.shiftKeyIsPressed = false;
        this.lastPixelSeenOnClick = {x: null, y: null};
        this.isCurrentlySavingToServer = false;
        this.doCloneContents = false;
        this.lastClonedFromId = null;

        this.isRunning = true;
        ig.game.isPainting = ig.game.ourPlayer.isPainting = true;

        this.data = this.getEmptyTileData();

        this.colorPickerType = localStorage.getItem('colorPickerType');
        if (this.colorPickerType != 'a' && this.colorPickerType != 'b') { this.colorPickerType = 'a'; }
        this.addInputBox();

        var backupData = this.getDataFromEmergencyBackupIfNeeded();
        if (backupData) {
            try {
                this.handleClicks = false;
                this.launchInit();
                this.data = this.getEmptyTileData();
                this.loadItem(backupData);

                // why is the changeBehavior button not showing? It was drawn before
                var self = this;
                setTimeout( function() {
                        self.oldData = {name: null, type: null, direction: null};
                        self.updateAll();
                        self.handleClicks = true;
                        self.recordDataHistory();
                    },
                    200 );
            }
            catch (err) {
                ig.game.errorManager.warn('Creator backup cleared due to issue');
                this.clearEmergencyBackup();
                this.handleClicks = true;
            }
        }
        else {
            this.launchInit();
            this.data = this.getEmptyTileData();
            if (this.typeToSetAfterLoading) {
                this.setToType(this.typeToSetAfterLoading);
                this.typeToSetAfterLoading = null;
            }
            if (this.propToSetAfterLoading) {
                for (var key in this.propToSetAfterLoading) {
                    this.data.prop[key] = this.propToSetAfterLoading[key];
                }
                this.propToSetAfterLoading = null;
            }
        }
        
        if (ig.ua.smallMobile && ig.system.width > ig.system.height) {
            ig.game.alertDialog.open('Please rotate device to portrait mode for creating', null,
                    ig.game.painter.closeCallback);
        }
    },

    launchInit: function() {
        this.initSettingValues();
        this.adjustRequiredBordersByRank();

        this.areas.all = {x1: 0, y1: 0, width: this.canvas.width, height: this.canvas.height};

        var bgDataURL;
        if(this.backgroundImage.data instanceof HTMLImageElement) {
            var bgcanvas = this.imageToCanvas(this.backgroundImage.data);
            bgDataURL = bgcanvas.toDataURL('image/png');
        } else {
            bgDataURL = this.backgroundImage.data.toDataURL('image/png');
        }

        this.canvas.style.backgroundImage = 'url(' + bgDataURL + ')';
        this.context = this.canvas.getContext('2d');
        this.context.webkitImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        this.context.lineWidth = 1 * this.pageZoom;

        if (!this.hasBeenInited) {
            this.cacheImages(['spritesheet']);
            this.assignSpritesheetImages();
        }
        this.unbindAllEvents();
        this.bindAllEvents();

        this.changePreviewColor();
        if (ig.game.ourPlayer.rank <= 1) { this.fadeInDrawBigMessage(); }
        this.initDataHistory();

        this.hasBeenInited = true;

        this.updateAll();
        this.handleClicks = true;
    },
    
    initSettingValues: function() {
        this.tileWidth = this.tileWidthDefault;
        this.tileHeight = this.tileHeightDefault;
        this.drawingZoom = this.drawingZoomDefault;
        this.initAreas();
        this.positionOnPicker = [];
        this.reduceLengthOfPositionOnPickerTypeBArrayIfNeeded();
        this.selectedColor = 0;
        this.selectedCell = 0;
        this.optionalCellCount = 2;
        this.previewCell = this.selectedCell;
        this.secondaryColorIndex = this.transparentIndex;
        this.previewIsFlipped = false;
        this.drawSymmetric = false;
        this.previewColorTargetIndex = null;
        this.previewColor = {r: 0, g: 0, b: 0, alpha: 1};
        this.previewColors = null;
        this.fadeOpacity = 0;
        this.palettePage = 0;
        this.selectedPalettePage = 0;
        this.writableRightsSetting = 0;

        this.maxCells = ig.game.maxCellsMulti;
        if ( this.data && ( ['dynamicThing', 'happening', 'musicSheet', 'farBack', 'transforming'].indexOf(this.data.type) >= 0 ) ) {
            if (this.data.type == 'transforming') { this.optionalCellCountMax = this.transformingCellsMax; }
            else if (this.data.type == 'farBack') { this.optionalCellCountMax = this.farBackCellsMax; }
            else { this.optionalCellCountMax = 9; }
            
            this.optionalCellCount = 1;
            if (this.data.pixels) {
                var highestFilledCell = this.getHighestFilledCell();
                if (highestFilledCell >= 0) {
                    this.optionalCellCount = highestFilledCell + 1;
                                       
                    if (this.data.type == 'dynamicThing' && this.data.prop && this.data.prop.text) {
                        while ( this.data.prop.text.toLowerCase().indexOf( 'cell ' + (this.optionalCellCount + 1) ) >= 0 &&
                                this.optionalCellCount < this.optionalCellCountMax ) {
                            this.optionalCellCount++;
                        }
                    }
                }
            }
        }
        
        if (this.data && this.data.type && this.types[this.data.type] && this.types[this.data.type].isMultiAnimated) {
            this.maxCells = ig.game.maxCellsMulti;
        }
        if (this.data && this.data.type && this.types[this.data.type].hasOptionalCells) {
            this.maxCells = this.optionalCellCountMax;
        }
        if ( this.data && ['motion', 'interactingMotion', 'holder'].indexOf(this.data.type) >= 0 ) {
            this.maxCells = 3;
        }

        this.avatarTemplatePosition = {x: 11, y: 14, rotation: 0};;
    },
    
    getHighestFilledCell: function() {
        var highestFilledCell = -1;
        if (this.data && this.data.pixels) {
            for (var i = 0; i < this.data.pixels.length; i++) {
                if ( this.pixelHasBeenDrawn(i) ) {
                    highestFilledCell = i;
                }
            }
        }
        return highestFilledCell;
    },

    addInputBox: function() {
        if (!this.inputBoxIsOpen) {
            var value = this.data && this.data.name && this.data.name != '' ? ig.game.strings.htmlEscape(this.data.name) : '';
            var inputBox = jQuery('<input type="text" class="painterInputBox" id="' + this.inputBoxId + '" value="' + value + '" ' +
                    'placeholder="Name..." maxLength="' + ig.game.validations.itemName.maxLength + '" autocomplete="off" />');
            var canvas = jQuery('#painter');
            var canvasPos = canvas.position();
            var canvasWidth = canvas.width();
    
            var scale = ig.system.scale;
            var paddingLeft = 3;
            var size = {x: 69 * scale, y: 7 * scale};
            var pos = {x: 8 * scale, y: 201 * scale};
    
            inputBox.appendTo('body');
            inputBox.css('padding', '0');
            inputBox.css('width', size.x + 'px');
            inputBox.css('height', size.y + 'px');
            inputBox.css('font-size', Math.floor(4 * scale) + 'px');
            inputBox.css('border-width', (1 * scale) + 'px');
            inputBox.css('left', canvasPos.left + pos.x);
            inputBox.css('padding-left', paddingLeft * scale + 'px');
            inputBox.css('top', canvasPos.top + pos.y);
            inputBox.css('opacity', '' + this.searchBoxOpacityDefault);
    
            var self = this;
            jQuery('#' + this.inputBoxId).keyup( function(event) {
                var returnKeyCode = 13;
                if (event.keyCode == returnKeyCode) { self.leaveInputBox(); }
            });

            inputBox.css('visibility', 'visible');
            this.inputBoxIsOpen = true;
        }
    },

    removeInputBox: function() {
        jQuery('#' + this.inputBoxId).remove();
        this.inputBoxIsOpen = false;
    },

    leaveInputBox: function() {
        if ( ig.ua.mobile || jQuery('#' + this.inputBoxId).is(':focus') ) {
            jQuery('#' + this.inputBoxId).blur();
            jQuery('#painter').focus();

            var newName = jQuery('#' + this.inputBoxId).val();
            if (newName) {
                this.data.name = ig.game.validations.itemName.clean(newName);
                jQuery('#' + this.inputBoxId).val(this.data.name);
                if ( this.data.name != newName && ig.game.strings.trim(this.data.name) != ig.game.strings.trim(newName) &&
                       this.data.name.toLowerCase() != newName.toLowerCase() ) {
                    ig.game.alertDialog.open('Adjusted name to "' + this.data.name + '"');
                }
                else if ( this.nameIndicatesPossibleCopyrightIssue(this.data.name) && !this.didShowCopyrightAlert ) {
                    this.showCopyrightAlert();
                }
                
                if ( this.data.prop && this.data.prop.attributes && this.data.prop.attributes.indexOf('toArea') >= 0 ) {
                    var self = this;
                    var potentialAreaName = ig.game.strings.removeFromStart(this.data.name, 'to ');
                    ig.game.httpApi.isRootAreaNameOk_P(potentialAreaName).done(function(result) {
                        var nameExists = !result.ok;
                        if (!nameExists) {
                            self.showHelperToAreaInfo(self.data.name);
                            self.data.name = '';
                            jQuery('#' + self.inputBoxId).val(self.data.name);
                            ig.game.sounds.nocando.play();
                        }
                    });
                }
            }
        }
    },

    showCopyrightAlert: function() {
        var clickCall = "ml.Misc.openUrl('/info#terms')";
        var html = '<p>Please note that copyrighted creations are against the ' +
                '<span class="pseudoLink" onclick="' + clickCall + '">terms</span>. Thanks!</p>'
        ig.game.alertDialog.open({html: html, doShowSmaller: true});
        this.didShowCopyrightAlert = true;
    },

    nameIndicatesPossibleCopyrightIssue: function(name) {
        var foundIndicator = false;
        var indicators = ['mario', 'yoshi', 'sonic', 'pikachu', 'starbound', 'terraria'];
        for (var i = 0; i < indicators.length && !foundIndicator; i++) {
            foundIndicator = name.indexOf(indicators[i]) >= 0;
        }
        return foundIndicator;
    },

    assignSpritesheetImages: function() {
        this.assignSpritesheetDirectionArrows();
        this.assignSpritesheetImagesExample();
        this.assignSpritesheetImagesTypeIcon();
        this.assignSpritesheetRankIcon();
        this.assignSpritesheetAttributeIcons();

        this.assignSpritesheetImage('changeColorDialog', 0, 0, 158, 117);
        this.assignSpritesheetImage('drawBig', 98, 163, 61, 15);
        this.assignSpritesheetImage('drawBig3Borders', 98, 179, 61, 15);
        this.assignSpritesheetImage('drawBig2Borders', 98, 212, 61, 15);
        this.assignSpritesheetImage('drawBig1Border', 30, 212, 55, 15);
        this.assignSpritesheetImage('drawBig5x5',      98, 232, 61, 15);
        this.assignSpritesheetImage('colorPickerButton', 0, 117, 12, 9);

        this.assignSpritesheetImage('helpButton', 326, 547, 11, 9);
        this.assignSpritesheetImage('textualButton', 310, 547, 15, 9);
        this.assignSpritesheetImage('thingReferencesButton', 338, 547, 11, 9);

        this.assignSpritesheetImage('textualButton_active', 310, 557, 15, 9);
        this.assignSpritesheetImage('thingReferencesButton_active', 338, 557, 11, 9);

        this.assignSpritesheetImage('addSound', 99, 441, 50, 6);
        this.assignSpritesheetImage('removeSound', 99, 451, 59, 6);

        this.assignSpritesheetImage( 'menu', 375, (ig.ua.mobile ? 510 : 327),
                this.areas.menu.width, this.areas.menu.height );

        if (ig.ua.mobile) { this.assignSpritesheetImage('canvasHelp', 228, 494, 63, 4); }
        else { this.assignSpritesheetImage('canvasHelp', 228, 489, 77, 4); }
        this.assignSpritesheetImage('canvasHelpAnimated', 228, 484, 58, 4);
        
        this.assignSpritesheetImage( 'playMusicSheetButtonOff', 334, ig.ua.mobile ? 402 : 380,
                this.areas.playMusicButton.width, this.areas.playMusicButton.height );
        this.assignSpritesheetImage( 'playMusicSheetButtonOn',  334, ig.ua.mobile ? 413 : 391,
                this.areas.playMusicButton.width, this.areas.playMusicButton.height );
                                        
        this.assignSpritesheetImage('convertMusicSheetButton', 334, 479,
                this.areas.convertMusicSheetButton.width, this.areas.convertMusicSheetButton.height);
        this.assignSpritesheetImage('needsButton', 231, 426,
                this.areas.sizeButton.width, this.areas.needsButton.height);
        this.assignSpritesheetImage('sizeButton', 231, 436,
                this.areas.sizeButton.width, this.areas.sizeButton.height);

        this.assignSpritesheetImage('timeButton', 262, 426,
                this.areas.sizeButton.width, this.areas.needsButton.height);                
        this.assignSpritesheetImage('givesButton', 262, 436,
                this.areas.sizeButton.width, this.areas.needsButton.height);
        this.assignSpritesheetImage('givesButton_active', 262, 446,
                this.areas.sizeButton.width, this.areas.needsButton.height);
                                        
        this.assignSpritesheetImage('canvasHelpOverlay', 1, 564, 108, 4);
        this.assignSpritesheetImage('canvasHelpSit', 1, 569, 94, 4);
        
        this.assignSpritesheetImage('buyNowButton', 227, 598, 38, 16);
        this.assignSpritesheetImage('soundButton', 231, 446, 30, 9);
        this.assignSpritesheetImage('soundButton_active', 231, 456, 30, 9);

        this.assignSpritesheetImage('useAtGetButtons', 325, 259, 124, 10);
        this.assignSpritesheetImage('useButton', 334, 357, 25, 10);
        this.assignSpritesheetImage('hasButton', 334, 368, 25, 10);
        this.assignSpritesheetImage('motionIdButton', 334, 331, 25, 10);
        this.assignSpritesheetImage('motionIdButtonActive', 334, 342, 25, 10);
        this.assignSpritesheetImage('creditButton', 413, 201, 32, 10);
        
        this.assignSpritesheetImage('holdableButton', 308, 468, 25, 10);
        this.assignSpritesheetImage('holdableButtonActive', 334, 468, 25, 10);
        this.assignSpritesheetImage('wearableButton', 256, 499, 25, 10);
        this.assignSpritesheetImage('wearableButtonActive', 282, 499, 25, 10);
        this.assignSpritesheetImage('protectPercentButton', 256, 468, 25, 10);
        this.assignSpritesheetImage('protectPercentButtonActive', 282, 468, 25, 10);
        this.assignSpritesheetImage('moverUseButton', 256, 510, 25, 10);
        this.assignSpritesheetImage('moverUseButtonActive', 282, 510, 25, 10);
        
        this.assignSpritesheetImage('dynamicTextButton',  334, 600, 30, 9);
        this.assignSpritesheetImage('dynamicHelpButton',  334, 610, 30, 9);
        this.assignSpritesheetImage('dynamicEmitsButton', 334, 620, 30, 9);
        this.assignSpritesheetImage('dynamicEmitsButtonActive', 334, 630, 30, 9);
        
        this.assignSpritesheetImage('specsButton', 334, 640, 30, 9);
        
        this.assignSpritesheetImage('toButton', 449, 296, 25, 9);
        this.assignSpritesheetImage('toButtonActive', 449, 306, 25, 9);

        this.assignSpritesheetImage('linerAddEnvironmentButton', 415, 271, 25, 10);
        this.assignSpritesheetImage('linerAddEnvironmentButtonActive', 415, 282, 25, 10);
        
        this.assignSpritesheetImage('linerAddAtButton', 441, 271, 25, 10);
        this.assignSpritesheetImage('linerAddAtButtonActive', 441, 282, 25, 10);

        this.assignSpritesheetImage('moveShortcutHi', 101, 202, 43, 5);
        this.assignSpritesheetImage('menuArrowUp', 81, 117, 11, 7);
        this.assignSpritesheetImage('symmetryLine', 158, 0, 1, 152);
        this.assignSpritesheetImage('typePicker', 0, 257, 194, 182);

        this.assignSpritesheetImage('colorPicker_typeA', 324, 0, 164, 172);
        this.assignSpritesheetImage('colorPicker_typeB', 160, 0, 164, 172);

        this.assignSpritesheetImage('musicDataFull', 464, 177, 14, 8);
        this.assignSpritesheetImage('changeBehavior', 98, 154,
                this.areas.changeBehavior.x2 - this.areas.changeBehavior.x1, this.areas.changeBehavior.y2 - this.areas.changeBehavior.y1);
        this.assignSpritesheetImage('changeAttributes', 98, 123,
                this.areas.changeAttributes.x2 - this.areas.changeAttributes.x1, this.areas.changeAttributes.y2 - this.areas.changeAttributes.y1);

        this.assignSpritesheetImage('changeNoteDelay', 334, 489,
                this.areas.changeNoteDelay.width, this.areas.changeAttributes.height);
                
        this.assignSpritesheetImage('pasteButton', 128, 154, 30, 9);
        this.assignSpritesheetImage('rightsButton', 413, 192, 30, 9);
        this.assignSpritesheetImage('checkboxUnchecked', 0, 208, 8, 8);
        this.assignSpritesheetImage('checkboxChecked', 9, 208, 8, 8);
        this.assignSpritesheetImage('radioButtonUnchecked', 0, 217, 8, 8);
        this.assignSpritesheetImage('radioButtonChecked', 9, 217, 8, 8);

        this.assignSpritesheetImage('cells0active', 197, 172, 73, 10);
        this.assignSpritesheetImage('cells1active', 197, 182, 73, 10);

        this.assignSpritesheetImage('livePreviewPlayButton', 13, 118, 7, 7);

        this.assignSpritesheetImage('cellsMotion0active', 324, 224, 118, 10);
        this.assignSpritesheetImage('cellsMotion1active', 324, 234, 118, 10);
        this.assignSpritesheetImage('cellsMotion2active', 324, 245, 118, 10);

        this.assignSpritesheetImage('cellsInteractingMotion0active', 324, 295, 118, 10);
        this.assignSpritesheetImage('cellsInteractingMotion1active', 324, 305, 118, 10);
        this.assignSpritesheetImage('cellsInteractingMotion2active', 324, 316, 118, 10);
        
        this.assignSpritesheetImage('cellsHolder0active', 228, 566, 118, 10);
        this.assignSpritesheetImage('cellsHolder1active', 228, 576, 118, 10);
        this.assignSpritesheetImage('cellsHolder2active', 228, 587, 118, 10);

        this.assignSpritesheetImage('cellsMultithing0active', 228, 636, 73, 10);
        this.assignSpritesheetImage('cellsMultithing1active', 228, 646, 73, 10);
        
        this.assignSpritesheetImage('cellsWearable0active', 197, 197, 73, 10);
        this.assignSpritesheetImage('cellsWearable1active', 197, 207, 73, 10);

        this.assignSpritesheetImage('cellsEmitter0active', 326, 271, 73, 10);
        this.assignSpritesheetImage('cellsEmitter1active', 326, 281, 73, 10);
        
        this.assignSpritesheetImage('cellsAimable0active', 227, 615, 73, 10);
        this.assignSpritesheetImage('cellsAimable1active', 227, 625, 73, 10);

        this.assignSpritesheetImage('cellsGatherable0active', 300, 447, 73, 10);
        this.assignSpritesheetImage('cellsGatherable1active', 300, 457, 73, 10);

        this.assignSpritesheetImage('cellsBackAndFrontThing0active', 300, 425, 73, 10);
        this.assignSpritesheetImage('cellsBackAndFrontThing1active', 300, 435, 73, 10);

        var thisX = 282, thisY = 190, thisWidth = 12, thisHeight = 11;
        for (var i = 0; i < ig.game.maxCellsMulti; i++) {
            this.assignSpritesheetImage('multiCell' + i, thisX + thisWidth * i, thisY, thisWidth, thisHeight);
            this.assignSpritesheetImage('multiCell' + i + 'active', thisX + thisWidth * i, thisY + thisHeight, thisWidth, thisHeight);
        }

        thisX = 239, thisY = 524;
        for (var i = 0; i < ig.game.maxCellsMulti; i++) {
            this.assignSpritesheetImage('multiCellDynamic' + i, thisX + thisWidth * i, thisY, thisWidth, thisHeight);
            this.assignSpritesheetImage('multiCellDynamic' + i + 'Active', thisX + thisWidth * i, thisY + thisHeight, thisWidth, thisHeight);
        }

        this.assignSpritesheetImage('viewableBase', 309, 502, 18, 10);
        this.assignSpritesheetImage('viewableBaseActive', 309, 513, 18, 10);
        this.assignSpritesheetImage('viewableMoreCell', 328, 502, 18, 10);
        this.assignSpritesheetImage('viewableMoreCellActive', 328, 513, 18, 10);

        this.assignSpritesheetImage('multiBase', 309, 524, 18, 10);
        this.assignSpritesheetImage('multiBaseActive', 309, 535, 18, 10);
        this.assignSpritesheetImage('multiMoreCell', 309, 524, 12, 10);
        this.assignSpritesheetImage('multiMoreCellActive', 309, 535, 12, 10);

        this.assignSpritesheetImage('moreCellAdd', 347, 504, 6, 6);
        this.assignSpritesheetImage('moreCellRemove', 356, 504, 6, 6);

        this.assignSpritesheetImage('avatarModel_cell1', 192, 218, 128, 128);
        this.assignSpritesheetImage('avatarModel_cell2', 322, 218, 128, 128);

        this.assignSpritesheetImage('moveAvatarArrows', 68, 132, 29, 19);

        this.assignSpritesheetImage('avatarTemplate', 241, 307, 80, 108);
        this.assignSpritesheetImage('avatarTemplateBack', 0, 442, 88, 108);
    },

    adjustRequiredBordersByRank: function() {
        var minBordersForLowerRanks = 3;
        var typesExcludedFromAdjustment = ['slope', 'slideySlope', 'body', 'viewable', 'glow', 'multiAnimatedThing'];
        for (var key in this.types) {
            if ( typesExcludedFromAdjustment.indexOf(key) == -1 ) {
                var thisType = this.types[key];
                if (thisType.requiredBorders && thisType.requiredBorders != 0) {
                    if (!thisType.requiredBordersOriginal) {
                        thisType.requiredBordersOriginal = thisType.requiredBorders;
                    }
                    if (thisType.requiredBordersOriginal < minBordersForLowerRanks && ig.game.ourPlayer.rank < 2) {
                        thisType.requiredBorders = minBordersForLowerRanks;
                    }

                    if (ig.game.ourPlayer.rank >= 2) { thisType.requiredBorders = 0; }
                }
            }
        }
    },

    assignSpritesheetDirectionArrows: function() {
        var n, width = 11, height = 11;

        var leftX = 98, topY = 132;
        for (n = 0; n < this.directionMax; n++) {
            this.assignSpritesheetImage('directionArrow_' + n, leftX + n * width, topY, width, height);
            this.assignSpritesheetImage('directionArrowDiagonal_' + n, leftX + n * width, topY + height, width, height);
        }

        leftX = 0, topY = 243;
        for (n = 0; n < this.multiDirectionMax; n++) {
            this.assignSpritesheetImage('multiDirectionArrow_' + n, leftX + n * width, topY, width, height);
        }
    },

    assignSpritesheetRankIcon: function() {
        var width = 12, height = 10;
        for (var i = 1; i < this.moderatorRank; i++) {
            this.assignSpritesheetImage('rank_' + i, 288 + i * width, 175, width, height);
        }
    },

    assignSpritesheetAttributeIcons: function() {
        var info = ig.game.attributesManager.info;
        var width = 11, height = 8, startX = 1, startY = 705, margin = 1;
        for (var baseType in info) {
            var painterType = this.getTypeFromKey(baseType);
            for (var attributeName in info[baseType]) {
                var icon = info[baseType][attributeName].icon;
                if (icon) {
                    var key = painterType + '_attribute_' + attributeName;
                    this.assignSpritesheetImage(key, startX + (icon - 1) * (width + margin), startY, width, height);
                }
            }
        }
    },

    assignSpritesheetImagesExample: function() {
        var margin = 1, width = 27, height = 19;
        var splitOffRow = 35, splitOffRow2 = 59;
        for (var type in this.types) {
            var iconRow = this.types[type].exampleRow;
            if (iconRow) {
                var x1 = 489, y1 = 0;
                if (iconRow > splitOffRow2) {
                    iconRow = iconRow - splitOffRow2;
                    x1 = 116; y1 = 457;
                }
                else if (iconRow > splitOffRow) {
                    iconRow = iconRow - splitOffRow;
                    x1 = 199; y1 = 225;
                }

                var y = y1 + (iconRow - 1) * (height + margin) + margin;
                if (this.types[type].hasDirection && !this.types[type].hasMultiDirection) {
                    for (var n = 0; n < this.directionMax; n++) {
                        var x = x1 + n * (width + margin);
                        this.assignSpritesheetImage('example_' + type + '_' + n, x, y, width, height);
                    }
                }
                else {
                    this.assignSpritesheetImage('example_' + type, x1, y, width, height);
                }
            }
        }
    },

    assignSpritesheetImagesTypeIcon: function() {
        for (var type in this.types) {
            var iconRow = this.types[type].iconRow;
            if (iconRow) {
                this.assignSpritesheetImage('typeIcon_' + type,
                        168, 172 + (iconRow - 1) * this.areas.typeIcon.height,
                        this.areas.typeIcon.width, this.areas.typeIcon.height);
            }
        }
    },

    assignSpritesheetImage: function(name, x, y, width, height, spritesheet) {
        if (spritesheet == null || spritesheet == undefined) { spritesheet = 'spritesheet'; }
        this.spritesheetImages[name] = {spritesheet: spritesheet, x: x, y: y, width: width, height: height};
    },

    getTypeFromKey: function(key) {
        var type = '';
        if (key == 'LQDFLIP') { key = 'LIQUID'; }
        for (var thisType in this.types) {
            if (this.types[thisType].key == key) {
                type = thisType;
                break;
            }
        }
        return type;
    },

    bindAllEvents: function () {
        this.handleMouseDownBound    = this.handleMouseDown.bind(this);
        this.handleMouseUpBound      = this.handleMouseUp.bind(this);
        this.handleMouseMovedBound   = this.handleMouseMoved.bind(this);
        this.handleMouseWheelBound   = this.handleMouseWheeled.bind(this);

        if (ig.ua.mobile) {
            this.bindEvent(this.canvas, 'touchstart', this.handleMouseDownBound);
            this.bindEvent(this.canvas, 'touchend', this.handleMouseUpBound);
            this.bindEvent(this.canvas, 'touchmove', this.handleMouseMovedBound);
        }
        else {
            this.bindEvent(this.canvas, 'mousedown', this.handleMouseDownBound);
            this.bindEvent(this.canvas, 'mouseup',   this.handleMouseUpBound);
            this.bindEvent(this.canvas, 'mousemove', this.handleMouseMovedBound);

            this.bindEvent(this.canvas, 'mousewheel', this.handleMouseWheelBound);
            this.bindEvent(this.canvas, 'DOMMouseScroll', this.handleMouseWheelBound);
        }

        this.handleKeyDownBound      = this.handleKeyDown.bind(this);

        this.handleKeyDownBound      = this.handleKeyDown.bind(this);
        this.handleKeyUpBound        = this.handleKeyUp.bind(this);
        this.handleDoubleClickBound  = this.handleDoubleClick.bind(this);

        this.bindEvent(window,      'keydown',   this.handleKeyDownBound);
        this.bindEvent(window,      'keyup',     this.handleKeyUpBound);
        this.bindEvent(this.canvas, 'dblclick',  this.handleDoubleClickBound);
    },

    unbindAllEvents: function () {
        this.unbindEvent(this.canvas, 'mousedown',  this.handleMouseDownBound);
        this.unbindEvent(this.canvas, 'mouseup',    this.handleMouseUpBound);
        this.unbindEvent(this.canvas, 'mousemove',  this.handleMouseMovedBound);

        this.unbindEvent(this.canvas, 'mousewheel',  this.handleMouseWheelBound);
        this.unbindEvent(this.canvas, 'DOMMouseScroll',  this.handleMouseWheelBound);

        this.unbindEvent(this.canvas, 'touchstart',  this.handleMouseDownBound);
        this.unbindEvent(this.canvas, 'touchend',    this.handleMouseUpBound);
        this.unbindEvent(this.canvas, 'touchmove',  this.handleMouseMovedBound);

        this.unbindEvent(window,      'keydown',    this.handleKeyDownBound);
        this.unbindEvent(window,      'keyup',      this.handleKeyUpBound);
        this.unbindEvent(this.canvas, 'dblclick',   this.handleDoubleClickBound);
    },

    bindEvent: function(el, eventName, eventHandler) {
        var typicallyNonIExplorerBrowser = el.addEventListener;
        var typicallyIExplorerBrowser = !typicallyNonIExplorerBrowser && el.attachEvent;
        if (typicallyNonIExplorerBrowser) {
            el.addEventListener(eventName, eventHandler, false);
        } else if (typicallyIExplorerBrowser) {
            el.attachEvent('on' + eventName, eventHandler);
        }
    },

    unbindEvent: function(el, eventName, eventHandler) {
        var typicallyNonIExplorerBrowser = el.addEventListener;
        var typicallyIExplorerBrowser = !typicallyNonIExplorerBrowser && el.attachEvent;
        if (typicallyNonIExplorerBrowser) {
            el.removeEventListener(eventName, eventHandler, false);
        } else if (typicallyIExplorerBrowser) {
            el.detachEvent('on' + eventName, eventHandler);
            //See : http://msdn.microsoft.com/en-us/library/ie/ms536411(v=vs.85).aspx
        }
    },

    currentlyAcceptsItems: function() {
        return this.mode == 'cloneOld' || (this.thingReferencesDialog && this.thingReferencesDialog.isOpen) ||
                ( this.data && ['interactiveEnvironment', 'gatherable', 'dynamicThing', 'happening', 'liner', 'mover'].indexOf(this.data.type) >= 0 ) ||
                ( this.data && this.data.type && this.typesWithSoundId.indexOf(this.types[this.data.type].key) >= 0 ) ||
                ( this.data && this.data.type && this.types[this.data.type].canHaveMotionId );
    },

    loadItem: function(tileData, clonedFromId) {
        // aka thingSelected in mode cloneOld
        this.lastClonedFromId = tileData.id;

        if (tileData) {
            if ( this.rankOkForType( this.getTypeFromKey(tileData.type) ) ) {
                this.doLoadItem(tileData, clonedFromId);
            }
            else {
                ig.game.rankManager.showRankNotEnough();
            }
        }
    },
    
    doLoadItem: function(tileData, clonedFromId) {
        var context = 'painterCloningOldThing';
        ig.game.errorManager.setContext(context);

        this.initSettingValues();
        this.data = {
            name: tileData.name,
            type: tileData.type,
            direction: tileData.direction,
            prop: { musicData: null, textData: null, text: '', thingRefs: [], reactsTo: [],
                    creditUrl: null, soundId: null, noteDelayMS: this.noteDelayMSDefault,
                    attributes: [], useKeyword: null, atKeyword: null, getId: null,
                    backTileCount: null, motionId: null, hasId: null, emitsId: null,
                    boundingBox: null, boundingBox2: null, environmentId: null,
                    specs: null, clonedFrom: null, changerId: null, holdableId: null,
                    secPerTransform: null, wearableId: null, protectPercent: null },
            colors: this.cloneColors(tileData.colors),
            pixels: []
        };
        
        if ( this.data.type && this.data.type == this.data.type.toUpperCase() ) {
            this.data.type = this.getTypeFromKey(tileData.type);
        }
        
        if (tileData.type == 'STACKWEAR') {
            this.data.type = tileData.pixels[0].length == this.types.wearable.tileSize.width ? 'wearable' : 'wearableBig';
        }

        if (tileData.prop) {
            this.data.prop = ig.game.cloneObject(tileData.prop);
        }

        if (clonedFromId) {
            this.data.prop.clonedFrom = clonedFromId;
        }

        this.initSettingValues();
        
        if (!this.data.pixels) { this.data.pixels = []; }

        for (var cell = 0; cell < this.maxCells; cell++) {
            this.data.pixels[cell] = this.getPixelMap();
        }

        var actualWidth = tileData.pixels && tileData.pixels[0] ?
                tileData.pixels[0].length : ig.game.tileSize;
        var actualHeight = tileData.pixels && tileData.pixels[0] && tileData.pixels[0][0] ?
                tileData.pixels[0][0].length : ig.game.tileSize;

        if ( (actualWidth != this.tileWidth || actualHeight != this.tileHeight) &&
                this.data.type != 'motion' && this.data.type != 'interactingMotion' && this.data.type != 'holder' ) {
            var isOldBody = this.data.type == 'body' && tileData.pixels.length == 7;
            if (isOldBody) {
                for (var cell = 0; cell < 6; cell++) {
                    this.data.pixels[cell] = this.clonePixelsOfCellExpandToTileTypeDefaultSize(tileData.pixels[cell]);
                }
            }
            else {
                for (var cell = 0; cell < tileData.pixels.length; cell++) {
                    this.data.pixels[cell] = this.clonePixelsOfCellExpandToTileTypeDefaultSize(tileData.pixels[cell]);
                }
            }
        }
        else {
            for (var cell = 0; cell < tileData.pixels.length; cell++) {
                this.data.pixels[cell] = this.clonePixelsOfCell(tileData.pixels[cell]);
            }

        }

        this.ensureCorrectDataTypes();
        this.hideSubDialog();
        this.finalizeSpecialLoadingIfNeeded();
        
        if (this.data.name) { jQuery('#' + this.inputBoxId).val(this.data.name); }

        ig.game.errorManager.removeContext(context);
        if (ig.game.alertDialog && ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
        
        this.setToType(this.data.type);
        this.recordDataHistory();
        
        this.updateAll();
    },
    
    rankOkForType: function(typeName) {
        var isOk = true;
        if (typeName && this.types && this.types[typeName] && this.types[typeName].rankNeeded) {
            isOk = ig.game.ourPlayer.rank >= this.types[typeName].rankNeeded;
        }
        return isOk;
    },

    cacheImages: function(images) {
        var max = images.length;
        for (var i = 0; i < max; i++) {
            var name = images[i];
            this.images[name] = new Image();
            this.images[name].crossOrigin = 'Anonymous';

            var self = this;
            this.images[name].onload = function() { self.update(); }

            this.images[name].src = this.imagePath + name + '.png?v=' + ig.game.version;
        }
    },

    update: function() {
        if (!this.context) { return; }
    
        this.clearRect(this.areas.all.x1, this.areas.all.y1, this.areas.all.width, this.areas.changeName.y1 - 2);
        this.updateDrawing();
        this.updatePalette();
        this.updateNameAndTypeText();
        this.updateCells();
        this.updateMenu();
        this.handleTypeInGroupRank();
    },

    handleTypeInGroupRank: function() {
        if (this.data && this.data.type && this.types[this.data.type].rankNeeded) {
            var rankNeeded = this.types[this.data.type].rankNeeded;
            if (rankNeeded > ig.game.ourPlayer.rank) {
                var rankX = this.areas.drawingOffset.x1 + this.areas.drawing.width / 2 - 12 / 2;
                var rankY = this.areas.drawingOffset.y1 + this.areas.drawing.height / 2 - 10 / 2;
                this.drawImage('rank_' + rankNeeded, rankX, rankY);

                var self = this;
                if (this.timeouts['switchToNextTypeInGroup'] != null) { clearTimeout(this.timeouts['switchToNextTypeInGroup']); }
                this.timeouts['switchToNextTypeInGroup'] = setTimeout( function() { self.switchToNextTypeInGroup(); }, 1000);
                ig.game.rankManager.showRankNotEnough();
            }
        }
    },

    updateStaticTemplateIfNeeded: function() {
        if (this.data && this.data.type) {
            var templateAlpha = .35;

            if ( ['dynamicThing', 'holder', 'happening', 'backAndFrontThing'].indexOf(this.data.type) >= 0 ) {
                this.context.fillStyle = 'rgba(0,0,0,.15)';
                this.fillRect(
                        this.areas.drawingOffset.x1 + Math.round(this.types[this.data.type].tileSize.width / 2 - ig.game.tileSizeHalf) * this.drawingZoom,
                        this.areas.drawingOffset.y1 + Math.round(this.types[this.data.type].tileSize.height - ig.game.tileSize) * this.drawingZoom,
                        ig.game.tileSize * this.drawingZoom,
                        ig.game.tileSize * this.drawingZoom);
            }
            else if (this.data.type == 'wearableBig') {
                var pixelOffset = {x: 10, y: 11};
                var x = this.areas.drawingOffset.x1 + pixelOffset.x * this.drawingZoom;
                var y = this.areas.drawingOffset.y1 + pixelOffset.y * this.drawingZoom;
                var partName = 'avatarTemplate';
                if (this.selectedCell == 1) {
                    partName += 'Back';
                    x -= 2 * this.drawingZoom;
                }
                this.drawImageWithAlpha(partName, x, y, templateAlpha);
            }
            else if (this.types[this.data.type].isMountable) {
                this.drawImageWithAlpha('avatarTemplate',
                        this.areas.drawingOffset.x1 + (this.avatarTemplatePosition.x - 1) * this.drawingZoom,
                        this.areas.drawingOffset.y1 + (this.avatarTemplatePosition.y - 3) * this.drawingZoom,
                        templateAlpha);
            }
        }
    },

    updateAll: function() {
        this.oldData.type = null;
        this.oldData.name = null;

        if (this.context) {
            this.context.fillStyle = this.inputBoxBackgroundColor;
            this.clearRect(this.areas.all.x1, this.areas.all.y1, this.areas.all.width, this.areas.all.height);
        }
        this.update();
    },

    updateMenu: function() {
        if (this.mode == 'menu') {
            var opacity = .88;
            this.drawImage('menuArrowUp', this.areas.menuButton.x1, this.areas.menuButton.y1);
            this.drawImageWithAlpha('menu', this.areas.menu.x1, this.areas.menu.y1, opacity);
                   
            this.context.fillStyle = 'rgba(255,255,255,.4)';
            this.fillRect( this.areas.menu.x1 + 9 + (this.brushType + 1) * 15, 115, 13, 13 );

            var soundImageName = null;
            if ( this.data.type && this.typesWithSoundId.indexOf(this.types[this.data.type].key) >= 0 ) {
                if (this.data.prop && this.data.prop.soundId) {
                    soundImageName = 'removeSound';
                }
                else {
                    soundImageName = 'addSound';
                }
            }
            else {
                soundImageName = 'addSound';
                opacity = .4;
            }
            this.drawImageWithAlpha(soundImageName, this.areas.menu.x1 + 4, this.areas.menu.y1 + 124, opacity);
        }
    },

    updateCells: function() {
        this.clearRects( ['multiCells'] );
        if (this.data.type != undefined && this.data.type != null && this.types[this.data.type]) {

            if ( this.types[this.data.type].isAnimated && this.data.type != 'glow' ) {
                var prefix = '';
                if ( ['wearable', 'emitter', 'gatherable', 'motion', 'holder', 'aimable',
                      'interactingMotion', 'backAndFrontThing', 'multithing'].indexOf(this.data.type) >= 0 ) {
                    prefix = ig.game.strings.toUpperCaseFirst(this.data.type);
                }
                else if (this.data.type == 'wearableBig') {
                    prefix = 'Wearable';
                }
                this.drawImage('cells' + prefix + this.selectedCell + 'active', this.areas.cell0.x1, this.areas.cell0.y1);

                if (this.types[this.data.type].isMountable) {
                    this.drawImage('moveAvatarArrows', this.areas.example.x1, this.areas.example.y1);
                }

                if (this.data.type == 'aimable') {
                    this.drawImage('specsButton', this.areas.specsButton.x1, this.areas.specsButton.y1);
                }
                else if (this.data.type == 'interacting') {
                    this.drawImage('helpButton', this.areas.interactingHelpButton.x1, this.areas.interactingHelpButton.y1);

                    var buttonName = 'textualButton' + (this.interactingDialog && this.interactingDialog.isOpen ? '_active' : '');
                    this.drawImage(buttonName, this.areas.textualButtonWhenAnimated.x1, this.areas.textualButtonWhenAnimated.y1 );

                    buttonName = 'thingReferencesButton' + (this.thingReferencesDialog && this.thingReferencesDialog.isOpen ? '_active' : '');
                    this.drawImage(buttonName, this.areas.thingReferencesButton.x1, this.areas.thingReferencesButton.y1);
                }
                else if (this.data.type == 'gatherable') {
                    this.drawImage('useButton', this.areas.useButton.x1, this.areas.useButton.y1);
                    this.drawImage('hasButton', this.areas.hasButton.x1, this.areas.hasButton.y1);
                }
                
                if (this.data.type == 'holder') {
                    this.drawImage('helpButton', this.areas.helpButton.x1, this.areas.helpButton.y1);
                    if (this.selectedCell == 2) {
                        this.context.fillStyle = this.getRgbaString(this.canvasOverlayRgb);
                        var marginLeft = (29 - 19) / 2;
                        this.fillRect( this.areas.drawingOffset.x1, this.areas.drawingOffset.y1, this.drawingZoom * this.tileWidth, this.drawingZoom * (29 - 19) );
                        this.fillRect( this.areas.drawingOffset.x1, this.areas.drawingOffset.y1, this.drawingZoom * marginLeft, this.drawingZoom * 29 );
                        this.fillRect( this.areas.drawingOffset.x1 + this.drawingZoom * (29 - marginLeft), this.areas.drawingOffset.y1, this.drawingZoom * 5, this.drawingZoom * 29 );
                    }
                }
                else if (this.data.type == 'multithing') {
                    this.drawImage('helpButton', this.areas.helpButton.x1, this.areas.helpButton.y1);
                }
                
            }
            else if (this.data.type == 'sound') {
                this.drawImage('creditButton', this.areas.creditButton.x1, this.areas.creditButton.y1);
            }
            else if (this.data.type == 'readable') {
                this.drawImage('textualButton', this.areas.textualButton.x1, this.areas.textualButton.y1);
                this.drawImage('helpButton', this.areas.helpButton.x1, this.areas.helpButton.y1);
                
            }
            else if (this.data.type == 'mift') {
                var buttonName = 'toButton' + (this.data.prop && this.data.prop.toId ? 'Active' : '');
                this.drawImage(buttonName, this.areas.toButton.x1, this.areas.toButton.y1);
                
                buttonName = 'textualButton' + (this.data.prop && this.data.prop.text ? '_active' : '');
                this.drawImage(buttonName, this.areas.textualButton.x1, this.areas.textualButton.y1);
                
                if (!ig.game.hasMinfinity) {
                    this.drawImage('buyNowButton', this.areas.createButton.x1, this.areas.createButton.y1);
                }

                buttonName = 'soundButton' + (this.data.prop && this.data.prop.soundId ? '_active' : '');
                this.drawImage(buttonName, this.areas.changeBehavior.x1, this.areas.changeBehavior.y1);
            }
            else if (this.data.type == 'brain') {
                this.drawImage('textualButton', this.areas.textualButton.x1, this.areas.textualButton.y1);
                this.drawImage('helpButton', this.areas.brainHelpButton.x1, this.areas.brainHelpButton.y1);
            }
            else if (this.data.type == 'interactiveEnvironment') {
                this.drawImage('useAtGetButtons', this.areas.useAtGetButtons.x1, this.areas.useAtGetButtons.y1);
            }
            else if ( ['glow', 'viewable'].indexOf(this.data.type) >= 0 ) {
                if (this.selectedCell == 0) {
                    this.context.fillStyle = this.getRgbaString(this.canvasOverlayRgb);
                    this.fillRect(this.areas.drawingOffset.x1, this.areas.drawingOffset.y1, this.drawingZoom * 38, this.drawingZoom * 9);
                    this.fillRect(this.areas.drawingOffset.x1, this.areas.drawingOffset.y1 + this.drawingZoom * (9 + 19), this.drawingZoom * 38, this.drawingZoom * 10);

                    this.fillRect(this.areas.drawingOffset.x1, this.areas.drawingOffset.y1, this.drawingZoom * 9, this.drawingZoom * 38);
                    this.fillRect(this.areas.drawingOffset.x1 + this.drawingZoom * (9 + 19), this.areas.drawingOffset.y1, this.drawingZoom * 10, this.drawingZoom * 38);
                }

                if (this.data.type == 'viewable') {
                    this.handleOptionalCellsTabs('viewable');
                }
                else {
                    this.drawImage('cells' + this.selectedCell + 'active', this.areas.cell0.x1, this.areas.cell0.y1);
                }
            }

            else if (this.types[this.data.type].hasOptionalCells) {
                this.handleOptionalCellsTabs('multi');
                if (this.data.type == 'dynamicThing') {
                    this.drawImage('dynamicTextButton', this.areas.dynamicTextButton.x1, this.areas.dynamicTextButton.y1);
                    this.drawImage('dynamicHelpButton', this.areas.dynamicHelpButton.x1, this.areas.dynamicHelpButton.y1);

                    var buttonName = 'dynamicEmitsButton' + (this.data.prop && this.data.prop.emitsId ? 'Active' : '');
                    this.drawImage(buttonName, this.areas.dynamicEmitsButton.x1, this.areas.dynamicEmitsButton.y1);
                }
                else if (this.data.type == 'farBack') {
                    this.drawImage('dynamicTextButton', this.areas.dynamicTextButton.x1, this.areas.dynamicTextButton.y1);
                    this.drawImage('dynamicHelpButton', this.areas.dynamicHelpButton.x1, this.areas.dynamicHelpButton.y1);
                }
                else if (this.data.type == 'happening') {
                    this.drawImage('dynamicTextButton', this.areas.dynamicTextButton.x1, this.areas.dynamicTextButton.y1);
                    this.drawImage('dynamicHelpButton', this.areas.dynamicHelpButton.x1, this.areas.dynamicHelpButton.y1);
                }
                else if (this.data.type == 'musicSheet') {
                    var imageName = 'playMusicSheetButton' + (this.musicSheetTimer? 'On' : 'Off');
                    this.drawImage(imageName, this.areas.playMusicButton.x1, this.areas.playMusicButton.y1);
                    this.drawImage('convertMusicSheetButton', this.areas.convertMusicSheetButton.x1, this.areas.convertMusicSheetButton.y1);
                    this.drawImage('changeNoteDelay', this.areas.changeNoteDelay.x1, this.areas.changeNoteDelay.y1);
                }
            }

            else if (this.data.type == 'music') {
                if (this.data.prop && this.data.prop.musicData) {
                    this.drawImage('musicDataFull', this.areas.createButton.x1 - 18, this.areas.createButton.y1 + 4);
                }
            }
            
            else if (this.data.type == 'mover') {
                this.drawImage('dynamicTextButton', this.areas.dynamicTextButton.x1, this.areas.dynamicTextButton.y1);
                this.drawImage('dynamicHelpButton', this.areas.dynamicHelpButton.x1, this.areas.dynamicHelpButton.y1);
                
                var name = 'holdableButton' + (this.data.prop.holdableId ? 'Active' : '');
                this.drawImage(name, this.areas.holdableButton.x1, this.areas.holdableButton.y1);
                
                name = 'wearableButton' + (this.data.prop.wearableId ? 'Active' : '');
                this.drawImage(name, this.areas.wearableButton.x1, this.areas.wearableButton.y1);
                
                name = 'protectPercentButton' + (this.data.prop.protectPercent ? 'Active' : '');
                this.drawImage(name, this.areas.protectPercentButton.x1, this.areas.protectPercentButton.y1);
                
                name = 'moverUseButton' + (this.data.prop.useKeyword ? 'Active' : '');
                this.drawImage(name, this.areas.moverUseButton.x1, this.areas.moverUseButton.y1);
            }
            
            else if (this.data.type == 'liner') {
                var buttonName = 'linerAddEnvironmentButton' + (this.data.prop && this.data.prop.environmentId ? 'Active' : '');
                this.drawImage(buttonName, this.areas.linerAddEnvironmentButton.x1, this.areas.linerAddEnvironmentButton.y1);
                
                buttonName = 'linerAddAtButton' + (this.data.prop && this.data.prop.atKeyword ? 'Active' : '');
                this.drawImage(buttonName, this.areas.linerAddAtButton.x1, this.areas.linerAddAtButton.y1);
            }

            else if ( this.data.type == 'crumbling' && this.data.prop && this.data.prop.attributes &&
                        (this.data.prop.attributes.indexOf('strongWhenWalked') >= 0 || this.data.prop.attributes.indexOf('strongWhenWalkedAndBumped') >= 0) ) {
                this.drawImage('useButton', this.areas.useButtonAlternative.x1, this.areas.useButtonAlternative.y1);
            }

            else if (this.data.type == 'body') {
                for (var i = 0; i < ig.game.maxCellsMulti; i++) {
                    var x = this.areas.multiCells.x1 + this.spritesheetImages.multiCell0.width * i;
                    this.drawImage( 'multiCell' + i + (i == this.selectedCell ? 'active' : ''), x, this.areas.multiCells.y1 );
                }

                this.clearRects( ['example', 'exampleText'] );
                var labels = ['stand', 'walk', 'jump', 'fall', 'climb', 'create', 'sit', 'blink', 'talk'];
                this.context.font = this.defaultFont;
                this.context.fillStyle = 'rgb(60,60,60)';
                this.fillText( labels[this.selectedCell].toUpperCase(), this.areas.exampleText.x1, this.areas.exampleText.y1 + 5);
            }

            if ( this.types[this.data.type].canHaveMotionId ) {
                var buttonName = 'motionIdButton' + (this.data.prop && this.data.prop.motionId ? 'Active' : '');
                this.drawImage(buttonName, this.areas.motionIdButton.x1, this.areas.motionIdButton.y1);
            }

            if (this.data.type == 'motion' || this.data.type == 'interactingMotion') {
                this.clearRects( ['example', 'exampleText'] );
                if (this.selectedCell == '2') {
                    var label = 'Emit';
                    this.context.font = this.defaultFont;
                    this.context.fillStyle = 'rgb(60,60,60)';
                    this.fillText( label.toUpperCase(), this.areas.exampleText.x1, this.areas.exampleText.y1 + 5 );
                }
            }
            else if (this.data.type == 'holder') {
                this.drawImage('sizeButton', this.areas.sizeButton.x1, this.areas.sizeButton.y1);
                this.drawImage('needsButton', this.areas.needsButton.x1, this.areas.needsButton.y1);
            }
            else if (this.data.type == 'transforming') {
                this.drawImage('timeButton', this.areas.timeButton.x1, this.areas.timeButton.y1);
                
                var buttonName = 'givesButton' + (this.thingReferencesDialog && this.thingReferencesDialog.isOpen ? '_active' : '');
                this.drawImage(buttonName, this.areas.givesButton.x1, this.areas.givesButton.y1);
            }
            else if (this.data.type == 'pointer') {
                this.drawImage('helpButton', this.areas.helpButton.x1, this.areas.helpButton.y1);
            }
            else if (this.data.type == 'placeName') {
                this.drawImage('helpButton', this.areas.helpButton.x1, this.areas.helpButton.y1);
            }

            if ( this.getCurrentTypeHasLivePreview() ) {
                this.drawImage('livePreviewPlayButton', this.areas.preview.x1 + 7, this.areas.preview.y1 + 6);
            }
        }
    },

    handleOptionalCellsTabs: function(sName) {
        for (var i = 0; i < this.optionalCellCount; i++) {
            var x = this.areas.multiCells.x1 + this.spritesheetImages.multiCell0.width * i;
            var thisName = i == 0 ? sName + 'Base' : sName + 'MoreCell';
            if ( ['dynamicThing', 'happening', 'musicSheet', 'farBack', 'transforming'].indexOf(this.data.type) >= 0 ) {
                thisName= 'multiCellDynamic' + i;
            }
            thisName += (i == this.selectedCell ? 'Active' : '')
            this.drawImage(thisName, x, this.areas.multiCells.y1);
        }
        this.drawImage('moreCellAdd', this.areas.cellAdd.x1, this.areas.cellAdd.y1);
        this.drawImage('moreCellRemove', this.areas.cellRemove.x1, this.areas.cellRemove.y1);
    },

    rgbasAreSame: function(rgba1, rgba2) {
        return rgba1.r == rgba2.r &&
               rgba1.g == rgba2.g &&
               rgba1.b == rgba2.b &&
               rgba1.alpha == rgba2.alpha;
    },

    rgbasAreBothNearBlack: function(rgba1, rgba2) {
        var maxGrayConsideredBlack = 20;
        return rgba1.r <= maxGrayConsideredBlack && rgba2.r <= maxGrayConsideredBlack &&
               rgba1.g <= maxGrayConsideredBlack && rgba2.g <= maxGrayConsideredBlack &&
               rgba1.b <= maxGrayConsideredBlack && rgba2.b <= maxGrayConsideredBlack;
    },

    sameArrayValues: function(a, b) {
        var areSame = a.length == b.length, max = a.length;
        for (var i = 0; i < max && areSame; i++) { areSame = a[i] == b[i]; }
        return areSame;
    },

    getRequiredBordersByType: function(type) {
        var requiredBordersDefault = 4;
        return type && this.types[type] && this.types[type].requiredBorders != null ?
                this.types[type].requiredBorders : requiredBordersDefault;
    },

    updateNameAndTypeText: function() {
        if (this.data.type != this.oldData.type || this.data.name != this.oldData.name || this.data.direction != this.oldData.direction) {

            if (this.data.type != this.oldData.type) {
                if (this.types[this.data.type] && this.types[this.data.type].limitedDirections) {
                    var resetDirection = true;
                    if (this.oldData.type && this.types[this.oldData.type].limitedDirections) {
                        resetDirection = !this.sameArrayValues(
                                this.types[this.data.type].limitedDirections,
                                this.types[this.oldData.type].limitedDirections);
                    }
                    if (resetDirection) { this.data.direction = this.types[this.data.type].limitedDirections[0]; }
                }
                else {
                    this.data.direction = this.data.type != null && this.types[this.data.type].hasDirection ? 0 : null;
                }

                if ( ig.game.ourPlayer.rank <= 1 && this.getRequiredBordersByType(this.data.type) != this.getRequiredBordersByType(this.oldData.type) ) {
                    this.fadeInDrawBigMessage(true);
                }
            }

            this.oldData.name = this.data.name;
            this.oldData.type = this.data.type;
            this.oldData.direction = this.data.direction;

            if ( ['musicSheet', 'holder', 'dynamicThing', 'happening', 'farBack'].indexOf(this.data.type) === -1 ) {
                this.clearRects( ['changeDirection', 'changeName', 'changeType', 'changeBehavior', 'changeAttributes',
                        'pasteButton', 'pasteButtonAlternative'] );
            }
            var maxLength = 16;

            jQuery('#' + this.inputBoxId).attr('value', this.data.name);

            var typeTitleToDisplay = this.data.type != null && this.types[this.data.type].title != null ? this.types[this.data.type].title.toUpperCase() : '';
            if (typeTitleToDisplay != '') {
                this.context.fillStyle = this.inputBoxBackgroundColor;
                this.fillRect(this.areas.changeType.x1, this.areas.changeType.y1, this.areas.changeType.width, this.areas.changeType.height);

                typeTitleToDisplay = ig.game.strings.cutStringLength(typeTitleToDisplay, maxLength, true);
                this.context.font = this.defaultFont;
                this.context.fillStyle = 'rgb(90,90,90)';
                this.fillText(typeTitleToDisplay,
                        this.areas.changeType.x1 + this.areas.textBoxPadding.x1, this.areas.changeType.y1 + this.areas.textBoxPadding.y1 + this.fontOffsetY);
            }
            else {
                this.clearRect(this.areas.changeType.x1, this.areas.changeType.y1, this.areas.changeType.width, this.areas.changeType.height);
            }

            if (this.data.type != null) {
                if (this.types[this.data.type].exampleRow) {
                    var helpImage = null;
                    if (this.types[this.data.type].hasMultiDirection) {
                        helpImage = 'example_' + this.data.type;
                    }
                    else {
                        helpImage = 'example_' + this.data.type + (this.data.direction != null ? '_' + this.data.direction : '');
                    }
                    this.drawImage(helpImage, this.areas.example.x1, this.areas.example.y1);
                }

                if (this.data.direction != null) {
                    var directionImage = null;
                    if (this.types[this.data.type].hasMultiDirection) {
                        directionImage = 'multiDirectionArrow_' + this.data.direction;
                    }
                    else {
                        directionImage = 'directionArrow' + (this.types[this.data.type].isDiagonal ? 'Diagonal' : '') + '_' + this.data.direction;
                    }
                    this.drawImage(directionImage, this.areas.changeDirection.x1, this.areas.changeDirection.y1);
                }

                if (this.types[this.data.type].parent) {
                    this.drawImage('changeBehavior', this.areas.changeBehavior.x1, this.areas.changeBehavior.y1);
                }
                if ( ig.game.attributesManager.info[ this.types[this.data.type].key ] ) {
                    this.drawImage('changeAttributes', this.areas.changeAttributes.x1, this.areas.changeAttributes.y1);
                }

                switch (this.data.type) {
                    case 'medium':
                        this.drawImage('pasteButton', this.areas.pasteButtonAlternative.x1, this.areas.pasteButtonAlternative.y1);
                        break;
                    case 'pointer':
                        this.drawImage('pasteButton', this.areas.pasteButton.x1, this.areas.pasteButton.y1);
                        break;
                    case 'writable':
                        this.drawImage('rightsButton', this.areas.rightsButton.x1, this.areas.rightsButton.y1);
                        break;
                }

            }
        }
    },

    getColorsOfPage: function(page) {
        var colors = [];
        var min = page * this.colorsPerPalettePage;
        if (page >= 1) { min++; }
        var max = min + this.colorsPerPalettePage;
        var counter = 0;
        for (var i = min; i < max; i++) {
            colors.push(i);
        }
        return colors;
    },

    getColorsOfCurrentPage: function() {
        return this.getColorsOfPage(this.selectedPalettePage);
    },

    updatePalette: function() {
        var colors = this.getColorsOfCurrentPage();
        for (var relativeIndex in colors) {
            relativeIndex = parseInt(relativeIndex);
            var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }
            this.drawPaletteBoxFull(index, relativeIndex);
        }
        this.drawPaletteBoxFull(this.transparentIndex, this.transparentIndex);

        this.drawColorInfoIfNeeded();
        this.drawPalettePageButtonIfNeeded();
    },

    drawPaletteBoxFull: function(index, relativeIndex) {
        var rect = this.getPaletteBoxRectangle(index, relativeIndex);
        this.drawPaletteBox(rect, index, this.data.colors[index]);
        if (this.selectedColor == index && index != this.transparentIndex) {
            if (this.mode == 'pickColor') {
                this.clearRect(rect.x, rect.y + 18, 14, 9);
            }
            else {
                this.drawImageWithAlpha('colorPickerButton', rect.x, rect.y + 14, .75);
            }
        }
        else if (this.mode != 'pickColor') {
            this.clearRect(rect.x, rect.y + 15, 12, 11);
        }

        if (index == this.secondaryColorIndex && !ig.ua.mobile) {
            this.context.font = this.defaultFont;
            var color = this.data.colors[this.secondaryColorIndex];
            var backgroundIsVeryDark = color && color.alpha == 1 && (color.r + color.g + color.b) / 3 <= 80;
            this.context.fillStyle = backgroundIsVeryDark ? 'rgba(200,200,200,.5)' : 'rgba(0,0,0,.5)';
            this.fillText('R', rect.x + 4, rect.y + 8 + this.fontOffsetY);
        }
    },

    drawPalettePageButtonIfNeeded: function() {
        if ( this.getNeedsPalettePageButton() ) {
            var rect = this.areas.palettePageButton;
            for (var page = 0; page < this.palettePagesMax; page++) {
                var colors = this.getColorsOfPage(page);
                var y = rect.y1 + page * 2;
                for (var relativeIndex in colors) {
                    relativeIndex = parseInt(relativeIndex);
                    var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }

                    var rgba = this.data.colors[index];
                    if (rgba == null || rgba == undefined) { rgba = {r: 255, g: 255, b: 255, alpha: 1}; }
                    rgba = ig.game.cloneObject(rgba);
                    rgba.alpha *= page == this.selectedPalettePage ? 1 : .35;
                    this.context.fillStyle = this.getRgbaString(rgba);
                    this.fillRect(rect.x1 + relativeIndex, y, 1, 1);
                }
            }
        }
    },

    setPageOfSelectedColor: function() {
        for (var page = 0; page < this.palettePagesMax; page++) {
            var colors = this.getColorsOfPage(page);
            for (var relativeIndex in colors) {
                relativeIndex = parseInt(relativeIndex);
                var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }
                if (index == this.selectedColor) {
                    this.selectedPalettePage = page;
                    break;
                }
            }
        }
    },

    handleMouseWheeled: function(event) {
        this.didWheelThisSession = true;
        var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
        var direction = delta > 0 ? -1 : 1;
        this.selectedPalettePage = ( parseInt(this.selectedPalettePage) + direction ).limit(0, this.palettePagesMax - 1);
        ig.game.sounds.click.play();
        this.update();
    },

    getNeedsPalettePageButton: function() {
        return this.didWheelThisSession || this.nonDefaultColorsInHigherPagesFound() || this.allColorsOnFirstPageUnique();
    },

    nonDefaultColorsInHigherPagesFound: function() {
        var found = false;
        var defaultColor = this.getRgbaString( this.getDefaultColor() );

        for (var page = 1; page < this.palettePagesMax; page++) {
            var colors = this.getColorsOfPage(page);
            for (var relativeIndex in colors) {
                relativeIndex = parseInt(relativeIndex);
                var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }

                var rgbaString = this.getRgbaString( this.data.colors[ colors[relativeIndex] ] );
                if (rgbaString != defaultColor) {
                    found = true;
                    break;
                }
            }
        }

        return found;
    },

    allColorsOnFirstPageUnique: function() {
        var dupeFound = false;
        var colors = this.getColorsOfPage(0);
        var rgbaStrings = [];
        for (var relativeIndex in colors) {
            relativeIndex = parseInt(relativeIndex);
            var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }

            var rgbaString = this.getRgbaString( this.data.colors[ colors[relativeIndex] ] );
            if ( rgbaStrings.indexOf(rgbaString) >= 0 ) {
                dupeFound = true;
            }
            else {
                rgbaStrings.push(rgbaString);
            }
        }
        return !dupeFound;
    },

    drawColorInfoIfNeeded: function() {
        if (this.data && this.data.type) {
            var text = null;
            var attributes = {};
            if (this.data.prop && this.data.prop.attributes) {
                attributes = ig.game.attributesManager.getStringsAsBooleans(this.data.prop.attributes);
            }

            if (this.data.type == 'musicSheet') {
                if (this.musicSheetSpecialIndex[this.selectedColor]) {
                    if (this.musicSheetSpecialIndex[this.selectedColor] == 'terminator') {
                        text = '->';
                    }
                    else {
                        text = this.musicSheetSpecialIndex[this.selectedColor];
                    }
                }
                else if (this.instruments[this.selectedColor]) {
                    text = this.instruments[this.selectedColor];
                    var label = ig.game.attributesManager.info.STACKINSTR[text] ? ig.game.attributesManager.info.STACKINSTR[text].label : text;
                    if (label) { text = label; }
                    if (this.selectedColor == 8) {
                        text = ig.game.strings.cutStringLength(text, 8);
                    }
                    if (this.selectedColor >= 9 && this.selectedColor <= 11) {
                        text = ig.game.strings.cutStringLength(text, 6);
                    }
                }
                
            }
            else if (this.selectedColor == 0) {
                if (this.data.type == 'glow') { text = 'light glow'; }
                else if ( ['light', 'lighttop', 'fillLight', 'vignette'].indexOf(this.data.type) >= 0 ) { text = 'light'; }
                else if ( (this.data.type == 'holdableItem' || this.data.type == 'emitter') && attributes.hook) { text = 'swing line'; }
                else if ( (this.data.type == 'holdableItem' || this.data.type == 'emitter') && attributes.affecting ) { text = 'affecting'; }
                else if (this.data.type == 'wearable' && attributes.shaded) { text = 'shade'; }
                else if ( ['animatedThing', 'body', 'touchableThing', 'equipment', 'interacting', 'holder'].indexOf(this.data.type) >= 0 && attributes.dripping ) { text = 'drop'; }
                else if ( ['animatedThing', 'body', 'touchableThing', 'equipment', 'holder'].indexOf(this.data.type) >= 0 && attributes.sprinkling ) { text = 'sprinkle'; }
                else if ( ['holder'].indexOf(this.data.type) >= 0 && (attributes.border || attributes.thickBorder) ) { text = 'border'; }
                else if (this.data.type == 'flexible' && attributes.crumbling) { text = 'crumble'; }
                else if (this.data.type == 'liner') { text = 'line'; }
                else if (this.data.type == 'farBack') { text = 'fill'; }
                else if (this.data.type == 'writable' || this.data.type == 'readable') { text = 'background'; }
                
            }
            else if (this.selectedColor == 1) {
                if (this.data.type == 'writable' || this.data.type == 'readable') { text = 'text'; }
                else if (this.data.type == 'liner' && attributes.coloredOutline) { text = 'outline'; }
                else if ( this.data.type == 'farBack' && (attributes.gradient || attributes.shortGradient || attributes.longGradient) ) {
                    text = 'gradient';
                }
                
            }

            if (text) {
                var colorIndexRelative = this.selectedColor;
                if (colorIndexRelative > this.colorsPerPalettePage - 1) {
                    colorIndexRelative = this.selectedColor % this.colorsPerPalettePage - 1;
                }
                var rect = this.getPaletteBoxRectangle(this.selectedColor, colorIndexRelative);
                this.context.fillStyle = 'rgba(0,0,0,.3)';
                this.fillText( '= ' + text.toUpperCase(), rect.x + 17, rect.y + 21 + this.fontOffsetY );
            }
        }
    },

    drawPaletteBox: function(rect, colorIndex, rgba) {
        var rgbaStroke = this.selectedColor == colorIndex ? {r: 80, g: 80, b: 80, alpha: 1} : {r: 132, g: 132, b: 132, alpha: 1};

        var border = 1;
        this.context.fillStyle = this.getRgbaString(rgbaStroke);
        this.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.clearRect(rect.x + border, rect.y + border, rect.width - border * 2, rect.height - border * 2);
        this.context.fillStyle = this.getRgbaString(rgba);
        this.fillRect(rect.x + border, rect.y + border, rect.width - border * 2, rect.height - border * 2);
    },

    getPaletteBoxRectangle: function(colorIndex, colorIndexRelative, isPreview) {
        if (isPreview === undefined || isPreview == null) { isPreview = false; }

        var width = this.areas.paletteBox.width, height = this.areas.paletteBox.height;
        var x = this.areas.paletteBoxes.x1 + colorIndexRelative * width, y = this.areas.paletteBoxes.y1;

        if (colorIndex == this.transparentIndex) { x += 6; }
        if (isPreview) { x -= 3; y += 6; width += 5; height += 5; }

        return {x: x, y: y, width: width, height: height};
    },

    updateDrawing: function() {
        var backgroundRgb = this.cloneRgba(this.backgroundRgb);
        backgroundRgb.alpha = 1;
        var isAnimated = this.data.type && (this.types[this.data.type].isAnimated || this.types[this.data.type].isMultiAnimated);

        var isDefaultSize = this.data.type && this.types[this.data.type].tileSize &&
                this.types[this.data.type].tileSize.width == this.tileWidthDefault &&
                this.types[this.data.type].tileSize.height == this.tileHeightDefault;
        if (isDefaultSize) {
            this.context.fillStyle = this.getRgbaString(backgroundRgb);
            this.fillRect(this.areas.drawingMaxOffset.x1 - 2, this.areas.drawingMaxOffset.y1 - 2,
                    this.areas.drawingMax.width + 4, this.areas.drawingMax.height + 4);
        }
        else {
            this.context.fillStyle = this.getRgbaString(this.canvasOverlayRgb);
            this.fillRect(this.areas.drawingMaxOffset.x1, this.areas.drawingMaxOffset.y1,
                    this.areas.drawingMax.width + 1, this.areas.drawingMax.height + 1);
        }
        this.clearRect(this.areas.drawingOffset.x1, this.areas.drawingOffset.y1,
                this.areas.drawing.width + 2, this.areas.drawing.height + 2);

        var partName = isAnimated && !ig.ua.mobile ? 'canvasHelpAnimated' : 'canvasHelp';
        if (this.data.type == 'body') {
             if (this.selectedCell == 6) { partName = 'canvasHelpSit'; }
             else if (this.selectedCell >= 7) { partName = 'canvasHelpOverlay'; }
        }

        var infoSize = this.spritesheetImages[partName];
        this.drawImage(partName,
                this.areas.drawingOffset.x1 + this.areas.drawing.width / 2 - infoSize.width / 2,
                this.areas.drawingOffset.y1 + this.areas.drawing.height - 2 - infoSize.height);

        this.updateStaticTemplateIfNeeded();

        if (this.showGrid) { this.drawGrid(); }
        if (this.drawSymmetric) {
            this.drawImageWithAlpha('symmetryLine', this.areas.symmetryLine.x1 + .5, this.areas.symmetryLine.y1, .4);
        }

        this.updateDrawingPixels();

        if (isAnimated && this.data.type != 'wearable' && this.data.type != 'wearableBig' && this.data.type != 'musicSheet') {
            var otherCell = null;

            if (this.data.type == 'body') {
                switch (this.selectedCell) {
                    case this.bodyCells.sit:
                    case this.bodyCells.walk:
                    case this.bodyCells.blink:
                    case this.bodyCells.talk:
                        otherCell = this.bodyCells.stand;                        
                        break;

                    case this.bodyCells.jump:
                        otherCell = this.bodyCells.stand;
                        break;

                    case this.bodyCells.fall:
                        otherCell = this.bodyCells.jump;
                        break;

                    case this.bodyCells.create:
                        otherCell = this.bodyCells.climb;
                        break;

                    case this.bodyCells.climb:
                        otherCell = this.bodyCells.create;
                        break;
                }
            }
            else if (this.data.type == 'viewable' || this.data.type == 'glow') {
            }
            else if (this.data.type == 'backAndFrontThing') {
                if (this.selectedCell == 1) { otherCell = 0; }
            }
            else {
                otherCell = this.selectedCell == 0 ? 1 : 0;
                if (this.types[this.data.type].isMultiAnimated) {
                    otherCell = this.selectedCell - 1;
                    if (otherCell < 0) { otherCell = ig.game.maxCellsMulti - 1; }
                    if (!this.data.pixels[ig.game.maxCellsMulti - 1]) {
                        // to do if multi cells brought back
                    }
                }
            }

            if (otherCell != null) {
                for (var x = 0; x < this.data.pixels[0].length; x++) {
                    for (var y = 0; y < this.data.pixels[0][0].length; y++) {
                        if (this.data.pixels[otherCell] && this.data.pixels[otherCell][x] && this.data.pixels[otherCell][x][y] != undefined &&
                            this.data.pixels[this.selectedCell] && this.data.pixels[this.selectedCell][x] && this.data.pixels[this.selectedCell][x][y] != undefined) {
                            var colorIndex = this.data.pixels[this.selectedCell][x][y];
                            var colorIndexOther = this.data.pixels[otherCell][x][y];
                            var rgba = this.data.colors[colorIndex];
                            var rgbaOther = this.data.colors[colorIndexOther];
                            if (rgba && rgbaOther) {
                                var selfIsEmpty = !rgba.alpha || rgba.alpha == 0;
                                if (selfIsEmpty && rgbaOther.alpha != 0) {
                                    var fadedOpacity = rgbaOther.alpha * .4;
                                    this.drawPixelInDrawing( x, y, {r: rgbaOther.r, g: rgbaOther.g, b: rgbaOther.b, alpha: fadedOpacity} );
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (this.data.type == 'musicSheet') {
            this.drawInstrumentGridLines();
            if (this.musicSheetTimer) { this.drawMusicSheetPosition(); }
        }
        
        if (this.data.type == 'music' && !this.data.prop.musicData) {
            this.informAboutMissingMusicData();
        }
    },
    
    updateDrawingPixels: function() {
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                if (this.data.pixels[this.selectedCell] && this.data.pixels[this.selectedCell][x] != undefined && this.data.pixels[this.selectedCell][x][y] != undefined) {
                    var colorIndex = this.data.pixels[this.selectedCell][x][y];
                    if (colorIndex != this.transparentIndex) {
                        var rgba = this.data.colors[colorIndex];
                        this.drawPixelInDrawing(x, y, rgba);
                    }
                }
            }
        }
    },

    updateDrawingSinglePixel: function(x, y) {
        if (this.data.pixels[this.selectedCell] && this.data.pixels[this.selectedCell][x] != undefined && this.data.pixels[this.selectedCell][x][y] != undefined) {
            var colorIndex = this.data.pixels[this.selectedCell][x][y];
            var rgba = this.data.colors[colorIndex];
            this.drawPixelInDrawing(x, y, rgba);
        }
    },
    
    drawPixelInDrawing: function(pixelX, pixelY, rgba) {
        var x = this.areas.drawingOffset.x1 + pixelX * this.drawingZoom;
        var y = this.areas.drawingOffset.y1 + pixelY * this.drawingZoom;
        this.context.fillStyle = this.getRgbaString(rgba);
        this.fillRect(x, y, this.drawingZoom, this.drawingZoom);
    },

    cloneRgba: function(rgba) {
        return {r: rgba.r, g: rgba.g, b: rgba.b, alpha: rgba.alpha};
    },

    somethingIsDrawn: function() {
        var foundDrawnPixel = false;
        for (var cell = 0; cell < this.maxCells && !foundDrawnPixel; cell++) {
            for (var x = 0; x < this.tileWidth && !foundDrawnPixel; x++) {
                for (var y = 0; y < this.tileWidth && !foundDrawnPixel; y++) {
                    foundDrawnPixel = this.data.pixels[cell] && this.data.pixels[cell][x][y] != this.transparentIndex;
                }
            }
        }
        return foundDrawnPixel;
    },

    pixelHasBeenDrawn: function(cell) {
        var hasBeenDrawn = false;
        if (cell === null || cell === undefined) { cell = this.selectedCell; }
        if (this.data && this.data.pixels && this.data.pixels[cell]) {
            for (var x = 0; x < this.data.pixels[cell].length; x++) {
                for (var y = 0; y < this.data.pixels[cell][x].length; y++) {
                    hasBeenDrawn = this.data.pixels[cell][x][y] != this.transparentIndex;
                    if (hasBeenDrawn) { break; }
                }
                if (hasBeenDrawn) { break; }
            }
        }
        return hasBeenDrawn;
    },

    updateBasedOnCursor: function() {
        if (this.handleClicks) {
            if (this.mode != this.modeOld) {
                this.modeOld = this.mode;
                this.cursorWasUpSinceMode = false;
            }
            if (!this.cursorIsDown) { this.cursorWasUpSinceMode = true; }
    
            switch (this.mode) {
                case 'default': this.updateBasedOnCursorInDefaultMode(); break;
                case 'pickColor': this.updateBasedOnCursorInPickColorMode(); break;
                case 'pickType': this.updateBasedOnCursorInPickTypeMode(); break;
            }
        }
    },

    updateBasedOnCursorUp: function() {
        if (this.handleClicks) {
            if (this.mode != this.modeOld) {
                this.modeOld = this.mode;
                this.cursorWasUpSinceMode = false;
            }
            if (!this.cursorIsDown) { this.cursorWasUpSinceMode = true; }
            this.lastPixelSeenOnClick = {x: null, y: null};
    
            switch (this.mode) {
                case 'default': this.updateBasedOnCursorUpInDefaultMode(); this.recordDataHistory(); break;
                case 'pickColor': this.updateBasedOnCursorUpInPickColorMode(); this.recordDataHistory(); break;
                case 'menu': this.updateBasedOnCursorUpInMenuMode(); break;
                case 'cloneOld': this.hideSubDialog(); this.updateAll(); break;
                case 'changeColor': this.updateBasedOnCursorUpInChangeColorMode(); break;
                case 'pickAttributes': this.updateBasedOnCursorUpInPickAttributesMode(); break;
            }
        }
    },

    updateBasedOnCursorInDefaultMode: function() {
        if (this.handleClicks) {
            var x = this.cursorX, y = this.cursorY;

            if (this.cursorIsDown || this.cursorRightIsDown || this.cursorDoubleClicked) {

                var maxX = this.areas.drawingOffset.x1 + this.areas.drawing.width;
                var maxY = this.areas.drawingOffset.y1 + this.areas.drawing.height;
                var cursorIsOverDrawing = x >= this.areas.drawingOffset.x1 && x <= maxX && y >= this.areas.drawingOffset.y1 && y <= maxY;
                var pixelX = (x - this.areas.drawingOffset.x1) / this.drawingZoom;
                var pixelY = (y - this.areas.drawingOffset.y1) / this.drawingZoom;
                pixelX = Math.floor(pixelX); pixelY = Math.floor(pixelY);
                var valueIsSane = pixelX >= 0 && pixelX < this.tileWidth && pixelY >= 0 && pixelY < this.tileHeight;
                var colorIndexToDraw = this.cursorRightIsDown ? this.secondaryColorIndex : this.selectedColor;

                if (    !( this.data.pixels &&
                           this.data.pixels[this.selectedCell] &&
                           this.data.pixels[this.selectedCell][pixelX] &&
                           this.data.pixels[this.selectedCell][pixelX][pixelY] !== undefined ) ) {
                    return;
                }
                if (    symmetricPoint &&
                        !( this.data.pixels &&
                           this.data.pixels[this.selectedCell] &&
                           this.data.pixels[this.selectedCell][symmetricPoint.x] &&
                           this.data.pixels[this.selectedCell][symmetricPoint.x][symmetricPoint.y] !== undefined ) ) {
                    return;
                }

                var needsToBeHandled = valueIsSane &&
                        (   this.lineKeyIsPressed ||
                            (this.lastPixelSeenOnClick.x != pixelX || this.lastPixelSeenOnClick.y != pixelY) ||
                            colorIndexToDraw != this.data.pixels[this.selectedCell][pixelX][pixelY] ||
                            (symmetricPoint != null && colorIndexToDraw != this.data.pixels[this.selectedCell][symmetricPoint.x][symmetricPoint.y])
                        );

                this.lastPixelSeenOnClick = {x: pixelX, y: pixelY};
                        
                if (cursorIsOverDrawing && this.data.pixels[this.selectedCell]) {
                    var symmetricPoint = this.getSymmetricPointIfNeeded(pixelX, pixelY);
                   
                    if (valueIsSane && this.cursorWasUpSinceMode) {

                        if (this.cursorMode == 'pickColor') {
                            if (this.cursorRightIsDown) {
                                this.secondaryColorIndex = this.data.pixels[this.selectedCell][pixelX][pixelY];
                            }
                            else {
                                this.selectedColor = this.data.pixels[this.selectedCell][pixelX][pixelY];
                                this.setPageOfSelectedColor();
                            }
                            this.update();
                        }
                        else if (needsToBeHandled && this.cursorMode == 'floodFill') {
                            this.handleFloodFill(pixelX, pixelY, colorIndexToDraw, symmetricPoint);
                            this.updateLivePreview();

                        }
                        else if (needsToBeHandled || this.brushType !== 0) {
                            this.drawPointBasedOnBrushType( this.data.pixels[this.selectedCell], pixelX, pixelY, colorIndexToDraw );
                            if (symmetricPoint) {
                                this.drawPointBasedOnBrushType( this.data.pixels[this.selectedCell], symmetricPoint.x, symmetricPoint.y, colorIndexToDraw );
                            }

                            if (this.lineKeyIsPressed && this.lastPointDrawn.x !== null && this.lastPointDrawn.y !== null) {
                                this.drawLine( this.data.pixels[this.selectedCell], colorIndexToDraw, this.lastPointDrawn, {x: pixelX, y: pixelY} );
                                if (symmetricPoint) {
                                    var symmetricPointLast = this.getSymmetricPointIfNeeded(this.lastPointDrawn.x, this.lastPointDrawn.y);
                                    this.drawLine( this.data.pixels[this.selectedCell], colorIndexToDraw, symmetricPointLast, symmetricPoint );
                                }
                            }

                            this.lastPointDrawn = {x: pixelX, y: pixelY};
                            this.somethingChangedSinceLivePreview = true;
                            
                            this.update();
                        }
                    }

                }
    
            }
        }
    },
    
    drawLine: function(cell, colorIndex, pointA, pointB) {
        if (pointA && pointB) {
            var x0 = pointA.x, y0 = pointA.y;
            var x1 = pointB.x, y1 = pointB.y;
            
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;

            while (true) {
                this.drawPointBasedOnBrushType(cell, x0, y0, colorIndex);

                if (x0 == x1 && y0 == y1) { break; }
                var e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x0  += sx; }
                if (e2 < dx)  { err += dx; y0  += sy; }
            }
        }
    },
    
    drawPointBasedOnBrushType: function(cell, x, y, colorIndex) {
        var brushes = [
                {margin: 0, rounded: false},
                {margin: 1, rounded: true},
                {margin: 1, rounded: false},
                {margin: 2, rounded: true},
                {margin: 2, rounded: false},
                ];
        var brush = brushes[this.brushType];

        for (var xOff = -brush.margin; xOff <= brush.margin; xOff++) {
            for (var yOff = -brush.margin; yOff <= brush.margin; yOff++) {
                if ( !brush.rounded || !( Math.abs(xOff) == brush.margin && Math.abs(yOff) == brush.margin) ) {
                    this.drawPoint(cell, x + xOff, y + yOff, colorIndex);
                }
            }
        }
        
        if (this.data.type == 'musicSheet') {
            this.playPixelAsSound(this.selectedCell, x, y);
        }
    },
    
    drawPoint: function(cell, x, y, colorIndex) {
        if (cell[x] && cell[x][y] !== undefined) {
            var doDraw = true;
            if (this.shiftKeyIsPressed) {
                doDraw = (this.cursorIsDown      && cell[x][y] == this.secondaryColorIndex) ||
                         (this.cursorRightIsDown && cell[x][y] == this.selectedColor);
            }

            if (doDraw) {
                cell[x][y] = colorIndex;
            }
        }
    },

    drawGrid: function() {
        var grayTone = 70;
        this.context.fillStyle = 'rgb(' + grayTone + ',' + grayTone + ',' + grayTone + ')';

        var widthHalf = this.tileWidth / 2;
        var heightHalf = this.tileHeight / 2;
        
        for (var pixelX = 1; pixelX < this.tileWidth; pixelX++) {
            var x = this.areas.drawingOffset.x1 + pixelX * this.drawingZoom - .5;
            var y = this.areas.drawingOffset.y1;
            var width = pixelX == widthHalf ? 2 : 1;
            var height = this.tileWidth * this.drawingZoom;
            this.fillRect(x, y, width, height);
        }

        for (var pixelY = 1; pixelY < this.tileHeight; pixelY++) {
            var x = this.areas.drawingOffset.x1;
            var y = this.areas.drawingOffset.y1 + pixelY * this.drawingZoom - .5;
            var width = this.tileHeight * this.drawingZoom;
            var height = pixelY == heightHalf ? 2 : 1;
            this.fillRect(x, y, width, height);
        }
    },

    handleFloodFill: function(pixelX, pixelY, colorIndexToDraw, symmetricPoint) {
        this.drawFillPreventBorderIfNeeded(true, this.data.pixels[this.selectedCell][pixelX][pixelY], colorIndexToDraw);

        this.floodFill(pixelX, pixelY, this.data.pixels[this.selectedCell][pixelX][pixelY], colorIndexToDraw);
        if (symmetricPoint) {
            this.floodFill(symmetricPoint.x, symmetricPoint.y, this.data.pixels[this.selectedCell][symmetricPoint.x][symmetricPoint.y], colorIndexToDraw);
        }

        this.drawFillPreventBorderIfNeeded(false);
        this.update();
    },

    getSymmetricPointIfNeeded: function(x, y) {
        var p = null;
        if (this.drawSymmetric) {
            var center = parseInt(this.tileWidth / 2);
            if (x < center) { p = {x : this.tileWidth - x - 1, y : y}; }
            else if (x > center) { p = {x : Math.abs(x - this.tileWidth) - 1, y : y}; }
        }
        return p;
    },

    clonePixelsMirrorX: function(pixelsToClone) {
        var pixels = this.clonePixelsOfCell(pixelsToClone);
        var max = this.tileWidth;
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                pixels[x][y] = pixelsToClone[this.tileWidth - x - 1][y];
            }
        }
        return pixels;
    },

    clonePixelsMirrorY: function(pixelsToClone) {
        var pixels = this.clonePixelsOfCell(pixelsToClone);
        var max = this.tileWidth;
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                pixels[x][y] = pixelsToClone[x][this.tileHeight - y - 1];
            }
        }
        return pixels;
    },

    initChangeColorModes: function() {
        var factorStrong = 1, factorWeak = .5;
        var strong = Math.round(45 * factorStrong);
        var strongLess = Math.round( (strong - 18) * factorStrong );
        var weak = Math.round(45 * factorWeak);
        var weakLess = Math.round( (weak - 18) * factorWeak );

        this.changeColorModes = {
            'reset': {
                x1: 7, y1: 7
            },
            'darker': {
                rgbStrong: {r: -strongLess, g: -strongLess, b: -strongLess},
                rgbWeak:   {r: -weakLess, g: -weakLess, b: -weakLess},
                x1: 43, y1: 7
            },
            'brighter': {
                rgbStrong: {r: strongLess, g: strongLess, b: strongLess},
                rgbWeak:   {r: weakLess, g: weakLess, b: weakLess},
                x1: 81, y1: 7
            },
            'moreRed': {
                rgbStrong: {r: strong, g: -strongLess, b: -strongLess},
                rgbWeak:   {r: weak, g: -weakLess, b: -weakLess},
                x1: 119, y1: 7
            },
            'moreGreen': {
                rgbStrong: {r: -strongLess, g: strong, b: -strongLess},
                rgbWeak:   {r: -weakLess, g: weak, b: -weakLess},
                x1: 7, y1: 42
            },
            'moreBlue': {
                rgbStrong: {r: -strongLess, g: -strongLess, b: strong},
                rgbWeak:   {r: -weakLess, g: -weakLess, b: weak},
                x1: 43, y1: 42
            },
            'moreCyan': {
                rgbStrong: {r: -strongLess, g: strongLess, b: strongLess},
                rgbWeak:   {r: -weakLess, g: weakLess, b: weakLess},
                x1: 81, y1: 42
            },
            'moreMagenta': {
                rgbStrong: {r: strongLess, g: -strongLess, b: strongLess},
                rgbWeak:   {r: weakLess, g: -weakLess, b: weakLess},
                x1: 119, y1: 42
            },
            'moreYellow': {
                rgbStrong: {r: strongLess, g: strongLess, b: -strongLess},
                rgbWeak:   {r: weakLess, g: weakLess, b: -weakLess},
                x1: 7, y1: 77
            },
            'lessSaturation': {
                x1: 43, y1: 77
            },
            'moreSaturation': {
                x1: 81, y1: 77
            },
            'toggleStrength': {
                x1: 119, y1: 77
            }
        };
    },

    updateChangeColorDialog: function() {
        this.updateAll();
        this.drawImage('changeColorDialog', this.areas.changeColor.x1, this.areas.changeColor.y1);
        var modes = this.changeColorModes;
        var colorsBefore = this.cloneColors(this.data.colors);
        for (var changeMode in modes) {
            if (changeMode != 'toggleStrength') {
                var area = {
                        x1: this.areas.changeColor.x1 + modes[changeMode].x1 + this.areas.changeColorOffset.x1,
                        y1: this.areas.changeColor.y1 + modes[changeMode].y1 + this.areas.changeColorOffset.y1};
    
                switch (changeMode) {
                    case 'reset':
                        this.data.colors = this.cloneColors(this.colorsBeforeColorChanges);
                        break;
                    case 'lessSaturation':
                        this.applySaturationChange(-1);
                        break;
                    case 'moreSaturation':
                        this.applySaturationChange(1);
                        break;
                    default:
                        this.applyColorChange(this.changeColorModes[changeMode]);
                }
                this.drawTileAt(this.data.pixels[this.selectedCell], area.x1, area.y1);
    
                this.data.colors = this.cloneColors(colorsBefore);
            }
        }

        if (this.useColorChangeStrong) {
            this.clearRect(this.changeColorModes.toggleStrength);
        }
        else {
            this.context.fillStyle = 'rgb(255,255,255)';
            var rect = this.areas.changeColorToggleStrength;
            this.fillRect(this.areas.changeColor.x1 + rect.x1, this.areas.changeColor.y1 + rect.y1, rect.width, rect.height);
        }
    },

    updateBasedOnCursorUpInChangeColorMode: function() {
        var x = this.cursorX, y = this.cursorY;
        var isInCloseButtonArea = this.pointIsInRectangle(x, y, this.areas.changeColorCloseButton);
        var isInDialogArea = !isInCloseButtonArea && this.pointIsInRectangle(x, y, this.areas.changeColor);

        if (isInCloseButtonArea) {
            this.hideSubDialog();
            this.showInputBox();
            this.updateAll();
        }
        else if (isInDialogArea) {
            var modes = this.changeColorModes;

            for (var changeMode in modes) {
                var area = {x1: this.areas.changeColor.x1 + modes[changeMode].x1, y1: this.areas.changeColor.y1 + modes[changeMode].y1};
                area.x2 = area.x1 + this.areas.changeColorOffset.width;
                area.y2 = area.y1 + this.areas.changeColorOffset.height;

                if ( this.pointIsInRectangle(x, y, area) ) {
                    switch (changeMode) {
                        case 'reset':
                            this.data.colors = this.cloneColors(this.colorsBeforeColorChanges);
                            break;
                        case 'lessSaturation':
                            this.applySaturationChange(-1);
                            break;
                        case 'moreSaturation':
                            this.applySaturationChange(1);
                            break;
                        case 'toggleStrength':
                            this.useColorChangeStrong = !this.useColorChangeStrong;
                            break;
                        default:
                            this.applyColorChange(this.changeColorModes[changeMode]);
                    }

                    this.recordDataHistory();
                    ig.game.sounds.click.play();
                    this.updateChangeColorDialog();
                }
            }
        }
    },

    applySaturationChange: function(direction) {
        var strength = this.useColorChangeStrong ? .25 : .125;
        var factor = 1 + (strength * direction);
        var colorMin = 0, colorMax = 255;
        for (var i = 0; i < this.maxColors; i++) {
            if ( i != this.transparentIndex &&
                    (this.singleColorIndexToChange == null || this.singleColorIndexToChange == i) ) {
                    
                var hsv = ml.Misc.getHsvFromRgb(this.data.colors[i]);
                hsv.saturation *= factor;
                var rgb = ml.Misc.getRgbFromHsv(hsv);
                this.data.colors[i] = {r: rgb.r, g: rgb.g, b: rgb.b, alpha: this.data.colors[i].alpha * 1};
                
            }
        }
    },

    applyColorChange: function(colorAdditionSet) {
        var colorAddition = this.useColorChangeStrong ? colorAdditionSet.rgbStrong : colorAdditionSet.rgbWeak;
        var colorMin = 0, colorMax = 255;
        var defaultRgba = this.getDefaultColor();
        for (var i = 0; i < this.maxColors; i++) {
            if ( i != this.transparentIndex &&
                    (this.singleColorIndexToChange == null || this.singleColorIndexToChange == i) ) {

                var rgba = this.data.colors[i];
                var doChange = true;

                if (this.singleColorIndexToChange !== i) {
                    var isSameRgba = this.getIsSameRgba(rgba, defaultRgba);
                    if (isSameRgba) { doChange = this.colorFoundInPixels(this.data.pixels, i); }
                }

                if (doChange) {
                    this.data.colors[i] = {
                            r: (rgba.r + colorAddition.r).limit(colorMin, colorMax),
                            g: (rgba.g + colorAddition.g).limit(colorMin, colorMax),
                            b: (rgba.b + colorAddition.b).limit(colorMin, colorMax),
                            alpha: rgba.alpha
                            };
                }

            }
        }
    },

    getIsSameRgba: function(rgba1, rgba2) {
        return rgba1.r == rgba2.r && rgba1.g == rgba2.g && rgba1.b == rgba2.b && rgba1.alpha == rgba2.alpha;
    },

    floodFill: function(x, y, originColor, newColor) {
        if (originColor != newColor) {
            if (this.data.pixels[this.selectedCell][x][y] != originColor) { return; }

            this.data.pixels[this.selectedCell][x][y] = newColor;

            if (x < this.tileWidth - 1 && this.data.pixels[this.selectedCell][x + 1][y] == originColor) { this.floodFill(x + 1, y, originColor, newColor); }
            if (x > 0 && this.data.pixels[this.selectedCell][x - 1][y] == originColor) { this.floodFill(x - 1, y, originColor, newColor); }
            if (y < this.tileHeight - 1 && this.data.pixels[this.selectedCell][x][y + 1] == originColor) { this.floodFill(x, y + 1, originColor, newColor); }
            if (y > 0 && this.data.pixels[this.selectedCell][x][y - 1] == originColor) { this.floodFill(x, y - 1, originColor, newColor); }
        }
    },

    updateBasedOnCursorUpInDefaultMode: function() {
        var x = this.cursorX, y = this.cursorY;
        var thisType = this.data.type;
        var isAnimated = this.data.type != null && this.types[this.data.type].isAnimated;
        var isMultiAnimated = this.data.type != null && this.types[this.data.type].isMultiAnimated;

        if ( this.data.direction != null && this.pointIsInRectangle(x, y, this.areas.changeDirection) ) {
            this.setToNextDirection(true);

        }
        else if ( thisType == 'dynamicThing' && this.pointIsInRectangle(x, y, this.areas.dynamicEmitsButton) ) {
            if (this.data.prop.emitsId) {
                ig.game.sounds.bin.play();
                this.data.prop.emitsId = null;
                this.updateAll();
            }
            else {
                this.data.prop.emitsId = null;
                ig.game.alertDialog.open("<p>Now pick a Holdable Item from the right.</p>" +
                        "<p style=\"opacity: .6; font-size: 90%\">It will be emitted at the first cell's position if you attach the Dynamic " +
                        "and press space or hit the action button (requires attribute Attachable, Follows or Closely Follows). " +
                        "An emitting sound can be added by using Add Sound for this Dynamic.</p>", true);
                ig.game.alertDialog.contextId = 'pickEmits';
            }

        }
        else if ( thisType == 'liner' && this.pointIsInRectangle(x, y, this.areas.linerAddEnvironmentButton) ) {
            if (this.data.prop.environmentId) {
                ig.game.sounds.bin.play();
                this.data.prop.environmentId = null;
                this.updateAll();
            }
            else {
                this.data.prop.environmentId = null;
                ig.game.alertDialog.open('Now pick an Environment from the right.');
                ig.game.alertDialog.contextId = 'pickEnvironment';
            }

        }
        else if ( thisType == 'liner' && this.pointIsInRectangle(x, y, this.areas.linerAddAtButton) ) {
            ig.game.alertDialog.contextId = null;
            ig.game.alertDialog.openPrompt('Name of thing behind must contain:',
                    this.data.prop.atKeyword, ig.game.painter.saveAtKeyword,
                    undefined, undefined, undefined, undefined, undefined,
                    ig.game.validations.itemName.maxLength);

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.createButton) ) {
            this.createIfValid();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.menuButton) ) {
            this.stopPlayMusicSheet();
            this.mode = 'menu';
            ig.game.sounds.click.play();
            ig.game.motionDialog.preloadItemCachesIfNeeded();
            this.update();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.palettePageButton) && this.getNeedsPalettePageButton() ) {
            if (this.selectedPalettePage < this.palettePagesMax - 1) {
                this.selectedPalettePage++;
            }
            else {
                this.selectedPalettePage = 0;
            }
            ig.game.sounds.click.play();
            this.update();
            
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.closeButton) && this.mode == 'default' && this.cursorWasUpSinceMode ) {
            this.close();

        }
        else if ( thisType == 'interactiveEnvironment' && this.pointIsInRectangle(x, y, this.areas.useAtGetButtons) && !ig.game.alertDialog.isOpen ) {
            ig.game.alertDialog.contextId = null;
            if ( x > this.areas.useAtGetButtons.x1 + this.areas.useAtGetButtons.width * (2 / 3) ) {
                ig.game.alertDialog.open('Now pick a holdable, mountable or wearable from the right.');
                ig.game.alertDialog.contextId = 'pickGetId';
            }
            else if ( x > this.areas.useAtGetButtons.x1 + this.areas.useAtGetButtons.width * (1 / 3) ) {
                ig.game.alertDialog.openPrompt('Name of thing behind or below must contain (separate multiple with comma):',
                        this.data.prop.atKeyword, ig.game.painter.saveAtKeyword);
            }
            else {
                ig.game.alertDialog.openPrompt('Holdable Item or Equpiment name must contain (optional; separate multiple with comma):', this.data.prop.useKeyword,
                        ig.game.painter.saveUseKeyword);
            }

        }
        else if ( (thisType == 'readable' || thisType == 'brain') && this.pointIsInRectangle(x, y, this.areas.textualButton) ) {
            if (ig.game.ourPlayer.rank >= 2) {
                if (!ig.game.alertDialog.isOpen) {
                    var text = this.data.prop.textData ? this.data.prop.textData : '';
                    var allowMixedCase = thisType == 'brain' || ( this.data.prop.attributes && this.data.prop.attributes.indexOf('sansSerifFont') >= 0 );
                    ig.game.alertDialog.openPrompt(null, text, ig.game.painter.textDataSaved, null, true, allowMixedCase);
                    if (thisType == 'brain') {
                        jQuery('#promptInputBox').attr( 'placeholder', this.getLeaveEmptyDuringDevelopmentText() );
                    }
                    ig.game.sounds.click.play();
                }
            }
            else {
                ig.game.rankManager.showRankNotEnough();
            }

        }
        else if ( thisType == 'mift' && this.pointIsInRectangle(x, y, this.areas.textualButton) ) {
            if (!ig.game.alertDialog.isOpen) {
                var text = this.data.prop.text ? this.data.prop.text : '';
                ig.game.alertDialog.openPrompt('Your message:', text, ig.game.painter.textSavedAssignIfNonEmpty, null, true, false, undefined, undefined,
                        this.miftTextMaxLength, true);
                ig.game.sounds.click.play();
            }

        }
        else if ( thisType == 'mift' && this.pointIsInRectangle(x, y, this.areas.toButton) ) {
            ig.game.sounds.click.play();
            ig.game.friendsDialog.open();

        }
        else if ( thisType == 'interacting' && this.pointIsInRectangle(x, y, this.areas.interactingHelpButton) ) {
            ml.Misc.openUrl('/info-interacting');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'pointer' && this.pointIsInRectangle(x, y, this.areas.helpButton) ) {
            ig.game.alertDialog.openSmall(
                    'Pointers, when activated, will provide a guiding arrow ' +
                    'to the target location. Also, placing a Pointer next to a ' +
                    'Mountable will steer the Mountable to the target when mounted.'
                    );
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'placeName' && this.pointIsInRectangle(x, y, this.areas.helpButton) ) {
            ig.game.alertDialog.openSmall(
                    'Place Names show a label on the map when placed. ' +
                    'They will also transport one to their placed location when clicked ' +
                    'in the side panel.'
                    );
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'holder' && this.pointIsInRectangle(x, y, this.areas.helpButton) ) {
            ml.Misc.openUrl('/info-holder');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'readable' && this.pointIsInRectangle(x, y, this.areas.helpButton) ) {
            ml.Misc.openUrl('/info-text');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'multithing' && this.pointIsInRectangle(x, y, this.areas.helpButton) ) {
            ml.Misc.openUrl('/info-multi');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'brain' && this.pointIsInRectangle(x, y, this.areas.brainHelpButton) ) {
            ml.Misc.openUrl('/info-brain');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'dynamicThing' && this.pointIsInRectangle(x, y, this.areas.dynamicHelpButton) ) {
            ml.Misc.openUrl('/info-dynamic');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'farBack' && this.pointIsInRectangle(x, y, this.areas.dynamicHelpButton) ) {
            ml.Misc.openUrl('/info-far-back');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.dynamicHelpButton) ) {
            ml.Misc.openUrl('/info-mover');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'happening' && this.pointIsInRectangle(x, y, this.areas.dynamicHelpButton) ) {
            ml.Misc.openUrl('/info-happening');
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'interacting' && this.pointIsInRectangle(x, y, this.areas.textualButtonWhenAnimated) ) {
            if (!this.interactingDialog) { this.interactingDialog = new InteractingDialog(); }
            if (!this.interactingDialog.isOpen) {
                this.interactingDialog.open(this.data.prop.textData ? this.data.prop.textData : '');
            }
            else {
                this.closeAndSaveInteractingDialogIfNeeded();
            }
            this.updateCells();
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'dynamicThing' && this.pointIsInRectangle(x, y, this.areas.dynamicTextButton) ) {
            if (!ig.game.alertDialog.isOpen) {
                var text = this.data.prop.text ? this.data.prop.text : '';
                ig.game.alertDialog.openPrompt(null, text, ig.game.painter.textSaved, null, true, false, undefined, undefined, this.dynamicTextMaxLength);
                ig.game.sounds.click.play();
                jQuery('#alertDialog').css('width', '50%').css('left', '45%');
            }

        }
        else if ( thisType == 'farBack' && this.pointIsInRectangle(x, y, this.areas.dynamicTextButton) ) {
            if (!ig.game.alertDialog.isOpen) {
                var text = this.data.prop.text ? this.data.prop.text : '';
                ig.game.alertDialog.contextId = 'farBackText';
                ig.game.alertDialog.openPrompt(null, text, ig.game.painter.textSaved, null, true, false, undefined, undefined, this.farBackTextMaxLength);
                ig.game.sounds.click.play();
                jQuery('#alertDialog').css('width', '35%')
                                      .css( 'top', (10 * ig.system.scale) + 'px' )
                                      .css('left', '55%');
                if (!ig.ua.mobile) {
                    jQuery('#alertDialog').css('height', '55%');
                    jQuery('#promptInputBox').css( 'height', Math.round(ig.system.realHeight * .35) + 'px' );
                    jQuery('.contentPart').css( 'height', Math.round(ig.system.realHeight * .425) + 'px' );
                }
                jQuery('#promptInputBox').attr('placeholder', 'click in world to add coordinate');
            }

        }
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.dynamicTextButton) ) {
            if (!ig.game.alertDialog.isOpen) {
                var text = this.data.prop.text ? this.data.prop.text : '';
                text = ig.game.moverManager.unpackTextForEditingOrDisplay(text);
                var maxLengthAdjustedForUnpackedFormat = 50000;
                ig.game.alertDialog.openPrompt(null, text, ig.game.painter.textSaved, null, true, false, undefined, undefined, maxLengthAdjustedForUnpackedFormat);
                ig.game.sounds.click.play();
                jQuery('#alertDialog').css('width', '50%')
                                      .css('left', '45%');
                jQuery('#alertDialog textarea').css('font-size', '160%')
                                               .css('letter-spacing', '2px')
                                               .css('font-family', 'monospace');
            }

        }
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.moverUseButton) ) {
            ig.game.alertDialog.contextId = null;
            ig.game.alertDialog.openPrompt('To harm the Mover Body, equipment name must contain (optional; separate multiple with comma):',
                    this.data.prop.useKeyword, ig.game.painter.saveUseKeyword);

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.preview) ) {
            if ( this.getCurrentTypeHasLivePreview() ) {
                this.updateLivePreview();
                ig.game.sounds.click.play();
            }
        }        
        else if ( thisType == 'aimable' && this.pointIsInRectangle(x, y, this.areas.specsButton) ) {
            if (!ig.game.alertDialog.isOpen) {
                this.openSpecsDialog();
                ig.game.sounds.click.play();
            }

        }
        else if ( thisType == 'happening' && this.pointIsInRectangle(x, y, this.areas.dynamicTextButton) ) {
            if (ig.game.ourPlayer.rank >= 2) {
                if (!ig.game.alertDialog.isOpen) {
                    var text = this.data.prop.textData ? this.data.prop.textData : '';
                    var allowMixedCase = true;
                    ig.game.alertDialog.openPrompt(null, text, ig.game.painter.textDataSaved, null, true, allowMixedCase);
                    jQuery('#promptInputBox').attr( 'placeholder', this.getLeaveEmptyDuringDevelopmentText() );
                    ig.game.sounds.click.play();
                }
            }
            else {
                ig.game.rankManager.showRankNotEnough();
            }

        }
        else if ( thisType == 'interacting' && this.pointIsInRectangle(x, y, this.areas.thingReferencesButton) ) {
            if (!this.thingReferencesDialog) { this.thingReferencesDialog = new ThingReferencesDialog(); }
            if (!this.thingReferencesDialog.isOpen) {
                this.thingReferencesDialog.open( ig.game.cloneObject(this.data.prop.thingRefs),
                        'Item, Interacting Motion, Sound + More');
            }
            else {
                this.closeAndSaveThingReferencesDialogIfNeeded();
            }
            this.updateCells();
            ig.game.sounds.click.play();

        }
        else if ( thisType == 'musicSheet' && this.pointIsInRectangle(x, y, this.areas.changeAttributes) ) {
            var ms = this.data.prop.noteDelayMS ? this.data.prop.noteDelayMS : this.noteDelayMSDefault;
            ig.game.alertDialog.openPrompt('Please enter note interval in milliseconds from ' + this.noteDelayMSMin + ' - ' + this.noteDelayMSMax + ' in steps of 50:',
                    ms, ig.game.painter.saveNoteDelay );

        }
        
        else if ( this.pointIsInRectangle(x, y, this.areas.changeAttributes) && this.data.type && ig.game.attributesManager.info[ this.types[this.data.type].key ] ) {
            this.showAttributesPicker();
            ig.game.sounds.click.play();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.pasteButtonAlternative) && this.data.type && ['medium'].indexOf(this.data.type) >= 0 ) {
            this.handlePasteMedium();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.rightsButton) && this.data.type && ['writable'].indexOf(this.data.type) >= 0 ) {
            this.openWritableSettingsDialog();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.pasteButton) && this.data.type && ['pointer'].indexOf(this.data.type) >= 0 ) {
            this.handlePastePointer();

        }
        else if ( thisType == 'gatherable' && this.pointIsInRectangle(x, y, this.areas.useButton) ) {
            ig.game.alertDialog.contextId = null;
            ig.game.alertDialog.openPrompt('Holdable Item and Equipment, Wearable or Body name must contain (optional; separate multiple with comma):',
                    this.data.prop.useKeyword, ig.game.painter.saveUseKeyword);

        }
        else if ( thisType == 'crumbling' && this.pointIsInRectangle(x, y, this.areas.useButtonAlternative) ) {
            ig.game.alertDialog.contextId = null;
            ig.game.alertDialog.openPrompt('Holdable Equipment name must contain (optional; separate multiple with comma):',
                    this.data.prop.useKeyword, ig.game.painter.saveUseKeyword);

        }
        else if ( thisType == 'gatherable' && this.pointIsInRectangle(x, y, this.areas.hasButton) ) {
            this.data.prop.hasId = null;
            ig.game.alertDialog.open('Now pick a Holdable Item, Equipment, Consumable or Instrument from the right.');
            ig.game.alertDialog.contextId = 'pickHasId';

        }
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.holdableButton) ) {
            if (this.data.prop.holdableId) {
                ig.game.sounds.bin.play();
                this.data.prop.holdableId = null;
                this.updateAll();
            }
            else {
                ig.game.sounds.click.play();
                this.data.prop.holdableId = null;
                var useCloseButton = true;
                this.data.prop.holdableId = null;
                ig.game.alertDialog.open('To set an Equipment for the Mover Body, pick one from the right.', null, null, null, null, useCloseButton);
                ig.game.alertDialog.contextId = 'pickHoldableId';
            }

        }
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.wearableButton) ) {
            if (this.data.prop.wearableId) {
                ig.game.sounds.bin.play();
                this.data.prop.wearableId = null;
                this.updateAll();
            }
            else {
                ig.game.sounds.click.play();
                this.data.prop.wearableId = null;
                var useCloseButton = true;
                this.data.prop.wearableId = null;
                ig.game.alertDialog.open('To set a Wearable for the Mover Body, pick one from the right.', null, null, null, null, useCloseButton);
                ig.game.alertDialog.contextId = 'pickWearableId';
            }

        }
        
        else if ( thisType == 'mover' && this.pointIsInRectangle(x, y, this.areas.protectPercentButton) ) {
            ig.game.alertDialog.contextId = null;
            var value = this.data.prop.protectPercent ? this.data.prop.protectPercent : 0;
            ig.game.alertDialog.openPrompt( 'Enter Mover Body hit protection from 0-100%:',
                    String(value), ig.game.painter.saveProtectPercent,
                    undefined, undefined, undefined, undefined, undefined,
                    'nnn%'.length );

        }

        else if ( thisType == 'sound' && this.pointIsInRectangle(x, y, this.areas.creditButton) ) {
            var url = this.data.prop.creditUrl;
            if (url) { url = ig.game.sounds.maxifyCreditUrl(url); }
            ig.game.alertDialog.openPrompt('Paste the FreeSound.org URL if you have this sound from there:',
                    url, ig.game.painter.saveCreditUrl);
        }

        else if ( thisType == 'transforming' && this.pointIsInRectangle(x, y, this.areas.timeButton) ) {
            this.openSecondsPerTransformDialog();
        }

        else if ( thisType == 'transforming' && this.pointIsInRectangle(x, y, this.areas.givesButton) ) {
            if (!this.thingReferencesDialog) { this.thingReferencesDialog = new ThingReferencesDialog(); }
            if (!this.thingReferencesDialog.isOpen) {
                this.thingReferencesDialog.open( ig.game.cloneObject(this.data.prop.thingRefs),
                        'Optional Holdable, Wearable, Mountable, Body, Medium or Readable to be Given At Last Cell');
            }
            else {
                this.closeAndSaveThingReferencesDialogIfNeeded();
            }
            this.updateCells();
            ig.game.sounds.click.play();
        }

        else if ( thisType == 'holder' && this.pointIsInRectangle(x, y, this.areas.needsButton) ) {
            ig.game.alertDialog.contextId = null;
            ig.game.alertDialog.openPrompt('Holdable item or equipment name must contain:',
                    this.data.prop.useKeyword, ig.game.painter.saveUseKeyword,
                    undefined, undefined, undefined, undefined, undefined,
                    ig.game.validations.itemName.maxLength, true
                    );
        }
        else if ( thisType == 'holder' && this.pointIsInRectangle(x, y, this.areas.sizeButton) ) {
            ig.game.alertDialog.contextId = null;
            var defaultValue = this.data.prop.backTileCount ?
                    this.data.prop.backTileCount : ig.game.holderDialog.getDefaultBackTileCountAsString();
            ig.game.alertDialog.openPrompt('Enter size x,y (from 1-8):',
                    defaultValue, ig.game.painter.saveBackTileCount,
                    undefined, undefined, undefined, undefined, undefined, 10, true
                    );
        }
        
        else if ( this.data.type && this.types[this.data.type].canHaveMotionId && this.pointIsInRectangle(x, y, this.areas.motionIdButton) ) {
            if (this.data.prop.motionId) {
                ig.game.sounds.bin.play();
                this.data.prop.motionId = null;
                this.updateAll();
            }
            else {
                ig.game.sounds.click.play();
                this.data.prop.motionId = null;
                var useCloseButton = true;
                ig.game.alertDialog.open('Now optionally, pick a Motion from the right.', null, null, null, null, useCloseButton);
                ig.game.alertDialog.contextId = 'motionId';
            }

        }
        else if ( isAnimated && this.pointIsInRectangle(x, y, this.areas.cell0) ) {
            this.selectedCell = 0;
            this.previewCell = this.selectedCell;
            ig.game.sounds.click.play();
            this.update();

        }
        else if ( isAnimated && this.pointIsInRectangle(x, y, this.areas.cell1) ) {
            this.selectedCell = 1;
            this.previewCell = this.selectedCell;
            ig.game.sounds.click.play();
            this.update();

        }
        else if ( this.data.type && this.types[this.data.type].hasOptionalCells && this.pointIsInRectangle(x, y, this.areas.cellAdd) ) {
            if (this.data.type == 'musicSheet') { this.optionalCellCountMax = 9; }
            if (this.optionalCellCount < this.optionalCellCountMax) {
                this.optionalCellCount++;
                this.selectedCell = this.optionalCellCount - 1;
                this.brieflyPauseClicksHandling(50);
                ig.game.sounds.click.play();
                this.update();
                this.updateLivePreview();
            }

        }
        else if ( this.data.type && this.types[this.data.type].hasOptionalCells && this.pointIsInRectangle(x, y, this.areas.cellRemove) ) {
            var minCell = ['dynamicThing', 'happening', 'musicSheet', 'farBack'].indexOf(this.data.type) >= 0 ? 1 : 2;
            if (this.optionalCellCount > minCell) {
                this.optionalCellCount--;
                this.selectedCell = this.optionalCellCount - 1;
                this.brieflyPauseClicksHandling(50);
                ig.game.sounds.click.play();
                this.update();
                this.updateLivePreview();
            }

        }
        
        else if ( this.data.type == 'musicSheet' && this.pointIsInRectangle(x, y, this.areas.playMusicButton) ) {
            ig.game.sounds.click.play();
            this.togglePlayMusicSheet();
        }
        
        else if ( this.data.type == 'musicSheet' && this.pointIsInRectangle(x, y, this.areas.convertMusicSheetButton) ) {
            ig.game.sounds.click.play();
            if ( confirm( "Convert to type Music? (If you haven't already, it's suggested you cancel and save a backup of the Music Sheet first.)" ) ) {
                this.convertTypeMusicSheetToMusic();
            }
        }
        
        else if ( this.data.type && this.types[this.data.type].hasOptionalCells && this.pointIsInRectangle(x, y, this.areas.multiCells) ) {
            var tabWidth = this.areas.multiCells.width / ig.game.maxCellsMulti;
            var relativeX = x - this.areas.multiCells.x1;
            var cellNumber = relativeX > 0 ? Math.floor(relativeX / tabWidth) : 0;
            if (cellNumber > ig.game.maxCellsMulti - 1) { cellNumber = ig.game.maxCellsMulti - 1; }

            var isSame = false;
            
            if (cellNumber < this.optionalCellCount) {
                isSame = cellNumber == this.selectedCell;
                this.selectedCell = cellNumber;
                this.previewCell = null;
                ig.game.sounds.click.play();
            }
            this.update();
            
            if (this.data.type == 'musicSheet') {
                if (isSame) {
                    this.togglePlayMusicSheet();
                }
                else if (this.musicSheetTimer) {
                    this.stopPlayMusicSheet();
                    this.startPlayMusicSheet();
                }
                this.updateCells();
            }

        }
        else if ( isMultiAnimated && this.pointIsInRectangle(x, y, this.areas.multiCells) ) {
            var tabWidth = this.areas.multiCells.width / ig.game.maxCellsMulti;
            var relativeX = x - this.areas.multiCells.x1;
            var cellNumber = relativeX > 0 ? Math.floor(relativeX / tabWidth) : 0;
            if (cellNumber > ig.game.maxCellsMulti - 1) { cellNumber = ig.game.maxCellsMulti - 1; }

            this.selectedCell = cellNumber;
            this.previewCell = this.selectedCell;
            ig.game.sounds.click.play();
            this.update();

        }
        else if ( ['motion', 'interactingMotion', 'holder'].indexOf(this.data.type) >= 0 && this.pointIsInRectangle(x, y, this.areas.optionalThirdCell) ) {
            var cellNumber = 2;
            this.selectedCell = cellNumber;
            this.previewCell = this.selectedCell;
            ig.game.sounds.click.play();
            this.update();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPicker) ) {
            var colors = this.getColorsOfCurrentPage();
            var colorIndex = null;
            for (var relativeIndex in colors) {
                relativeIndex = parseInt(relativeIndex);
                var index = colors[relativeIndex];
                if ( index != parseInt(index) ) { continue; }

                var rect = this.getPaletteBoxRectangle(index, relativeIndex);
                rect.height += 12;
                if ( this.pointIsInWidthHeightRectangle(x, y, rect) ) {
                    colorIndex = index;
                    break;
                }
            }

            if (colorIndex == null) { colorIndex = this.transparentIndex; }

            if (colorIndex != null) {
                var isInColorPickerButton = this.selectedColor == colorIndex && colorIndex != this.transparentIndex
                        && y > this.areas.betweenColorAndColorPicker.y1;
                if (this.cursorDoubleClicked || isInColorPickerButton) {
                    if (this.cursorWasUpSinceMode) {
                        if (this.selectedColor != this.transparentIndex) { this.showColorPicker(); }
                        else { ig.game.sounds.nocando.play(); }
                    }
                }
                else if (y < this.areas.betweenColorAndColorPicker.y1) {
                    if (this.cursorRightIsDown) { this.secondaryColorIndex = colorIndex; }
                    else { this.selectedColor = colorIndex; }
                    this.update();
                }
            }

        }
        else if (this.data && this.data.type && this.types[this.data.type].isMountable &&
                this.pointIsInRectangle(x, y, this.areas.moveAvatarArrows) ) {

            var buttons = [
                    [ {rotation: -1}, {y: -1}, {rotation: 1}  ],
                    [ {x: -1},        {y: 1},  {x: 1}  ]
                    ];
            var relativeX = x - this.areas.moveAvatarArrows.x1, relativeY = y - this.areas.moveAvatarArrows.y1;
            var indexX = 0, indexY = 0;

            var buttonWidth = this.areas.moveAvatarArrows.width / buttons[0].length;
            var buttonHeight = this.areas.moveAvatarArrows.height / buttons.length;

            if (relativeX > 0) { indexX = Math.floor(relativeX / buttonWidth); }
            if (relativeY > 0) { indexY = Math.floor(relativeY / buttonHeight); }

            var amendment = buttons[indexY] && buttons[indexY][indexX] ? buttons[indexY][indexX] : null;
            if ( amendment && (amendment.x || amendment.y) ) {
                this.brieflyPauseClicksHandling(50);
                ig.game.sounds.click.play();
                this.amendAvatarTemplatePosition(amendment);
                this.update();
            }

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.changeTypeFuzzy) ) {
            if (this.cursorWasUpSinceMode && this.mode != 'pickType') {
                this.showTypePicker();
                ig.game.sounds.click.play();
            }

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.soundButton) && this.data.type == 'mift' ) {
            this.handleAddRemoveSound();
            ig.game.sounds.click.play();
            this.updateAll();

        }
        else if ( this.pointIsInRectangle(x, y, this.areas.changeBehavior) ) {
            if (this.data.type && this.types[this.data.type].parent) {
                this.switchToNextTypeInGroup();
                ig.game.sounds.click.play();
            }

        }
    },
    
    getLeaveEmptyDuringDevelopmentText: function() {
        return 'during development, leave this empty, place the creation in the world and walk over it'.toUpperCase();
    },
    
    getSpecsSelectBox: function(name, defaultSpecs, isPercent, values, label, zeroIsFuzzy) {
        var html = '';
        if (!label) { label = ig.game.strings.camelCaseToWords(name); }

        var defaultStyle = 'style="background-color: rgb(210,210,210)"';
        
        html += '<p class="specPart">' +
                '<span class="specLabel">' + ig.game.strings.htmlEscape(label) + '</span> &nbsp;';
        html += '<select id="' + name + '" ' +
                'onChange="ig.game.painter.specChange(' + "'" + name + "'" + ')">';
        var valueToSelect = this.data.prop.specs && this.data.prop.specs[name] !== undefined ?
                this.data.prop.specs[name] : defaultSpecs[name];
        if (values) {
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                var sSelected = v == valueToSelect ? ' selected="selected"' : '';
                var sStyle = v == defaultSpecs[name] ? defaultStyle : '';
                html += '<option value="' + v + '"' + sSelected + ' ' + sStyle + '>' +
                        v + '</option>';
            }
        }
        else {
            for (var i = 0; i <= 100; i += 5) {
                var sSelected = i == valueToSelect ? ' selected="selected"' : '';
                var sStyle = i == defaultSpecs[name] ? defaultStyle : '';
                var prefix = zeroIsFuzzy && i == 0 ? '~' : '';
                html += '<option value="' + i + '"' + sSelected + ' ' + sStyle + '>' +
                        prefix + i + (isPercent ? '%' : '') + '</option>';
            }
        }
        html += '</select>';
        html += ' &nbsp; <span class="specInfo" id="specInfo' + name + '">' +
                this.getSpecInfoHtml(valueToSelect, defaultSpecs[name]) +
                '</span>';
        html += '</p>';
        return html;
    },
    
    getSpecInfoHtml: function(value, defaultValue) {
        var difference = value - defaultValue;
        var sDifference = '';
        if (difference < 0) {
            if ( difference != parseInt(difference) ) { difference = difference.toFixed(2); }
            sDifference = difference;
        }
        else if (difference > 0) {
            if ( difference != parseInt(difference) ) { difference = difference.toFixed(2); }
            sDifference = '+' + difference;
        }
        return sDifference;
    },
    
    specChange: function(name) {
        var defaultSpecs = ig.game.aimableManager.getDefaultSpecs();
        var value = jQuery('#' + name).val();
        var defaultValue = defaultSpecs[name];
        var sDifference = this.getSpecInfoHtml(value, defaultValue);
        jQuery('#specInfo' + name).html(sDifference);
    },
    
    openSpecsDialog: function() {
        var html = '';
        var defaultSpecs = ig.game.aimableManager.getDefaultSpecs();
        
        html += this.getSpecsSelectBox('recoil', defaultSpecs, true);
        html += this.getSpecsSelectBox('accuracy', defaultSpecs, true);
        html += this.getSpecsSelectBox('harm', defaultSpecs, true);
        
        var values = [];
        for (var i = 1; i <= 20; i++) { values.push(i); }
        for (var i = 25; i <= 50; i += 5) { values.push(i); }
        for (var i = 60; i <= 100; i += 10) { values.push(i); }
        html += this.getSpecsSelectBox('shotsPerAmmo', defaultSpecs, false, values);

        values = [];
        for (var n = 0.25; n <= 1; n += 0.05) { values.push( n.toFixed(2) ); }
        for (var n = 1; n <= 2; n += 0.25) { values.push( n.toFixed(2) ); }
        html += this.getSpecsSelectBox('secondsBetweenShots', defaultSpecs, false, values, 'seconds betw. shots');

        values = [];
        for (var n = 0.5; n <= 10; n += 0.5) { values.push( n.toFixed(1) ); }
        for (var n = 11; n <= 15; n += 1) { values.push( n.toFixed(1) ); }
        html += this.getSpecsSelectBox('secondsToReload', defaultSpecs, false, values);

        values = [];
        html += this.getSpecsSelectBox('weight', defaultSpecs, false, null, 'shot weight', true);

        var callback = function() { ig.game.painter.saveSpecs(); }
        ig.game.alertDialog.open( {html: html, callbackForOk: callback} );
    },
    
    saveSpecs: function(data) {
        var self = ig.game.painter;
        var defaultSpecs = ig.game.aimableManager.getDefaultSpecs();
        self.data.prop.specs = {}
        
        var recoil = jQuery('#recoil').val();
        if (recoil != defaultSpecs.recoil) {
            self.data.prop.specs.recoil = parseInt(recoil);
        }
        
        var accuracy = jQuery('#accuracy').val();
        if (accuracy != defaultSpecs.accuracy) {
            self.data.prop.specs.accuracy = parseInt(accuracy);
        }
        
        var harm = jQuery('#harm').val();
        if (harm != defaultSpecs.harm) {
            self.data.prop.specs.harm = parseInt(harm);
        }
        
        var secondsBetweenShots = jQuery('#secondsBetweenShots').val();
        if (secondsBetweenShots != defaultSpecs.secondsBetweenShots) {
            self.data.prop.specs.secondsBetweenShots = parseFloat(secondsBetweenShots);
        }
        
        var secondsToReload = jQuery('#secondsToReload').val();
        if (secondsToReload != defaultSpecs.secondsToReload) {
            self.data.prop.specs.secondsToReload = parseFloat(secondsToReload);
        }
        
        var shotsPerAmmo = jQuery('#shotsPerAmmo').val();
        if (shotsPerAmmo != defaultSpecs.shotsPerAmmo) {
            self.data.prop.specs.shotsPerAmmo = parseInt(shotsPerAmmo);
        }
        
        var weight = jQuery('#weight').val();
        if (weight != defaultSpecs.weight) {
            self.data.prop.specs.weight = parseInt(weight);
        }
    },

    textDataSaved: function(text) {
        var self = ig.game.painter;
        self.data.prop.textData = text;
        ig.game.sounds.success.play();
    },

    textSaved: function(text) {
        var self = ig.game.painter;
        if (self.data.type == 'mover') {
            self.data.prop.text = ig.game.moverManager.packTextFromEditing(text);
            if (self.data.prop.text.length > ig.game.moverManager.textMaxLength) {
                self.data.prop.text = self.data.prop.text.substr(0, ig.game.moverManager.textMaxLength);
                ig.game.sounds.nocando.play();
                setTimeout(
                        function() { ig.game.alertDialog.open('Ooops... the text was too long and has been shortened.'); },
                        100 );
            }
        }
        else {
            self.data.prop.text = text;
        }
        ig.game.alertDialog.contextId = null;
        self.updateAll();
        self.updateLivePreview();
    },
    
    textSavedAssignIfNonEmpty: function(text) {
        var self = ig.game.painter;
        if (text) {
            self.data.prop.text = text;
            self.updateAll();
            ig.game.sounds.success.play();
        }
    },

    rgbAsTextCallback: function(value) {
        var rgba = ig.game.painter.getRgbaArrayFromRgbOrHexString(value);
        if (rgba) {
            ig.game.painter.data.colors[ig.game.painter.selectedColor] = rgba;
            ig.game.sounds.success.play();
        }
        else {
            ig.game.sounds.nocando.play();
        }
        ig.game.painter.updateAll();
    },

    getRgbaArrayFromRgbOrHexString: function(s) {
        var rgba = null;
        if (s && typeof s === 'string') {

            if ( s.indexOf(',') >= 0 ) {
                s = ig.game.strings.replaceAll(s, ' ', '');
                s = ig.game.strings.replaceAll(s, 'rgba(', '');
                s = ig.game.strings.replaceAll(s, ')', '');
                var rgbaArray = s.split(',');
                if (rgbaArray.length == 3) {
                    s += ',1';
                    rgbaArray.push('1');
                }

                if (rgbaArray.length == 4) {
                    var alpha = parseFloat(rgbaArray[3]);
                    if ( alpha > 0 && alpha <= 1 && rgbaArray[3].length <= 5 ) {
                        rgba = s.split(',');
                    }
                }

            }
            else {

                s = ig.game.strings.replaceAll(s, '#', '');
                if (s.length == '000000'.length) {
                    rgba = [];
                    for (var i = 0; i < 3; i++) {
                        rgba[i] = s.substr(i * 2, 2);
                        rgba[i] = parseInt(rgba[i], 16);
                    }
                    rgba.push(1);
                }

            }

        }

        if (rgba) {
            for (var i = 0; i < 3; i++) {
                if ( !this.getIsRedGreenBlue( parseInt(rgba[i]) ) ) {
                    rgba = null;
                    break;
                }
            }

            if (rgba) {
                rgba = { r: parseInt(rgba[0]), g: parseInt(rgba[1]), b: parseInt(rgba[2]), alpha: parseFloat(rgba[3]) };
            }
        }
        return rgba;
    },

    getIsRedGreenBlue: function(v) {
        return v != undefined && v != null && this.isNumber(v) && v >= 0 && v <= 255;
    },

    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    closeAndSaveInteractingDialogIfNeeded: function() {
        if (this.interactingDialog && this.interactingDialog.isOpen) {
            this.data.prop.textData = jQuery('#interactingDialog').val();
            this.data.prop.textData = ig.game.strings.replaceTiltedApostropheWithNormalOne(this.data.prop.textData);
            this.data.prop.textData = ig.game.interactingManager.correctActionSyntaxIfNeeded(this.data.prop.textData);
            this.data.prop.textData.toLowerCase();
            this.data.prop.reactsTo = ig.game.interactingManager.getReactsToList(this.data.prop.textData);
            jQuery('#interactingDialog').remove();
            this.interactingDialog.isOpen = false;

            ig.game.interactingManager.showDebugInformation(this.data.prop.textData, this.data.prop.thingRefs);
        }
    },

    closeAndSaveThingReferencesDialogIfNeeded: function() {
        if (this.thingReferencesDialog && this.thingReferencesDialog.isOpen) {
            this.data.prop.thingRefs = ig.game.cloneObject(this.thingReferencesDialog.data);
            jQuery('#thingReferencesDialog').remove();
            this.thingReferencesDialog.isOpen = false;
        }
    },

    pickedItemFromPanel: function(itemId, itemName, itemBase) {
        if ( this.rankOkForType(itemBase) ) {

            if (itemId && this.data.type) {

                if (this.thingReferencesDialog && this.thingReferencesDialog.isOpen) {
                    if (this.data.type == 'interacting') {
                        var unincludable = ['ACTIVATOR', 'CRUMBLING', 'DEADLYEM', 'THROWER', 'GATHER', 'OPENABLE', 'PORTALR',
                                'DEADLYMV', 'MOVING'];
                        if ( unincludable.indexOf(itemBase) >= 0 ) {
                            ig.game.alertDialog.open( 'These cannot be included: ' + ml.Misc.getVerboseTypeFromKeyList(unincludable) + '.' );
                            ig.game.sounds.nocando.play();
                        }
                        else {
                            this.thingReferencesDialog.addItem(itemId, itemName);
                        }
                    }
                    else if (this.data.type == 'transforming') {
                        var includable = ['STACKHOLD', 'EQUIPMENT', 'EMITTER', 'CONSUMAB', 'AIMABLE', 'HOOK', 'LINER',
                                'READABLE', 'STACKWEARB', 'MNTGROUND', 'MNTAIR', 'MEDIUM'];
                        if ( includable.indexOf(itemBase) >= 0 ) {
                            this.thingReferencesDialog.addItem(itemId, itemName);
                        }
                        else {
                            ig.game.alertDialog.open( 'Only these can be included: ' +
                                    ml.Misc.getVerboseTypeFromKeyList(includable) + '.');
                            ig.game.sounds.nocando.play();
                        }
                    }
                }
        
                else if (this.data.type == 'interactiveEnvironment' && ig.game.alertDialog.contextId == 'pickGetId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
        
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt2');
                    var allowedTypes = ig.game.cloneObject(ig.game.attachmentManager.attachableBaseTypes_holdable);
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.getId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open( 'Only these are allowed: ' + ml.Misc.getVerboseTypeFromKeyList(allowedTypes) + '.' );
                        ig.game.alertDialog.contextId = 'pickGetId';
                        ig.game.sounds.nocando.play();
                    }
                }

                else if (ig.game.alertDialog.contextId == 'pickSoundId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
        
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt3');
                    if (item.base == 'SOUND') {
                        this.data.prop.soundId = itemId;
                        ig.game.sounds.success.play();
                        setTimeout( function() { ig.game.sounds.playFromLibrary(itemId); }, 500 );
                    }
                    else {
                        ig.game.alertDialog.open('Only type Sound can be added.');
                        ig.game.alertDialog.contextId = 'pickSoundId';
                        ig.game.sounds.nocando.play();
                    }
                }
    
                else if (this.data.type == 'gatherable' && ig.game.alertDialog.contextId == 'pickHasId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
        
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt4');
                    var allowedTypes = ['STACKHOLD', 'EQUIPMENT', 'CONSUMAB', 'STACKINSTR'];
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.hasId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open( 'Only these are allowed: ' + ml.Misc.getVerboseTypeFromKeyList(allowedTypes) + '.' );
                        ig.game.alertDialog.contextId = 'pickHasId';
                        ig.game.sounds.nocando.play();
                    }
                }
                
                else if (this.data.type == 'mover' && ig.game.alertDialog.contextId == 'pickHoldableId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }

                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt5');
                    var allowedTypes = ['EQUIPMENT'];
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.holdableId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open( 'Only these are allowed: ' + ml.Misc.getVerboseTypeFromKeyList(allowedTypes) + '.' );
                        ig.game.alertDialog.contextId = 'pickHoldableId';
                        ig.game.sounds.nocando.play();
                    }
                }
                
                else if (this.data.type == 'mover' && ig.game.alertDialog.contextId == 'pickWearableId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }

                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt6');
                    var allowedTypes = ['STACKWEAR'];
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.wearableId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open( 'Only these are allowed: ' + ml.Misc.getVerboseTypeFromKeyList(allowedTypes) + '.' );
                        ig.game.alertDialog.contextId = 'pickWearableId';
                        ig.game.sounds.nocando.play();
                    }
                }
                
                else if (this.data.type == 'dynamicThing' && ig.game.alertDialog.contextId == 'pickEmits') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
                    
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt7');
                    var allowedTypes = ['STACKHOLD'];
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.emitsId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open('You can only pick type Item.');
                        ig.game.alertDialog.contextId = 'pickEmits';
                        ig.game.sounds.nocando.play();
                    }
                }
                
                else if (this.data.type == 'liner' && ig.game.alertDialog.contextId == 'pickEnvironment') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt8');
                    if (item.base == 'ENVIRONM') {
                        this.data.prop.environmentId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open('You can only pick type Environment.');
                        ig.game.alertDialog.contextId = 'pickEnvironment';
                        ig.game.sounds.nocando.play();
                    }
                }

                else if (this.data.type && this.types[this.data.type].canHaveMotionId && ig.game.alertDialog.contextId == 'motionId') {
                    if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }
        
                    var item = ig.game.itemCache.getItemBasic(itemId, 'ui_pnt9');
                    var allowedTypes = ['MOTION'];
        
                    if ( allowedTypes.indexOf(item.base) >= 0 ) {
                        this.data.prop.motionId = itemId;
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.alertDialog.open('Only type Motion is allowed');
                        ig.game.alertDialog.contextId = 'motionId';
                        ig.game.sounds.nocando.play();
                    }
                }
            }

        }
        else {
            ig.game.rankManager.showRankNotEnough();
        }
        this.updateAll();
    },

    openSecondsPerTransformDialog: function() {
        ig.game.alertDialog.contextId = null;
        var isSmall = true;
        var defaultSeconds = ml.Misc.getTransformingSecondsPerTransform();
        var seconds = this.data.prop.secPerTransform ? this.data.prop.secPerTransform : defaultSeconds;
        var multipliers = {'seconds': 1, 'minutes': 60, 'hours': 60 * 60};

        var html = '';
        var multiplier = multipliers.seconds;
        if ( parseInt(seconds / multipliers.hours) == seconds / multipliers.hours ) {
            multiplier = multipliers.hours;
        }
        else if ( parseInt(seconds / multipliers.minutes) == seconds / multipliers.minutes ) {
            multiplier = multipliers.minutes;
        }
        
        html += '<p>After being placed, transform to next cell in</p>';
        html += '<p><input type="text" value="' + ig.game.strings.htmlEscape(seconds / multiplier) +'" ' +
                'id="secondsPerTransform" ' +
                'maxLength="' + String( ml.Misc.getTransformingSecondsPerTransformMax() ).length + '" ' +
                'size="5"/>&nbsp;';
        html += '<select id="secondsPerTransformMultiplier">';
        for (var key in multipliers) {
            var thisMultiplier = multipliers[key];
            html += '<option value="' + thisMultiplier + '"' +
                    (thisMultiplier == multiplier ? ' selected="selected"' : '') + '>' +
                    key.toUpperCase() +
                    '</option>';
        }
        html += '</select>';
        html += '</p>';

        ig.game.alertDialog.open({html: html, callbackForOk: ig.game.painter.saveSecondsPerTransform});
    },
            
    saveSecondsPerTransform: function() {
        var self = ig.game.painter;

        var defaultSeconds = ml.Misc.getTransformingSecondsPerTransform();
        var multiplier = parseInt( jQuery('#secondsPerTransformMultiplier').val() );
        var text = jQuery('#secondsPerTransform').val();

        if (text && text != '' && parseInt(text) != text) {
            ig.game.sounds.nocando.play();
        }

        if ( text && text != '' && parseInt(text) == text ) {
            var seconds = ml.Misc.getTransformingSecondsPerTransform( parseInt(text) * multiplier );
            if (seconds == defaultSeconds) {
                self.data.prop.secPerTransform = null;
            }
            else {
                self.data.prop.secPerTransform = seconds;
            }
        }
        else {
            self.data.prop.secPerTransform = null;
        }
    },

    saveUseKeyword: function(text) {
        var self = ig.game.painter;
        if ( ig.game.strings.containsHtmlBrackets(text) ) { text = null; }
        self.data.prop.useKeyword = text;
        self.updateAll();
        ig.game.sounds.success.play();
    },
    
    saveBackTileCount: function(text) {
        var self = ig.game.painter;
        if (text) {
            var validBackTileCount = self.getValidBackTileCount(text);
            if (validBackTileCount) {
                self.data.prop.backTileCount = validBackTileCount;
                ig.game.sounds.success.play();
            }
            else {
                ig.game.sounds.nocando.play();
            }
        }
        else if (text == '') {
            self.data.prop.backTileCount = ig.game.holderDialog.getDefaultBackTileCountAsString();
            ig.game.sounds.success.play();
        }
    },
    
    getValidBackTileCount: function(text) {
        var validBackTileCount = null;
        var countMin = 1, countMax = ig.game.holderDialog.maxBackTileCount;
        text = ig.game.strings.replaceAll( String(text), ' ', '' );
        var xy = text.split(',');
        if ( xy.length == 2 && xy[0] == parseInt( xy[0] ) && xy[1] == parseInt( xy[1] ) &&
                parseInt( xy[0] ) >= countMin && parseInt( xy[0] ) <= countMax &&
                parseInt( xy[1] ) >= countMin && parseInt( xy[1] ) <= countMax ) {
            validBackTileCount = String( parseInt(xy[0]) ) + ',' + String( parseInt(xy[1]) );
        }
        return validBackTileCount;
    },
    
    saveCreditUrl: function(text) {
        var self = ig.game.painter;
        if (text) {
            if ( ig.game.sounds.isValidCreditUrl(text) ) {
                self.data.prop.creditUrl = ig.game.sounds.minifyCreditUrl(text);
                ig.game.sounds.success.play();
            }
            else {
                ig.game.sounds.nocando.play();
            }
        }
        else if (text == '') {
            self.data.prop.creditUrl = null;
            ig.game.sounds.bin.play();
        }
    },

    saveAtKeyword: function(text) {
        var self = ig.game.painter;
        if (text) { text = text.toLowerCase().trim(); }
        if ( ig.game.strings.containsHtmlBrackets(text) ) { text = null; }
        self.data.prop.atKeyword = text;
        ig.game.sounds.success.play();
        self.updateAll();
    },

    saveProtectPercent: function(v) {
        var self = ig.game.painter;
        var success = false;

        if (v) { v = ig.game.strings.replaceAll(v, '%', ''); }
        
        if (!v || v == '') {
            v = 0;
            success = true;
        }
        else if ( v && parseInt(v) == v ) {
            var v = parseInt(v);
            if (v >= 0 && v <= 100) {
                self.data.prop.protectPercent = v;
                success = true;
            }
        }
        
        if (success) { ig.game.sounds.success.play(); }
        else         { ig.game.sounds.nocando.play(); }
        
        self.updateAll();
    },

    handlePasteMedium: function() {
        var defaultUrl = this.data.prop && this.data.prop.url ? this.data.prop.url : '';
        var self = this;
        var supportedServices = ig.game.ourPlayer.rank >= 5 ?
                'YouTube, snapshots, SoundCloud, Imgur or Vine' :
                'YouTube, snapshots or SoundCloud';
        
        ig.game.alertDialog.openPrompt(
            'Paste URL from ' + supportedServices + ':',
            defaultUrl, 
            function(url) {
                if (url != '' && url != null && url != defaultUrl) {
                    if ( String(url).toLowerCase().indexOf('soundonly=') >= 0 ) { url = ''; }

                    if ( url && url.indexOf('vimeo.com') >= 0 ) {
                        ig.game.sounds.nocando.play();
                        ig.game.alertDialog.open('This URL is not supported at the moment.');
                    }
                    else if ( ig.game.ourPlayer.rank < 5 && url &&
                            ( url.indexOf('vine.co') >= 0 || url.indexOf('imgur.com') >= 0 )
                            ) {
                        ig.game.sounds.nocando.play();
                    }
                    else if ( ig.game.mediaDialog.getUrlIsSupportedForTypeMedium(url) ) {
                        self.data.prop.url = String(url);
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.sounds.nocando.play();
                        ig.game.alertDialog.open('This URL is not supported at the moment.');
                    }
                }
            }

        );
    },

    handlePastePointer: function() {
        var defaultUrl = this.data.prop && this.data.prop.url ? this.data.prop.url : '';
        var prefix = 'http://manyland.com/';

        var self = this;
        ig.game.alertDialog.openPrompt(
            'Paste a location URL:', defaultUrl, 
            function(url) {
                if (url != '' && url != null && url != defaultUrl) {
                    url = self.getIdFromPointerUrl(url);
                    if ( self.isValidPointerUrlPart(url) ) {
                        self.data.prop.url = String(url);
                        ig.game.sounds.success.play();
                    }
                    else {
                        ig.game.sounds.nocando.play();
                        ig.game.alertDialog.open('This URL is not a finder URL like http://manyland.com/#...');
                    }
                }
            }
        );
    },

    getIdFromPointerUrl: function(s) {
        var startString = 'http://manyland.com/', idLength = 10;
        if ( (typeof s) == 'string' && s.indexOf(startString) === 0 ) {
            var hashIndex = s.indexOf('#');
            s = s.substr(hashIndex + 1);
            if (s.length != idLength) { s = null; }
        }
        return s;
    },

    isValidPointerUrlPart: function(s) {
        return (typeof s) == 'string' && s.length == 10;
    },

    amendAvatarTemplatePosition: function(amendment) {
        var max = {x: this.tileWidth - ig.game.avatarBaseSize.x, y: this.tileHeight - ig.game.avatarBaseSize.y};

        var xyStep = 1, rotationStep = 45;
        var x = amendment.x ? amendment.x : 0;
        var y = amendment.y ? amendment.y : 0;
        var rotation = amendment.rotation ? amendment.rotation : 0;

        this.avatarTemplatePosition.x = this.toLimits(this.avatarTemplatePosition.x + x * xyStep, 0, max.x);
        this.avatarTemplatePosition.y = this.toLimits(this.avatarTemplatePosition.y + y * xyStep, 0, max.y);
        this.avatarTemplatePosition.rotation = this.toLimits(rotation * rotationStep, 0, 360);
    },

    toLimits : function(value, min, max) {
        return Math.min(max, Math.max(min, value) );
    },

    worldColorPicked: function(rgba) {
        if (this.selectedColor != this.transparentIndex) {
            this.data.colors[this.selectedColor] = rgba;
            this.updateAll();
        }
    },

    setToNextDirection: function(triggeredFromUI) {
        this.didSetDirection = true;

        if (this.types[this.data.type].hasMultiDirection) {
            this.data.direction++;
            if (this.data.direction > this.multiDirectionMax - 1) { this.data.direction = 0; }

        }
        else {
            var directions = this.types[this.data.type].limitedDirections;
            if (directions) {
                for (var i = 0; i < directions.length; i++) {
                    if (directions[i] == this.data.direction) {
                        this.data.direction = i + 1 < directions.length ? directions[i + 1] : directions[0];
                        break;
                    }
                }
            }
            else {
                this.data.direction++;
                if (this.data.direction > this.directionMax - 1) { this.data.direction = 0; }
            }

        }

        this.brieflyPauseClicksHandling(50);
        ig.game.sounds.click.play();
        this.update();
    },

    closeCallback: function() {
        ig.game.painter.close();
    },

    close: function(skipReallyCloseConfirmation) {
        if (ig.game.alertDialog.isOpen) { ig.game.alertDialog.close(); }

        var doClose = true;
        var importantDialogOpen = (ig.game.painter.interactingDialog && ig.game.painter.interactingDialog.isOpen) ||
                (ig.game.painter.thingReferencesDialog && ig.game.painter.thingReferencesDialog.isOpen);
                
        if ( !skipReallyCloseConfirmation && ( importantDialogOpen || ig.game.painter.pixelHasBeenDrawnInAnyCell() ) ) {
            doClose = false;
            ig.game.alertDialog.openConfirm( 'Really close?',
                    function() { ig.game.painter.close(true); }
                    );
        }

        if (doClose) {
            ig.game.painter.removeLivePreviewEntities();

            if (ig.game.painter.musicSheetTimer) {
                clearInterval(ig.game.painter.musicSheetTimer);
                ig.game.painter.musicSheetTimer = undefined;
            }
            
            if (ig.game.painter.interactingDialog && ig.game.painter.interactingDialog.isOpen) { 
                ig.game.painter.closeAndSaveInteractingDialogIfNeeded();
            }
            if (ig.game.painter.thingReferencesDialog && ig.game.painter.thingReferencesDialog.isOpen) { 
                ig.game.painter.closeAndSaveThingReferencesDialogIfNeeded();
            }

            ig.game.painter.handleCloseTidyUp();
            ig.game.painter.clearEmergencyBackup();
        }
        return doClose;
    },

    handleCloseTidyUp: function() {
        if (this.context) {
            this.clearImage(true, true);
            this.clearTimeouts();
            if (this.canvas) { this.canvas.style.display = 'none'; }
            this.cursorMode = 'default';
            this.updateCursorMode();
            this.unbindAllEvents();
            this.isRunning = false;
            this.removeInputBox();
            ig.game.isPainting = ig.game.ourPlayer.isPainting = false;
            this.destroyCanvas();
            if (ig.game.userScriptEditor) { ig.game.userScriptEditor.close(); }
        }
    },

    clearTimeouts: function() {
        for (var key in this.timeouts) {
            if (this.timeouts[key] != null) {
                clearTimeout(this.timeouts[key]);
                this.timeouts[key] = null;
            }
        }
    },

    switchToNextTypeInGroup: function() {
        this.stopPlayMusicSheet();
        this.brieflyPauseClicksHandling(50);
        var typesInGroup = this.getTypesInGroup(this.types[this.data.type].parent);
        for (var i = 0; i < typesInGroup.length; i++) {
            if (typesInGroup[i] == this.data.type) {
                var nextI = i < typesInGroup.length - 1 ? i + 1 : 0;
                this.setToType(typesInGroup[nextI], true);
                this.update();
                break;
            }
        }
    },

    removeUnusedThingReferences: function() {
        if (this.data.prop.thingRefs && this.data.type == 'interacting' && this.data.prop.textData) {
            var textData = this.data.prop.textData.toLowerCase();
            for (var i = this.data.prop.thingRefs.length - 1; i >= 0; i--) {
                var idAndName = this.data.prop.thingRefs[i];
                if (idAndName && idAndName[1]) {
                    var name = idAndName[1].toLowerCase();
                    if ( textData.indexOf(name) === - 1 ) {
                        this.data.prop.thingRefs.splice(i, 1);
                    }
                }
            }
        }
    },

    autoSetCanHarmOrHasHighImpactAttribute: function() {
        if (this.data.prop.textData) {
            var harmfulOrHighImpactFound = false;
            var textData = this.data.prop.textData.toLowerCase();
            if ( textData.indexOf('/harms ') >= 0 || textData.indexOf('/harm ') >= 0 ) {
                harmfulOrHighImpactFound = true;
            }
            else if ( textData.indexOf('/places ') >= 0 || textData.indexOf('/place ') >= 0 ) {
                harmfulOrHighImpactFound = true;
            }
            else if ( textData.indexOf('/to ') >= 0 ) {
                harmfulOrHighImpactFound = true;
            }
            else if ( textData.indexOf('/embed ') >= 0 || textData.indexOf('/embeds ') >= 0 ) {
                harmfulOrHighImpactFound = true;
            }
            else if ( textData.indexOf('/rumbles ') >= 0 || textData.indexOf('/rumble ') >= 0 ) {
                harmfulOrHighImpactFound = true;
            }
            else if ( ig.game.interactingManager.getReactsToSomeone(this.data.prop.reactsTo) ) {
                harmfulOrHighImpactFound = true;
            }
            else if (this.data.prop.thingRefs) {
                for (var i = 0; i < this.data.prop.thingRefs.length; i++) {
                    var idAndName = this.data.prop.thingRefs[i];
                    var item = ig.game.itemCache.getItemBasic(idAndName[0], 'ui_pnt1');
                    if (item) {
                        if (ig.game.attributesManager.getHasDangerousAttributes(item.attributes) ) {
                            harmfulOrHighImpactFound = true;
                            break;
                        }
                    }
                }
            }

            if (harmfulOrHighImpactFound) {
                if (!this.data.prop.attributes) { this.data.prop.attributes = []; }
                if (this.data.prop.attributes.indexOf('canHarmOrHasHighImpact') === -1) {
                    this.data.prop.attributes.push('canHarmOrHasHighImpact');
                }
            }
            else {
                if (this.data.prop.attributes) {
                    var index = this.data.prop.attributes.indexOf('canHarmOrHasHighImpact');
                    if (index >= 0) { this.data.prop.attributes.splice(index, 1); }
                }
            }
        }
    },

    createIfValid: function() {
        var isValid = true;
        var issues = [];

        this.closeAndSaveInteractingDialogIfNeeded();
        this.closeAndSaveThingReferencesDialogIfNeeded();
        if (this.data.type == 'interacting') {
            this.removeUnusedThingReferences();
            this.autoSetCanHarmOrHasHighImpactAttribute();

            if (this.data.prop.textData) {
                var textData = this.data.prop.textData.toLowerCase();
                if ( (textData.indexOf('/embed ') >= 0 || textData.indexOf('/embeds ') >= 0) &&
                        ig.game.ourPlayer.rank < 5 ) {
                    isValid = false;
                    issues.push('Embeddings are deprecated.');
                }
            }
        }

        var maxCellsNow = 1;
        if (this.data && this.data.type) {
            if (this.types[this.data.type].isAnimated) { maxCellsNow = this.maxCellsDefault; }
            else if (this.types[this.data.type].isMultiAnimated) { maxCellsNow = ig.game.maxCellsMulti; }
        }

        if (ig.game.ourPlayer.rank <= 1) {
            for (var cell = 0; cell < maxCellsNow && isValid; cell++) {
                isValid = this.drawingTouchesAllNeededBorders(cell);
            }
        }

        if ( ig.ua.isSteamBigPictureMode && 
                (this.data.name == null || this.data.name == '') ) {
            this.data.name = 'unnamed';
        }

        if (this.data.name == null || this.data.name == '') {
            isValid = false;
            jQuery('#' + this.inputBoxId).attr('placeholder', 'SET NAME');
            jQuery('#' + this.inputBoxId).addClass('missingValueInputBox');
        }
        if (this.data.type == null) {
            isValid = false;
            this.context.fillStyle = this.inputBoxBackgroundColor;
            this.fillRect(this.areas.changeType.x1, this.areas.changeType.y1, this.areas.changeType.width, this.areas.changeType.height);

            this.context.font = this.defaultFont;
            this.context.fillStyle = 'rgb(200,50,50)';
            this.fillText( 'Set type'.toUpperCase(), 
                    this.areas.changeType.x1 + this.areas.textBoxPadding.x1, this.areas.changeType.y1 + this.areas.textBoxPadding.y1 + this.fontOffsetY );
        }

        /*
        if ( typeof this.data.name === 'string' && this.data.name.indexOf('penis') >= 0 ) {
            ig.game.portaller.startToAreaTeleportingRequest('peacepark');
            return;
        }
        */

        if ( this.data.type == 'environment' && this.data.prop.soundId && this.data.prop.attributes.indexOf('soundscape') === -1 ) {
            delete this.data.prop.soundId;
        }

        if (isValid) {
            if ( !this.didSetDirection && this.data.direction == 0 ) {
                this.autoAdjustSlopeToDirection();
            }
            this.normalizeDirection(maxCellsNow);
            this.ensureCorrectDataTypes();

            if (isValid) {
                isValid = this.verifyIsVisibleEnough();
                if (!isValid) { issues.push('Please make this creation more visible.'); }
            }

            if ( isValid && ['emitter', 'aimable'].indexOf(this.data.type) >= 0 ) {
                isValid = this.getOpaquePixelCountByCell(1) >= 4;
                if (!isValid) { issues.push('Please make the second cell more visible.'); }
            }

            var mountablePositionRelativeToAvatar = null;
            if (this.data.type && this.types[this.data.type].isMountable) {
                mountablePositionRelativeToAvatar = this.getMountablePositionRelativeToAvatar();
            }

            if ( isValid && ['mountableGround', 'mountableAir', 'emitter', 'aimable'].indexOf(this.data.type) >= 0 && !( this.pixelHasBeenDrawn(0) && this.pixelHasBeenDrawn(1) ) ) {
                isValid = false;
                issues.push('Please draw in both cells.');
            }
            if ( isValid && ['holder'].indexOf(this.data.type) >= 0 && !( this.pixelHasBeenDrawn(0) && this.pixelHasBeenDrawn(1) && this.pixelHasBeenDrawn(2) ) ) {
                isValid = false;
                issues.push('Please draw in all cells.');
            }

            var thingsAllowingAnySize = ['wearable', 'interacting', 'interactingMotion', 'holder',
                    'dynamicThing', 'happening', 'farBack', 'thing', 'thingFront', 'lively', 'thingBack'];
            if ( isValid && thingsAllowingAnySize.indexOf(this.data.type) === -1 ) {
                isValid = this.verifyMinSizeAndCropIfNeeded();
                if (!isValid) { issues.push('Please draw larger.'); }
            }

            if (isValid && mountablePositionRelativeToAvatar) {
                isValid = this.getAvatarIsTouchingMountable(mountablePositionRelativeToAvatar);
                if (!isValid)  { issues.push('Please connect person and mountable.'); }
            }

            var secondCellString = 'Second cell is empty. Save anyway?';
            if ( isValid && ['wearable', 'lively', 'gatherable', 'multithing'].indexOf(this.data.type) >= 0 && !this.pixelHasBeenDrawn(1) ) {
                isValid = confirm(secondCellString);
            }
            else if ( isValid && ['motion', 'interactingMotion', 'holder'].indexOf(this.data.type) >= 0 && this.pixelHasBeenDrawn(0) && !this.pixelHasBeenDrawn(1) ) {
                isValid = confirm(secondCellString);
            }

            if ( isValid && ['emitter', 'aimable'].indexOf(this.data.type) >= 0 ) {
                var limitsRect = this.getLimitsRectangleForCell(1);
                this.data.prop.boundingBox2 = [limitsRect.x1, limitsRect.y1, limitsRect.x2, limitsRect.y2];
            }

            if ( isValid && ['interacting', 'interactingMotion'].indexOf(this.data.type) >= 0 &&
                    this.data.prop.attributes && this.data.prop.attributes.indexOf('solid') >= 0 ) {
                var limitsRect = this.getLimitsRectangleForCell(0);
                this.data.prop.boundingBox = [limitsRect.x1, limitsRect.y1, limitsRect.x2, limitsRect.y2];
            }

            if (isValid && this.data.type == 'music') {
                if ( !(this.data.prop && this.data.prop.musicData) ) {
                    this.informAboutMissingMusicData();
                    isValid = false;
                }
            }

            if (isValid && this.data.type == 'readable') {
                if ( !(this.data.prop && this.data.prop.textData) ) {
                    if (ig.game.ourPlayer.rank >= 2) {
                        ig.game.alertDialog.openPrompt(null, '', ig.game.painter.textDataSaved, null, true);
                        ig.game.sounds.nocando.play();
                    }
                    else {
                        ig.game.rankManager.showRankNotEnough();
                    }
                    isValid = false;
                }
            }

            if ( isValid && (this.data.type == 'dynamicThing' || this.data.type == 'mover' || this.data.type == 'farBack') ) {
                if ( !(this.data.prop && this.data.prop.text) ) {
                    ig.game.alertDialog.openPrompt(null, '', ig.game.painter.textSaved, null, true);
                    ig.game.sounds.nocando.play();
                    isValid = false;
                }
            }

            if (isValid && this.data.type == 'interacting') {
                if ( !(this.data.prop && this.data.prop.textData) ) {
                    if (!this.interactingDialog) { this.interactingDialog = new InteractingDialog(); }
                    if (!this.interactingDialog.isOpen) { this.interactingDialog.open(''); }
                    this.updateAll();
                    ig.game.sounds.nocando.play();
                    isValid = false;
                }
                else if ( this.data.prop.textData.toLowerCase().indexOf('/embed') >= 0 ||
                          this.data.prop.textData.toLowerCase().indexOf('/ embed') >= 0 ) {
                    ig.game.alertDialog.openSmall('Sorry, using /embeds is deprecated');
                    isValid = false;
                }
            }

            if (isValid && this.data.type == 'interactiveEnvironment') {
                if ( !(this.data.prop && this.data.prop.atKeyword) ) {
                    ig.game.alertDialog.open('Please pick something for At');
                    isValid = false;
                }
                else if ( !(this.data.prop && this.data.prop.getId) ) {
                    ig.game.alertDialog.open('Please pick something for Get');
                    isValid = false;
                }
            }

            if (isValid) {
                if ( ['medium', 'pointer'].indexOf(this.data.type) >= 0 ) {
                    if ( !(this.data.prop && this.data.prop.url) ) {
                        isValid = false;
                        if (this.data.type == 'medium') { this.handlePasteMedium(); }
                        else if (this.data.type == 'pointer') { this.handlePastePointer(); }
                    }
                }
                else if (this.data.prop && this.data.prop.url) {
                    delete this.data.prop.url;
                }
            }

            if (isValid) {
                if (this.types[this.data.type].hasOptionalCells) {
                    this.restrictOptionalCellsToCellCount();
                    this.maxCells = this.data.pixels.length;
                }

                if (this.data.type == 'viewable' || this.data.type == 'glow') {                    
                    this.selectedCell = 0;
                    this.movePixels(-9, -9);
                    this.cropViewableGlowOrHolder();
                }
                else if (this.data.type == 'holder') {
                    this.selectedCell = 2;
                    this.movePixels( -5, -(29 - 19) );
                    this.cropViewableGlowOrHolder();
                    this.selectedCell = 0;
                }

                var data = ig.game.cloneObject(this.data);

                if (mountablePositionRelativeToAvatar) {
                    if (!data.prop) { data.prop = {}; }
                    data.prop.offset = ig.game.cloneObject(mountablePositionRelativeToAvatar);
                }

                this.clearUnneededCells(data);

                if (data.prop) {
                    if ( (data.prop.musicData || data.prop.musicData == null || data.prop.musicData == {} ) && this.data.type != 'music' ) {
                        delete data.prop.musicData;
                    }
                    if ( (data.prop.textData || data.prop.textData == null || data.prop.textData == '' || data.prop.textData == {} ) &&
                            ['readable', 'interacting', 'brain', 'changer', 'happening'].indexOf(this.data.type) === -1 ) {
                        delete data.prop.textData;
                    }

                    if (this.data.type == 'changer' && ig.game.userScriptEditor) {
                        data.prop.textData = ig.game.userScriptEditor.getValue();
                    }
                    
                    if ( isValid && ['brain', 'changer', 'happening'].indexOf(this.data.type) >= 0 ) {
                        var issues = ig.game.brainManager.getCodeIssues(data.prop.textData);
                        if (issues) {
                            html = "<p>Ooops, there's something wrong with the code...</p>" +
                                    "<p>" + ig.game.strings.htmlEscape(issues) + "</p>";
                            ig.game.alertDialog.open(html, true);
                            isValid = false;
                        }
                    }

                    if ( data.prop.hasId && ['gatherable'].indexOf(this.data.type) === -1 ) {
                        delete data.prop.hasId;
                    }
                    
                    if ( data.prop.emitsId && ['dynamicThing'].indexOf(this.data.type) === -1 ) {
                        delete data.prop.emitsId;
                    }
                    
                    if ( !data.prop.holdableId || ( data.prop.holdableId && ['mover'].indexOf(this.data.type) === -1 ) ) {
                        delete data.prop.holdableId;
                    }
                    
                    if ( !data.prop.wearableId || ( data.prop.wearableId && ['mover'].indexOf(this.data.type) === -1 ) ) {
                        delete data.prop.wearableId;
                    }
                    
                    if ( !data.prop.protectPercent || ( data.prop.protectPercent && ['mover'].indexOf(this.data.type) === -1 ) ) {
                        delete data.prop.protectPercent;
                    }
                    
                    if ( data.prop.environmentId && ['liner'].indexOf(this.data.type) === -1 ) {
                        delete data.prop.environmentId;
                    }
                    
                    if ( (data.prop.text || data.prop.text == null || data.prop.text == '' || data.prop.text == {} ) &&
                            ['dynamicThing', 'mift', 'mover', 'farBack'].indexOf(this.data.type) === -1 ) {
                        delete data.prop.text;
                    }
                    if ( (data.prop.thingRefs || data.prop.thingRefs == null) &&
                            (this.data.type != 'interacting' && this.data.type != 'transforming') ) {
                        delete data.prop.thingRefs;
                    }
                    if ( (data.prop.creditUrl == '' || data.prop.creditUrl == null) || (data.prop.creditUrl && this.data.type != 'sound') ) {
                        delete data.prop.creditUrl;
                    }
                    if ( (data.prop.noteDelayMS == '' || data.prop.noteDelayMS == null) || (data.prop.noteDelayMS && this.data.type != 'musicSheet') ) {
                        delete data.prop.noteDelayMS;
                    }
                    
                    if ( (data.prop.reactsTo || data.prop.reactsTo == null) && this.data.type != 'interacting' ) {
                        delete data.prop.reactsTo;
                    }

                    if ( this.data.type == 'interacting' && data.prop.textData && ig.game.interactingManager.getReactsToSomeone(data.prop.reactsTo) ) {
                        var maxLengthWhenReactsToSomeone = 100000;

                        if (data.prop.textData.length > maxLengthWhenReactsToSomeone) {
                            isValid = false;
                            ig.game.alertDialog.open('When using the Someone keyword, please use ' + maxLengthWhenReactsToSomeone + ' characters or less.');
                            ig.game.sounds.nocando.play();
                        }
                    }
                    
                    if (this.data.type == 'mift') {
                        if (!data.prop.toId) {
                            isValid = false;
                            ig.game.friendsDialog.open();
                            ig.game.sounds.nocando.play();
                        }
                        else if (!data.prop.text) {
                            isValid = false;
                            ig.game.alertDialog.openPrompt('Your message:', '', ig.game.painter.textSaved, null, true, false, undefined, undefined,
                                    this.miftTextMaxLength, true);
                            ig.game.sounds.nocando.play();
                        }
                    }
                    else {
                        delete data.prop.toId;
                    }

                    if (isValid) {
                        if (this.canvas) { this.canvas.style.display = 'none'; }
                        ig.game.sounds.click.play();

                        if (this.data.type == 'interacting') {
                            if ( ig.game.interactingManager.getDoesCheckNearsOrReachesOrSimilar(data.prop.textData) ) {
                                data.prop.checksNears = true;
                            }
                            else {
                                delete data.prop.checksNears;
                            }
                        }
                        else {
                            delete data.prop.checksNears;
                        }
    
                        if ( data.prop.attributes && !ig.game.attributesManager.info[ this.types[this.data.type].key ]) {
                            delete data.prop.attributes;
                        }
    
                        if (!data.prop.useKeyword) {
                            delete data.prop.useKeyword;
                        }
                        if ( !data.prop.backTileCount || data.prop.backTileCount == ig.game.holderDialog.getDefaultBackTileCountAsString() ) {
                            delete data.prop.backTileCount;
                        }
                        if (!data.prop.hasId) {
                            delete data.prop.hasId;
                        }
                        if (!data.prop.emitsId) {
                            delete data.prop.emitsId;
                        }
                        if (!data.prop.atKeyword) {
                            delete data.prop.atKeyword;
                        }
                        if (!data.prop.environmentId) {
                            delete data.prop.environmentId;
                        }
                        
                        if ( (data.prop.useKeyword || data.prop.useKeyword == null) &&
                                ['interactiveEnvironment', 'gatherable', 'crumbling', 'holder', 'mover'].indexOf(this.data.type) === -1 ) {
                            delete data.prop.useKeyword;
                        }
                        if ( (data.prop.backTileCount || data.prop.backTileCount == null) &&
                                ['holder'].indexOf(this.data.type) === -1 ) {
                            delete data.prop.backTileCount;
                        }
                        if ( !data.prop.motionId || !this.types[this.data.type].canHaveMotionId ) {
                            delete data.prop.motionId;
                        }
                        
                        if ( (data.prop.atKeyword || data.prop.atKeyword == null) &&
                                ['interactiveEnvironment', 'liner'].indexOf(this.data.type) == -1 ) {
                            delete data.prop.atKeyword;
                        }
                        
                        if ( (data.prop.getId || data.prop.getId == null) && (this.data.type != 'interactiveEnvironment') ) {
                            delete data.prop.getId;
                        }
                        if ( (data.prop.boundingBox2 || data.prop.boundingBox2 == null) &&
                                (this.data.type != 'emitter' && this.data.type != 'aimable') ) {
                            delete data.prop.boundingBox2;
                        }
                        if ( (data.prop.boundingBox || data.prop.boundingBox == null) &&
                                !( ['interacting', 'interactingMotion'].indexOf(this.data.type) >= 0 &&
                                this.data.prop.attributes && this.data.prop.attributes.indexOf('solid') >= 0 ) ) {
                            delete data.prop.boundingBox;
                        }
                        if ( data.prop.offset && ['mountableGround', 'mountableAir'].indexOf(this.data.type) === -1 ) {
                            delete data.prop.offset;
                        }
                        
                        this.removeLivePreviewEntities();
                        
                        if (!data.prop.clonedFrom) { delete data.prop.clonedFrom; }
                        if (!data.prop.changerId) { delete data.prop.changerId; }
                        
                        delete data.prop.textSize;
    
                        if (this.data.type == 'music') {
                            ig.game.musicRecorder.clearData();
                            ig.game.musicManager.clearData();
                        }
                        
                        if (this.data.type != 'aimable') {
                            delete data.prop.specs;
                        }
                        
                        if (this.data.type != 'transforming' || !data.prop.secPerTransform) {
                            delete data.prop.secPerTransform;
                        }
                        
                        if (this.data.type == 'writable' && !ig.game.isEditorHere) {
                            ig.game.sounds.nocando.play();
                            return;
                        }
        
                        if (this.types[this.data.type].hasMultiDirection) {
                            if (!data.prop) { data.prop = {}; }
                            data.prop.throwDirection = parseInt(data.direction);
                            delete data.direction;
                        }
                        else {
                            delete data.prop.throwDirection;
                        }
                        
                        this.handleSettingOfExternalData(data);

                        if (data.type == 'musicSheet') {
                            data.colors = this.getDistinctColorsToKeepInstrumentAssociation(data.pixels, data.colors);
                        }

                        this.reduceColorsToMinimalNeeded(data);
                        this.removeNullCells(data);
        
                        data.type = this.types[this.data.type].key;
                        if ( !data.prop.soundId || ( data.prop.soundId && this.typesWithSoundId.indexOf(data.type) === -1 ) ) {
                            delete data.prop.soundId;
                        }

                        this.removeAutoSpeedFastIfNotNeeded(data);
                        ig.game.attributesManager.compressData(data);

                        this.removeInputBox();
                        this.saveToServer(data);
                    }
                }
            }
            else {
                ig.game.sounds.nocando.play();
                if (issues.length >= 1) { ig.game.alertDialog.open( issues.join(' ') ); }
            }
        }
        else {
            ig.game.sounds.nocando.play();
            if (issues.length >= 1) { ig.game.alertDialog.open( issues.join(' ') ); }
        }
    },
    
    getDistinctColorsToKeepInstrumentAssociation: function(pixels, colors) {
        var newColors = ig.game.cloneObject(colors);
        for (var i = 0; i < this.instruments.length; i++) {
            if (newColors[i]) {
                var isWhite = newColors[i].r == 255 &&
                              newColors[i].g == 255 &&
                              newColors[i].b == 255 &&
                              newColors[i].alpha == 1;
                if ( isWhite && this.colorFoundInPixels(pixels, i) ) {
                    newColors[i].r -= i;
                    newColors[i].g -= i;
                    newColors[i].b -= i;
                }
            }
        }
        return newColors;
    },
    
    colorFoundInPixels: function(pixels, colorIndex) {
        var found = false;
        if (pixels && pixels[0] && pixels[0][0] !== undefined) {
            var maxX = pixels[0].length, maxY = pixels[0][0].length;
            for (var cell = 0; cell < pixels.length && !found; cell++) {
                for (var x = 0; x < maxX && !found; x++) {
                    for (var y = 0; y < maxY && !found; y++) {
                        found = pixels[cell] && pixels[cell][x] && pixels[cell][x][y] == colorIndex;
                    }
                }
            }
        }
        return found;
    },

    handleSettingOfExternalData: function(data) {
        switch (this.data.type) {
            case 'mift':
                data.ext = {};
                data.ext.toId = data.prop.toId;
                data.ext.text = data.prop.text;
                data.ext.isPrivate = data.prop.attributes && data.prop.attributes.indexOf('private') >= 0;

                delete data.prop.toId;
                delete data.prop.text;
                break;
                
            case 'writable':
                data.ext = {
                        name: ig.game.validations.itemName.clean(this.data.name),
                        rgbBackground: this.data.colors[0] ? this.getRgbString( this.data.colors[0] ) : '255,255,255',
                        rgbText: this.data.colors[1] ? this.getRgbString( this.data.colors[1] ) : '0,0,0',
                        areaGroupId: ig.game.areaGroupId,
                        rights: parseInt(this.writableRightsSetting)
                    };
                break;
        }
    },
    
    saveToServer: function(data) {
        if (!this.isCurrentlySavingToServer) {
            var self = this;
            this.isCurrentlySavingToServer = true;

            var thisType = data.type;
            var isClonedBySomeoneElse = Boolean(data.prop && data.prop.clonedFrom);
            var isInteractingCheckingIfSomeoneJumps = Boolean( data.type == 'INTERACT' &&
                    data.prop && data.prop.textData && data.prop.textData.toLowerCase().indexOf('someone jumps') >= 0 );
            var isFlyingMountWithColorTrail = Boolean( data.type == 'MNTAIR' &&
                    data.prop && data.prop.attr &&
                    data.prop.attr.indexOf( ig.game.attributesManager.info.MNTAIR.colorTrail.shortkey ) >= 0 )
            
            data.pixels = ig.game.strings.compressAscii( JSON.stringify(data.pixels) );
            
            //Kick off submission, and store promise
            var submitItem_Promise = ig.game.httpApi.submitCreatedItem_P(data, this);

            //Submission returned NO ERROR
            submitItem_Promise.done(function(data){
                var itemId = data.itemId;
                var transactionId = data.transactionId;

                if(itemId) { //Saved Ok.
                    this.handleCloseTidyUp();
                    this.clearEmergencyBackup();
                    ig.game.itemsManager.createdItemSavedSuccessfully(itemId);

                    ig.game.achievementManager.register(ig.game.achievementManager.types.SAVED_CREATION);
                    if (isClonedBySomeoneElse) {
                        ig.game.achievementManager.register(ig.game.achievementManager.types.SAVED_CLONED_CREATION);
                    }
                    if (isInteractingCheckingIfSomeoneJumps) {
                        ig.game.achievementManager.register(ig.game.achievementManager.types.SAVED_SPECIFIC_INTERACTING);
                    }
                    if (isFlyingMountWithColorTrail) {
                        ig.game.achievementManager.register(ig.game.achievementManager.types.SAVED_SPECIFIC_FLYING_MOUNT);
                    }

                    if (self.doCloneContents) {
                        if (thisType == 'MULTITHING') {
                            self.cloneMultithingContents(self.lastClonedFromId, itemId);
                        }
                        self.doCloneContents = false;
                    }

                    if (transactionId &&
                        ( ig.game.ourPlayer.rank > 1 || ig.game.ourPlayer.screenName.toLowerCase().indexOf('test') >= 0 )
                        && !ig.ua.steam) { //payment required.  Skip for steam (will happen in steam overlay).
                        localStorage.skipNextAd = true;
                        ig.game.iapManager.continueTransaction(transactionId);
                    }
                } else if(!data.quotaOk) {
                    //Over-quota
                    console.log('Submission rejected : over-quota');
                } else {
                    //Something unknown
                    console.log('Unknown saveToServer response');
                }
                self.isCurrentlySavingToServer = false;
            });

            //Submission returned ERROR (some unexpected error happened - connection problems, db problems etc)
            submitItem_Promise.fail(function() {
                ig.game.errorManager.criticalHalt("Oops, error saving creation. A backup should load next time you open the creator.");
                self.isCurrentlySavingToServer = false;
            });
        }
    },
    
    cloneMultithingContents: function(multithingFromId, multithingToId) {
        ig.game.httpApi.getMultithing(multithingFromId).done(function(data){
            if (data && data.data) {
                if (!data.data.staticItemsPropIndexAndXY)  { data.data.staticItemsPropIndexAndXY = []; }
                if (!data.data.movableItemsPropIndexAndXY) { data.data.movableItemsPropIndexAndXY = []; }
                
                ig.game.httpApi.saveMultithing(multithingToId, data.data).done(function(savedData){
                    console.log('savedData', savedData);
                });
            }
        });
    },

    removeAutoSpeedFastIfNotNeeded: function(data) {
        if (data && data.prop && data.prop.attributes) {
            var attributes = data.prop.attributes;
            var autoSpeedFastIndex = attributes.indexOf('autoSpeedFast');
            if ( autoSpeedFastIndex >= 0 &&
                attributes.indexOf('autoSpeedLeft') === -1 &&
                attributes.indexOf('autoSpeedRight') === -1 &&
                attributes.indexOf('autoSpeedUp') === -1 &&
                attributes.indexOf('autoSpeedDown') === -1 ) {

                data.prop.attributes.splice(autoSpeedFastIndex, 1);
            }
        }
    },

    clearUnneededCells: function(data) {
        if (!this.data.type) { return; }

        if ( ['motion', 'interactingMotion', 'holder'].indexOf(this.data.type) >= 0 ) {
            for (var n = 3; n < data.pixels.length; n++) { data.pixels[n] = null; }
        }
        else if (!this.types[this.data.type].hasOptionalCells) {
            if ( !this.types[this.data.type].isMultiAnimated ) {
                for (var n = 2; n < data.pixels.length; n++) { data.pixels[n] = null; }
            }
            if ( !this.types[this.data.type].isMultiAnimated && !this.types[this.data.type].isAnimated) {
                if (data.pixels[1]) { data.pixels[1] = null; }
            }
        }
    },

    removeNullCells: function(data) {
        for (var i = data.pixels.length - 1; i >= 0; i--) {
            if (!data.pixels[i]) {
                data.pixels.splice(i, 1);
            }
        }
    },

    reduceColorsToMinimalNeeded: function(data) {
        var defaultColor = this.getRgbaString( this.getDefaultColor() );
        for (var i = data.colors.length - 1; i >= 1; i--) {
            var colorString = this.getRgbaString(data.colors[i]);
            if ( colorString == defaultColor && !this.colorFoundInPixels(data.pixels, i) ) {
                data.colors.pop();
            }
            else {
                break;
            }
        }
        return data;
    },

    getAvatarIsTouchingMountable: function(mountablePositionRelativeToAvatar) {
        var isValid = true;
        var mountableSize = {x: this.data.pixels[0].length, y: this.data.pixels[0][0].length};
        if (mountablePositionRelativeToAvatar.x > 22 || mountablePositionRelativeToAvatar.y > 29 ||
            mountablePositionRelativeToAvatar.x + mountableSize.x < 0 || mountablePositionRelativeToAvatar.y + mountableSize.y < 0
                ) {
            isValid = false;
        }
        return isValid;
    },

    getMountablePositionRelativeToAvatar: function() {
        var topLeftMountable = this.getMostTopLeftPixelPosition();
        var mountablePositionRelativeToAvatar =
                {x: topLeftMountable.x - this.avatarTemplatePosition.x, y: topLeftMountable.y - this.avatarTemplatePosition.y};
        return mountablePositionRelativeToAvatar;
    },

    getMostTopLeftPixelPosition: function() {
        var minPos = {x: null, y: null};
        for (var cell = 0; cell < this.data.pixels.length; cell++) {
            for (var x = 0; x < this.data.pixels[cell].length; x++) {
                for (var y = 0; y < this.data.pixels[cell][x].length; y++) {
                    var colorIndex = this.data.pixels[cell][x][y];
                    if (colorIndex != this.transparentIndex) {
                        if (minPos.x == null || x < minPos.x) { minPos.x = x; }
                        if (minPos.y == null || y < minPos.y) { minPos.y = y; }
                    }
                }
            }
        }
        return minPos;
    },

    restrictOptionalCellsToCellCount: function() {
        var deleteFrom = this.optionalCellCount;
        this.data.pixels.splice(deleteFrom, this.data.pixels.length - deleteFrom);
    },

    cropViewableGlowOrHolder: function() {
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                if (x >= this.tileWidthDefault || y >= this.tileHeightDefault) {
                    this.data.pixels[this.selectedCell][x][y] = this.transparentIndex;
                }
            }
        }
    },

    autoAdjustSlopeToDirection: function() {
        var slopeTypes = ['slope', 'slideySlope', 'passableSlope', 'tiltedBouncy'];
        if ( this.data.type && slopeTypes.indexOf(this.data.type) >= 0 ) {

            var slopeMasks = [ this.getSlopeMask() ];
            for (var direction = 1; direction < this.directionMax; direction++) {
                slopeMasks[direction] = this.clonePixelsRotateRight( slopeMasks[direction - 1] );
            }

            var opacitySumHighest = null, highestDirection = 0;
            for (var direction = 0; direction < this.directionMax; direction++) {
                var opacitySum = this.getOpacitySumOfPixels( slopeMasks[direction] );
                if (opacitySumHighest == null || opacitySum > opacitySumHighest) {
                    opacitySumHighest = opacitySum;
                    highestDirection = direction;
                }
            }

            this.data.direction = highestDirection;
        }
    },

    showSlopeMaskForTesting: function(maskPixels) {
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                this.data.pixels[this.selectedCell][x][y] = maskPixels[x][y];
            }
        }
        this.updateAll();
    },

    getOpacitySumOfPixels: function(pixelsMap) {
        var opacitySum = 0;
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                var colorIndex = this.data.pixels[this.selectedCell][x][y];
                if (pixelsMap[x][y] != this.transparentIndex && this.data.colors[colorIndex] && this.data.colors[colorIndex].alpha) {
                    opacitySum += this.data.colors[colorIndex].alpha;
                }
            }
        }
        return opacitySum;
    },

    getSlopeMask: function() {
        var pixels = this.getPixelMap();
        var minX = this.tileWidth - 1;
        for (var y = 0; y < this.tileHeight; y++) {
            for (var x = minX; x < this.tileWidth; x++) {
                pixels[x][y] = this.transparentIndex - 1;
            }
            if (minX > 0) { minX--; }
        }
        return pixels;
    },

    verifyIsVisibleEnough: function() {
        var isValid = true;

        if ( this.data.type && (this.types[this.data.type].needsGoodVisibility) ) {
            var opaquePixelCount = 0;
            var nonOpaquePixelCount = 0;
            for (var cell = 0; cell < this.data.pixels.length; cell++) {
                for (var x = 0; x < this.tileWidth; x++) {
                    for (var y = 0; y < this.tileHeight; y++) {

                        if ( this.data.pixels[cell] && this.data.pixels[cell][x] &&
                                this.data.pixels[cell][x][y] !== undefined) {
                            var colorIndex = this.data.pixels[cell][x][y];
                            if (colorIndex != null || colorIndex != undefined) {
                                var rgba = this.data.colors[colorIndex];
                                if (rgba.alpha == 1) { opaquePixelCount++; }
                                else if (rgba.alpha > 0) { nonOpaquePixelCount++; }
                            }
                        }

                    }
                }
            }

            var minCount = ig.game.ourPlayer.rank >= 2 ? 5 : 15;

            var typesNeedingOnlyABitVisibility = ['light', 'lighttop', 'vignette', 'fillLight', 'music',
                    'environment', 'lively', 'holder'];
            if ( typesNeedingOnlyABitVisibility.indexOf(this.data.type) >= 0 ) { minCount = 5; }
            
            isValid = opaquePixelCount >= minCount;

            if (isValid && this.data.type == 'deadlyEmerge') {
                isValid = opaquePixelCount >= 20 && nonOpaquePixelCount == 0;
            }
        }

        return isValid;
    },

    getOpaquePixelCountByCell: function(cell) {
        var opaquePixelCount = 0;
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {

                var colorIndex = this.data.pixels[cell][x][y];
                if (colorIndex != null || colorIndex != undefined) {
                    var rgba = this.data.colors[colorIndex];
                    if (rgba.alpha == 1) { opaquePixelCount++; }
                }

            }
        }
        return opaquePixelCount;
    },

    verifyMinSizeAndCropIfNeeded: function() {
        var isValid = true;
        var size = this.types[this.data.type].tileSize;
        if (size) {
            var hasSpecialSize = size.width != this.tileWidthDefault || size.height != this.tileHeightDefault;
            if ( (hasSpecialSize || this.data.type == 'holdableItem' || this.data.type == 'emitter' ||
                    this.data.type == 'equipment' || this.data.type == 'consumable' || this.data.type == 'hook' ||
                    this.data.type == 'wearable' || this.data.type == 'body' || this.data.type == 'aimable' ||
                    this.data.type == 'thing') && this.data.type != 'motion' ) {
                // wouldn't above list equal a check for autoCropped: true?

                var limitsRect = this.getLimitsRectangle();
                var minSize = this.minSizeForItems;
                if (this.data.type == 'body') { minSize = this.minSizeForBodies; }
                else if (this.data.type == 'mountableAir') { minSize = this.minSizeForMountableAirs; }
                else if (this.data.type == 'thing') { minSize = this.minSizeForThings; }

                var meetsMinSizeRequirement = limitsRect.x2 - limitsRect.x1 + 1 >= minSize && limitsRect.y2 - limitsRect.y1 + 1 >= minSize;
                if (meetsMinSizeRequirement) {
                    if (this.types[this.data.type].autoCropped) {
                        this.cropDrawing(limitsRect);
                    }
                }
                else {
                    isValid = false;
                }
            }
        }
        return isValid;
    },

    cropDrawing: function(limitsRect) {
        this.tileWidth = limitsRect.x2 - limitsRect.x1 + 1;
        this.tileHeight = limitsRect.y2 - limitsRect.y1 + 1;

        for (var cell = 0; cell < this.maxCells; cell++) {
            if (!this.data.pixels[cell]) { break; }
            
            var pixelsCropped = this.getPixelMap();

            for (var x = 0; x < this.tileWidth; x++) {
                for (var y = 0; y < this.tileHeight; y++) {
                    pixelsCropped[x][y] = this.data.pixels[cell][x + limitsRect.x1][y + limitsRect.y1];
                }
            }

            this.data.pixels[cell] = this.clonePixelsOfCell(pixelsCropped);
        }

        this.tileWidth = this.types[this.data.type].tileSize.width;
        this.tileHeight = this.types[this.data.type].tileSize.height;
    },

    getLimitsRectangle: function() {
        var limitsRect = {x1: null, y1: null, x2: null, y2: null};
        for (var cell = 0; cell < this.maxCells; cell++) {
            for (var x = 0; x < this.tileWidth; x++) {
                for (var y = 0; y < this.tileHeight; y++) {

                    if  (this.data.pixels[cell] && this.data.pixels[cell][x] &&
                            this.data.pixels[cell][x][y] !== undefined) {
                            
                        var index = this.data.pixels[cell][x][y];
                        if (index != this.transparentIndex) {
                            if (limitsRect.x1 == null || x < limitsRect.x1) { limitsRect.x1 = x; }
                            if (limitsRect.x2 == null || x > limitsRect.x2) { limitsRect.x2 = x; }
                            if (limitsRect.y1 == null || y < limitsRect.y1) { limitsRect.y1 = y; }
                            if (limitsRect.y2 == null || y > limitsRect.y2) { limitsRect.y2 = y; }
                        }
                        
                    }

                }
            }
        }
        return limitsRect;
    },

    getLimitsRectangleForCell: function(cell) {
        var limitsRect = {x1: null, y1: null, x2: null, y2: null};
        for (var x = 0; x < this.data.pixels[cell].length; x++) {
            for (var y = 0; y < this.data.pixels[cell][0].length; y++) {
                var index = this.data.pixels[cell][x][y];
                if (index != this.transparentIndex) {
                    if (limitsRect.x1 == null || x < limitsRect.x1) { limitsRect.x1 = x; }
                    if (limitsRect.x2 == null || x > limitsRect.x2) { limitsRect.x2 = x; }
                    if (limitsRect.y1 == null || y < limitsRect.y1) { limitsRect.y1 = y; }
                    if (limitsRect.y2 == null || y > limitsRect.y2) { limitsRect.y2 = y; }
                }
            }
        }
        return limitsRect;
    },

    normalizeDirection: function(maxCells) {
        if (this.data.direction != null && this.data.direction > 0 && !this.types[this.data.type].hasMultiDirection) {
            for (var i = this.data.direction + 0; i > 0; i--) {
                for (var cell = 0; cell < maxCells; cell++) {
                    this.data.pixels[cell] = this.clonePixelsRotateLeft(this.data.pixels[cell]);
                }
            }
        }
    },

    ensureCorrectDataTypes: function() {
        for (var cell = 0; cell < this.maxCells; cell++) {
            for (var x = 0; x < this.tileWidth; x++) {
                for (var y = 0; y < this.tileWidth; y++) {
                    if (this.data.pixels[cell] && this.data.pixels[cell][x] &&
                            this.data.pixels[cell][x][y] != undefined && this.data.pixels[cell][x][y] != null) {
                        this.data.pixels[cell][x][y] = parseInt(this.data.pixels[cell][x][y]);
                    }
                }
            }
        }

        for (var i = 0; i < this.maxColors; i++) {
            if (this.data.colors[i] == undefined || this.data.colors[i] == null) {
                this.data.colors[i] = this.getDefaultColor(i);
            }

            this.data.colors[i].r = parseInt(this.data.colors[i].r);
            this.data.colors[i].g = parseInt(this.data.colors[i].g);
            this.data.colors[i].b = parseInt(this.data.colors[i].b);
            if (this.data.colors[i].alpha != null && this.data.colors[i].alpha != undefined) {
                this.data.colors[i].alpha = parseFloat(this.data.colors[i].alpha);
            }
        }
    },

    getBorderTouches: function(cell) {
        if (cell === undefined) { cell = this.selectedCell; }

        var touches = {top: false, right: false, bottom: false, left: false};
        for (var x = 0; x < this.tileWidth && !touches.top; x++) {
            touches.top = this.data.pixels[cell][x][0] != this.transparentIndex;
        }
        for (var x = 0; x < this.tileWidth && !touches.bottom; x++) {
            touches.bottom = this.data.pixels[cell][x][this.tileHeight - 1] != this.transparentIndex;
        }
        for (var y = 0; y < this.tileHeight && !touches.left; y++) {
            touches.left = this.data.pixels[cell][0][y] != this.transparentIndex;
        }
        for (var y = 0; y < this.tileHeight && !touches.right; y++) {
            touches.right = this.data.pixels[cell][this.tileWidth - 1][y] != this.transparentIndex;
        }
        return touches;
    },

    drawingTouchesAllNeededBorders: function(cell) {
        var touchesAllNeededBorders = true;
        var requiredBorders = this.data.type != null && this.types[this.data.type].requiredBorders != null ? this.types[this.data.type].requiredBorders : 4;
        if (requiredBorders != 0) {
            var touches = this.getBorderTouches(cell);
            var touchedCount = (touches.top ? 1 : 0) + (touches.right ? 1 : 0) + (touches.bottom ? 1 : 0) + (touches.left ? 1 : 0);

            if (this.data.type == 'body') { touchesAllNeededBorders = touches.bottom; }
            else { touchesAllNeededBorders = touchedCount >= requiredBorders; }
    
            if (!touchesAllNeededBorders) {
                this.update();
                if (this.data.type == 'body') {
                    this.emphasizeUntouchedBorders(false, false, true, false);
                }
                else {
                    this.emphasizeUntouchedBorders(!touches.top, !touches.right, !touches.bottom, !touches.left);
                }
    
                if (this.mode == 'default') {
                    this.drawImageWithAlpha( this.getDrawBigName(),
                            this.areas.drawBigMessage.x1, this.areas.drawBigMessage.y1, this.drawImageMessageMaxOpacity );
                }
            }
        }
        return touchesAllNeededBorders;
    },

    fadeInDrawBigMessage: function(forceShow) {
        if ( this.isRunning && (this.mode == 'default' || this.mode == 'pickType') ) {
            if ( !this.pixelHasBeenDrawn() || forceShow ) {
                this.fadeOpacity += .025;
                this.clearRect(this.areas.drawBigMessage.x1, this.areas.drawBigMessage.y1,
                        this.areas.drawBigMessage.width, this.areas.drawBigMessage.height);
    
                var drawBigName = this.getDrawBigName();
                if (drawBigName != null) {
                    this.drawImageWithAlpha(drawBigName, this.areas.drawBigMessage.x1, this.areas.drawBigMessage.y1, this.fadeOpacity);
                    if (this.fadeOpacity < this.drawImageMessageMaxOpacity) {
                        var self = this;
                        this.timeouts.drawBig = setTimeout(
                            function() {
                                if (self.fadeOpacity < self.drawImageMessageMaxOpacity) { self.fadeInDrawBigMessage(forceShow); }
                            }, 50);
                    }
                }
            }
        }
    },

    getDrawBigName: function() {
        var name = null;
        switch ( this.getRequiredBordersByType(this.data.type) ) {
            case 0:  name = 'drawBig5x5'; break;
            case 1:  name = 'drawBig1Border'; break;
            case 2:  name = 'drawBig2Borders'; break;
            case 3:  name = 'drawBig3Borders'; break;
            default: name =  'drawBig';
        }
        return name;
    },

    changePreviewColor: function() {
        var hasLivePreview = this.getCurrentTypeHasLivePreview();
    
        if ( this.isRunning && this.mode != 'changeColor' ) {
            if (hasLivePreview) {
                if (this.somethingChangedSinceLivePreview) {
                    this.updateLivePreview();
                    this.somethingChangedSinceLivePreview = false;
                }
            }
            else {
        
                if (this.previewColors == null) {
                    this.previewColors = [
                        {r: 132, g: 128, b: 121},
                        {r: 50, g: 149, b: 235},
                        {r: 41, g: 74, b: 72},
                        {r: 76, g: 196, b: 90},
                        {r: 240, g: 238, b: 237},
                        {r: 230, g: 80, b: 30},
                        {r: 195, g: 209, b: 42},
                        {r: 156, g: 102, b: 156},
                        {r: 12, g: 13, b: 13},
                        {r: 104, g: 146, b: 150}
                    ];
                }

                var colorStep = 2;
                if (this.previewColorTargetIndex == null) {
                    this.previewColorTargetIndex = 1;
                    this.previewColor = this.previewColors[this.previewColorTargetIndex - 1];
                }

                var targetColor = this.previewColors[this.previewColorTargetIndex];
                var oldPreviewColor = {r: this.previewColor.r, g: this.previewColor.g, b: this.previewColor.b};

                if (this.previewColor.r < targetColor.r) {
                    this.previewColor.r += colorStep; if (this.previewColor.r > targetColor.r) { this.previewColor.r = targetColor.r }
                }
                else if (this.previewColor.r > targetColor.r) {
                    this.previewColor.r -= colorStep; if (this.previewColor.r < targetColor.r) { this.previewColor.r = targetColor.r }
                }

                if (this.previewColor.g < targetColor.g) {
                    this.previewColor.g += colorStep; if (this.previewColor.g > targetColor.g) { this.previewColor.g = targetColor.g }
                }
                else if (this.previewColor.g > targetColor.g) {
                    this.previewColor.g -= colorStep; if (this.previewColor.g < targetColor.g) { this.previewColor.g = targetColor.g }
                }

                if (this.previewColor.b < targetColor.b) {
                    this.previewColor.b += colorStep; if (this.previewColor.b > targetColor.b) { this.previewColor.b = targetColor.b }
                }
                else if (this.previewColor.b > targetColor.b) {
                    this.previewColor.b -= colorStep; if (this.previewColor.b < targetColor.b) { this.previewColor.b = targetColor.b }
                }

                this.context.fillStyle = this.getRgbaString(this.previewColor);
                this.fillRect(this.areas.preview.x1, this.areas.preview.y1, this.areas.preview.width, this.areas.preview.height);

                var reachedTargetColor = this.previewColor.r == oldPreviewColor.r &&
                        this.previewColor.g == oldPreviewColor.g &&
                        this.previewColor.b == oldPreviewColor.b;
                if (reachedTargetColor) {
                    if (++this.previewColorTargetIndex > this.previewColors.length - 1) { this.previewColorTargetIndex = 0; }
                }
                
                this.updatePreview();
            }
        }

        var self = this;
        var delayMS = hasLivePreview ? 1000 : 200;
        
        this.timeouts.preview = setTimeout( function() { self.changePreviewColor(); }, delayMS);
    },

    getCurrentTypeHasLivePreview: function() {
        return Boolean( this.data.type && this.typesWithLivePreview.indexOf(this.data.type) >= 0 );
    },

    updatePreview: function() {
        var isBiggerThanPreview = ['bigThing', 'veryBigThing'].indexOf(this.data.type) >= 0;
        if ( ! (isBiggerThanPreview || this.getCurrentTypeHasLivePreview() ) ) {
            if (this.data.type) {
                var animationChance = 20;
                if (this.types[this.data.type].flips && this.getChance(animationChance) ) {
                    this.previewIsFlipped = !this.previewIsFlipped;
                }
                else if (!this.types[this.data.type].flips) {
                    this.previewIsFlipped = false;
                }

                else if (this.types[this.data.type].isAnimated) {
                    if ( this.getChance(animationChance) ) {
                        this.previewCell = this.previewCell == 0 ? 1 : 0;
                    }
                }
                else {
                    this.previewCell = 0;
                }
            }
            else {
                this.previewCell = 0;
            }

            var pixels = this.data.pixels[this.previewCell];
            if (this.previewIsFlipped) { pixels = this.clonePixelsMirrorX(pixels); }

            var isMountable = this.data.type && this.types[this.data.type].isMountable;
            if (this.mode != 'changeColor' && pixels && !isMountable) {
                this.drawTileAt(pixels, this.areas.preview.x1, this.areas.preview.y1);
            }
        }
    },

    drawTileAt: function(pixels, xTop, yLeft) {
        var previewSize = 19;
        var sourceRect = {x1: 0, y1: 0, x2: this.tileWidth - 1, y2: this.tileHeight - 1};
        if (this.tileWidth > previewSize) {
            sourceRect.x1 = Math.floor(this.tileWidth / 4);
            sourceRect.x2 = sourceRect.x1 + previewSize - 1;
        }
        if (this.tileHeight > previewSize) {
            sourceRect.y1 = Math.floor(this.tileHeight / 4);
            sourceRect.y2 = sourceRect.y1 + previewSize - 1;
        }
                
        for (var x = sourceRect.x1; x <= sourceRect.x2; x++) {
            for (var y = sourceRect.y1; y <= sourceRect.y2; y++) {
                var colorIndex = pixels[x] != undefined && pixels[x][y] != undefined ? pixels[x][y] : this.transparentIndex;
                var rgba = this.data.colors[colorIndex];
                this.context.fillStyle = this.getRgbaString(rgba);
                this.fillRect(xTop + x - sourceRect.x1, yLeft + y - sourceRect.y1, 1, 1);
            }
        }
    },

    emphasizeUntouchedBorders: function(emphasizeTop, emphasizeRight, emphasizeBottom, emphasizeLeft) {
        var rgbaEmphasis = {r : 200, g : 50, b: 50, alpha: .5};
        var emphasisMap = this.getPixelMap();
        var modulo = 2;
        var margin = 2;

        if (emphasizeTop) {
            var y = 0;
            for (var x = margin; x < this.tileWidth - margin; x++) {
                if (emphasisMap[x][y] == this.transparentIndex && x % modulo == 0) {
                    this.drawPixelInDrawing(x, y, rgbaEmphasis);
                    emphasisMap[x][y] = 1;
                }
            }
        }
        if (emphasizeRight) {
            var x = this.tileWidth - 1;
            for (var y = margin; y < this.tileHeight - margin; y++) {
                if (emphasisMap[x][y] == this.transparentIndex && y % modulo == 0) {
                    this.drawPixelInDrawing(x, y, rgbaEmphasis);
                    emphasisMap[x][y] = 1;
                }
            }
        }
        if (emphasizeBottom) {
            var y = this.tileHeight - 1;
            for (var x = margin; x < this.tileWidth - margin; x++) {
                if (emphasisMap[x][y] == this.transparentIndex && x % modulo == 0) {
                    this.drawPixelInDrawing(x, y, rgbaEmphasis);
                    emphasisMap[x][y] = 1;
                }
            }
        }
        if (emphasizeLeft) {
            var x = 0;
            for (var y = margin; y < this.tileHeight - margin; y++) {
                if (emphasisMap[x][y] == this.transparentIndex && y % modulo == 0) {
                    this.drawPixelInDrawing(x, y, rgbaEmphasis);
                    emphasisMap[x][y] = 1;
                }
            }
        }
    },

    updateBasedOnCursorInPickTypeMode: function() {
        var x = this.cursorX, y = this.cursorY;
        if (this.cursorIsDown && this.cursorWasUpSinceMode) {
            if ( this.pointIsInRectangle(x, y, this.areas.typePickerSelections) ) {
                var column = x <= this.areas.typePickerSelections.x1 + this.areas.typePickerGrid.width ? 0 : 1;
                var row = Math.ceil( (y - this.areas.typePickerSelections.y1) / this.areas.typePickerGrid.height ) - 1;

                var index = column * this.typePickerRowsPerColumn + row;
                var type = this.getTypeByIndex(index);
                if (type != null) {
                    var rankOk = this.types[type].rankNeeded ? ig.game.ourPlayer.rank >= this.types[type].rankNeeded : true;
                    if (ig.game.ourPlayer.rank <= 0) { rankOk = false; }
                    if (rankOk) {
                        ig.game.sounds.click.play();

                        var typesInGroup = this.getTypesInGroup(type);
                        if (typesInGroup) { type = typesInGroup[0]; }
                        this.setToType(type, true);
                        this.saveDataEmergencyBackup();
                        this.hideSubDialog();
                    }
                    else {
                        ig.game.rankManager.showRankNotEnough();
                    }
                }
            }
            else {
                this.hideSubDialog();
                ig.game.sounds.click.play();
            }
        }
    },

    updateBasedOnCursorUpInPickAttributesMode: function() {
        var x = this.cursorX, y = this.cursorY;
        if ( this.cursorWasUpSinceMode && !(ig.game.alertDialog && ig.game.alertDialog.isOpen) ) {
            if ( this.pointIsInRectangle(x, y, this.areas.typePickerSelections) ) {
                var column = x <= this.areas.typePickerSelections.x1 + this.areas.typePickerGrid.width ? 0 : 1;
                var row = Math.ceil( (y - this.areas.typePickerSelections.y1) / this.areas.typePickerGrid.height ) - 1;

                var index = column * this.typePickerRowsPerColumn + row;
                var attribute = this.getAttributeByIndex(index);
                if (attribute != null) {
                    var info = ig.game.attributesManager.info[ this.types[this.data.type].key ][attribute];
                    var doShow = !info.hidden && ( !info.deprecated || this.data.prop.attributes.indexOf(attribute) >= 0 );
                    if (doShow) {
                        ig.game.sounds.click.play();
                        this.toggleCheckedAttribute(attribute);
                        this.showAttributesPicker();
                        this.saveDataEmergencyBackup();
                    }
                }
            }
            else {
                this.hideSubDialog();
                ig.game.sounds.click.play();

                if ( this.data.prop && this.data.prop.attributes && this.data.prop.attributes.indexOf('toArea') >= 0 &&
                        !this.didInformAboutToAreaAttribute ) {
                    this.showHelperToAreaInfo();
                    this.didInformAboutToAreaAttribute = true;
                }
            }
            this.updateLivePreview();
        }
    },
    
    showHelperToAreaInfo: function(optionalFalseName) {
        var html = '';
        if (optionalFalseName) {
            html += "<p>Oops, area name \"" + ig.game.strings.htmlEscape(optionalFalseName) + "\" not found.</p>";
        }
        html += "<p>for the helper's name, use \"areaname\" or \"to&nbsp;areaname\" " +
                "(e.g. \"to&nbsp;example&nbsp;island\").</p>";
        ig.game.alertDialog.open({html: html, doShowSmaller: true});
    },
    
    toggleCheckedAttribute: function(attribute) {
        if (this.data.prop && this.data.prop.attributes) {
            if ( ig.game.attributesManager.getIsTypeWithSingleAttribute( this.types[this.data.type].key ) ) {
                this.data.prop.attributes = [attribute];

            }
            else {
                var index = this.data.prop.attributes.indexOf(attribute);
                if (index >= 0) {
                    this.data.prop.attributes.splice(index, 1);
                }
                else {
                    this.data.prop.attributes.push(attribute);
                    this.resolveAttributeIncompatibilities(attribute);
                }

            }
        }
    },
    
    addToArrayIfItDoesntExist: function(array, value) {
        if ( array.indexOf(value) === -1 ) { array.push(value); }
    },
    
    removeFromArrayIfItExists: function(array, value) {
        var index = array.indexOf(value);
        if (index >= 0) { array.splice(index, 1); }
    },

    resolveAttributeIncompatibilities: function(newlyCheckedAttribute) {
        for (var i = 0; i < ig.game.attributesManager.incompatiblePairs.length; i++) {
            var pair = ig.game.attributesManager.incompatiblePairs[i];
            var index = pair.indexOf(newlyCheckedAttribute);
            if (index >= 0) {
                var attributeToUncheck = index == 0 ? pair[1] : pair[0];
                var indexToUncheck = this.data.prop.attributes.indexOf(attributeToUncheck);
                if (indexToUncheck >= 0) {
                    this.data.prop.attributes.splice(indexToUncheck, 1);
                }
            }
        }
    },

    setToType: function(type, clearThingReferences) {
        if ( !type || !this.types[type] ) { return; }
        
        this.stopPlayMusicSheet();
        var doContinue = true;
        if ( type == 'motion' && this.pixelHasBeenDrawnInAnyCell() ) {
            doContinue = confirm('Motion will replace your current drawing with your body. Continue?');
        }

        if (doContinue) {
            this.takeCanvasSnapshot();
            
            this.optionalCellCountMax = 6;
            if ( ['musicSheet', 'dynamicThing', 'happening', 'farBack'].indexOf(type) >= 0 ) {
                this.optionalCellCountMax = type == 'farBack' ? this.farBackCellsMax : 9;
            }
    
            this.fadeOpacity = 0;
            var oldSize = this.data.type ? this.types[this.data.type].tileSize : null;
            if (!oldSize) { oldSize = {width: this.tileWidthDefault, height: this.tileHeightDefault}; }
    
            if ( ( this.data && (this.data.type == 'viewable' || this.data.type == 'glow') ) || type == 'body' ) {
                this.initDataHistory();
                for (var i = 0; i < ig.game.maxCellsMulti; i++) {
                    this.data.pixels[i] = this.getPixelMap();
                }
            }
    
            this.data.type = type;

            var newSize = this.types[this.data.type].tileSize;
            this.initSettingValues();
            if (newSize) {
                this.tileWidth = newSize.width;
                this.tileHeight = newSize.height;
                this.initAreas();
            }
    
            if ( !newSize || (oldSize.width != newSize.width || oldSize.height != newSize.height) ) {
                this.initDataHistory();
                var clearBothCells = true;
                this.clearImage(true, false, clearBothCells);
                this.recordDataHistory();
            }
    
            var nameLabel = 'Name...';
            if (this.data.type == 'motion') {
                nameLabel = 'Trigger by [/]name';
                jQuery('#' + this.inputBoxId).addClass('verbosePlaceholder');
            }
            else if (this.data.type == 'interactingMotion') {
                nameLabel = 'Trigger by [/]name';
                jQuery('#' + this.inputBoxId).addClass('verbosePlaceholder');
            }
            else {
                jQuery('#' + this.inputBoxId).removeClass('verbosePlaceholder');
            }
            jQuery('#' + this.inputBoxId).attr('placeholder', nameLabel);
    
            this.addTemplateIfNeeded();
            this.loadMusicIntoPropertyIfNeeded();
            this.loadMusicIntoMusicSheetCanvasIfNeeded();
            this.updateAll();
    
            if (type == 'thrower') { this.data.direction = this.multiDirectionMax - 1; }
    
            this.setToDefaultAttributeIfNeeded();
    
            this.pasteCanvasSnapshot();
            this.handleUserScriptEditorShowingAndGeneralPositioning();

            switch (type) {
                case 'mift':
                    if ( !(ig.game.hasMinfinity && this.alertedToWhyMiftsAreFree) ) {
                        var message = '<p>Mifts are message gifts you can send to friends.</p>';
                        if (ig.game.hasMinfinity) {
                            message += '<p>As you have Manyland Minfinity, you can give Mifts for free.</p>';
                            this.alertedToWhyMiftsAreFree = true;
                        }
                        else {
                            message += '<p>They cost $1 and help finance Manyland ';
                            message += '<br/>(you can give them for free with <a href="javascript:ig.game.iapDialogManager.openMainDialog()">Minfinity</a>).</p>';
                        }
                        message += '<p>Thank you!</p>';
                        ig.game.alertDialog.open(message, true);
                    }
                    break;
             
                case 'writable':
                    if (ig.game.isEditorHere && ig.game.areaProtection == 'INDIVIDUALS') {
                        this.openWritableSettingsDialog();
                    }
                    else {
                        var message = 'Writable rights are tied to the area they are created in. Please first go to an area where you are listed as editor.';
                        ig.game.alertDialog.open(message);
                        setTimeout( function() { ig.game.painter.setToType('readable'); }, 50 );
                    }
                    break;
            }
        }
        
        this.removeLivePreviewEntities();
        
        if (clearThingReferences) {
            if (this.thingReferencesDialog) {
                this.closeAndSaveThingReferencesDialogIfNeeded();
                this.thingReferencesDialog.data = [];
            }
            if (this.data && this.data.prop) { this.data.prop.thingRefs = []; }
        }
    },

    openWritableSettingsDialog: function() {
        var html = '';
        
        html += '<div style="margin-left: 10px">';
        
        html += '<p style="text-align: left">This Writable will be tied to the editor list for ' + ig.game.areaGroupName + ':</p>';
        
        var rights = [
            'Editors can remove, lock, clarify and stickify',
            'Only editors can add threads',
            'Only editors can add comments',
            'Only editors can read'
        ];
        html += '<div style="text-align: left; background-color: rgb(180,180,180); padding: 9px; text-transform: uppercase; width: 95%; border-radius: 5px">';
        for (var i = 0; i < rights.length; i++) {
            var sSelected = i == this.writableRightsSetting ? ' checked="checked"' : '';
            html += '<div style="margin-bottom: 9px">';
            html += '<input type="radio" name="radioButton" value="' + i + '" id="writableSetting' + i + '"' + sSelected + '/> ';
            html += '<label for="writableSetting' + i + '">' + ig.game.strings.htmlEscape( rights[i] );
            if (i >= 1) {
                html += ' <span style="opacity: .6">(includes all of above)</span>';
            }
            html += '</label>';
            html += '</div>';
        }
        html += '</div>';
        
        html += '</div>';
        
        ig.game.alertDialog.open(html, true,
            function() {
                var radioValue = jQuery('input[name=radioButton]:checked').val();
                ig.game.painter.writableRightsSetting = radioValue;
                ig.game.sounds.success.play();
            });
    },

    handleUserScriptEditorShowingAndGeneralPositioning: function() {
        if (this.data.type == 'changer') {
            if (this.data.prop.textData) {
                if (ig.game.userScriptEditor) {
                    ig.game.userScriptEditor.open(this.data.prop.textData, this, false, false);
                }
            }
            else {
                var self = this;
                ig.game.httpApi.getUserScriptEditorData_P().done(function(data){
                    if (ig.game.userScriptEditor) {
                        var code = data.contents ? data.contents : '';
                        ig.game.userScriptEditor.open(code, self, undefined, false);
                    }
                });
            }
            
            var x = 30;
            jQuery('#painter').css('left', x + 'px');
            this.removeInputBox();
            this.addInputBox();
        }
        else if (this.data.type == 'farBack') {
            var gameCanvas = jQuery('#' + ig.game.canvasId);
            var gameCanvasPos = gameCanvas.position();
            var gameCanvasWidth = gameCanvas.width();
            var x = gameCanvasPos.left + gameCanvasWidth - ( (this.painterCanvasSize.x + 65 ) * ig.system.scale );

            jQuery('#painter').css('left', x + 'px');

            if (ig.game.userScriptEditor && ig.game.userScriptEditor.isOpen) {
                ig.game.userScriptEditor.close();
            }
            this.removeInputBox();
            this.addInputBox();
        }
        else {
            this.resetPosition();
            if (ig.game.userScriptEditor && ig.game.userScriptEditor.isOpen) { ig.game.userScriptEditor.close(); }
            this.removeInputBox();
            this.addInputBox();
        }
    },
    
    resetPosition: function() {
        var gameCanvas = jQuery('#' + ig.game.canvasId);
        var gameCanvasPos = gameCanvas.position();
        var gameCanvasWidth = gameCanvas.width();
        var x = gameCanvasPos.left + gameCanvasWidth / 2 - (this.painterCanvasSize.x * ig.system.scale) / 2;
        jQuery('#painter').css('left', x + 'px');
    },

    initCanvasSnapshot: function() {
        var maxCellsToCoverAllTypes = ig.game.maxCellsMulti;
        var maxSizeToCoverAllTypes = {x: ig.game.tileSizeBig * 2, y: ig.game.tileSizeBig * 2};
        this.canvasSnapshot = [];
        for (var i = 0; i < maxCellsToCoverAllTypes; i++) {
            this.canvasSnapshot[i] = this.getPixelMap(maxSizeToCoverAllTypes.x, maxSizeToCoverAllTypes.y);
        }
    },

    takeCanvasSnapshot: function() {
        if (this.data && this.data.pixels && this.canvasSnapshot) {
            for (var cell = 0; cell < this.data.pixels.length; cell++) {
                for (var x = 0; x < this.data.pixels[0].length; x++) {
                    for (var y = 0; y < this.data.pixels[0].length; y++) {
                        if (this.data.pixels[cell] && this.data.pixels[cell][x] &&
                                this.data.pixels[cell][x][y] !== undefined && this.data.pixels[cell][x][y] !== null) {
                            this.canvasSnapshot[cell][x][y] = this.data.pixels[cell][x][y];
                        }
                    }
                }
            }
        }
    },

    pasteCanvasSnapshot: function() {
        if (this.data && this.data.pixels && this.canvasSnapshot) {
            for (var cell = 0; cell < this.data.pixels.length; cell++) {
                for (var x = 0; x < this.data.pixels[0].length; x++) {
                    for (var y = 0; y < this.data.pixels[0].length; y++) {
                        if (this.data.pixels[cell] && this.data.pixels[cell][x] &&
                                this.data.pixels[cell][x][y] !== undefined && this.data.pixels[cell][x][y] !== null) {
                            if (this.data.pixels[cell][x][y] == this.transparentIndex) {
                                this.data.pixels[cell][x][y] = this.canvasSnapshot[cell][x][y];
                            }
                        }
                    }
                }
            }
        }
    },

    setToDefaultAttributeIfNeeded: function() {
        if (!this.data.prop) { this.data.prop = {}; }
        if (!this.data.prop.attributes) { this.data.prop.attributes = []; }

        if ( this.data.prop.attributes.length == 0 &&
                this.data.type && ig.game.attributesManager.info[ this.types[this.data.type].key ] &&
                ig.game.attributesManager.getIsTypeWithSingleAttribute( this.types[this.data.type].key ) ) {
            this.data.prop.attributes = [];
            var infos = ig.game.attributesManager.info[ this.types[this.data.type].key ];
            for (var attribute in infos) {
                this.data.prop.attributes.push(attribute);
                break;
            }
        }
    },

    loadMusicIntoPropertyIfNeeded: function() {
        // may contain racing issue
        if (this.data.type == 'music' && this.data.prop && !this.data.prop.musicData &&
                ig.game.musicManager && ig.game.musicManager.data && !ig.game.musicManager.dataSourceId) {
            if (this.data.prop) { this.data.prop = {}; }
            this.data.prop.musicData = ig.game.cloneObject(ig.game.musicManager.data);
        }
    },

    loadMusicIntoMusicSheetCanvasIfNeeded: function() {
        if (this.data.type == 'musicSheet' &&
                ig.game.musicManager && ig.game.musicManager.data && !ig.game.musicManager.dataSourceId) {
            var data = ig.game.musicManager.data;
            var instrument;
            if      (data.piano)         { instrument = 'piano';         colorIndex = 0; }
            else if (data.classic_piano) { instrument = 'classic_piano'; colorIndex = 1; }
            else if (data.bell)          { instrument = 'bell';          colorIndex = 2; }

            if (instrument) {

                var melody = instrument ? data[instrument] : null;
                if (melody && this.selectedCell === 0 &&
                        this.data.pixels && this.data.pixels[this.selectedCell] && this.data.pixels[this.selectedCell][0]) {
                    for (var timeMarker in melody) {
                        var timeMS = parseFloat( ig.game.strings.replaceAll(timeMarker, '_', '.') ) * 1000;
                        var x = Math.round(timeMS / this.noteDelayMSDefault);
                        if (x < this.tileWidth) {
                        
                            var notes = (typeof melody[timeMarker]) == 'object' ? melody[timeMarker] : [ melody[timeMarker] ];
                            for (var i = 0; i < notes.length; i++) {
                                var octaveAndNote = notes[i];
                                if (octaveAndNote.length == 2) {
                                    var octave = octaveAndNote[0];
                                    var note = octaveAndNote[1];
                                    var y = this.tileHeight - 1 -
                                            ( (octave - 2) * ig.game.sounds.tones.length + ig.game.sounds.tones.indexOf(note) );
                                    if (y >= 0 && y <= this.tileHeight) {
                                        this.data.pixels[this.selectedCell][x][y] = colorIndex;
                                    }
                                }
                            }

                        }
                    } 
                }
                
            }
        }
    },

    informAboutMissingMusicData: function() {
        var rect = {x1: this.areas.drawingOffset.x1,
                    y1: this.areas.drawingOffset.y1,
                    width: this.tileWidth * this.drawingZoom,
                    height: this.tileHeight * this.drawingZoom};
        this.context.fillStyle = 'rgba(0,0,0,1)';
        this.context.textAlign = 'center';
        this.fillText( "First pick an instrument".toUpperCase(),
                rect.x1 + rect.width / 2,
                rect.y1 + rect.height / 2 + this.fontOffsetY - 1 - 3 );
        this.fillText( "and play music".toUpperCase(),
                rect.x1 + rect.width / 2,
                rect.y1 + rect.height / 2 + this.fontOffsetY - 1 + 5 );
        this.context.textAlign = 'left';
    },

    getTypeByIndex: function(index) {
        var type = null, i = 0;
        for (var thisType in this.types) {
            var moderatorsOnly = this.types[thisType].rankNeeded && this.types[thisType].rankNeeded == this.moderatorRank;
            var isModerator = ig.game.ourPlayer.rank == this.moderatorRank;
            if (i == index && !this.types[thisType].parent && !(moderatorsOnly && !isModerator) ) {
                type = thisType;
                break;
            }
            if (!this.types[thisType].parent) { i++; }
        }
        return type;
    },

    getAttributeByIndex: function(index) {
        var attribute = null, i = 0;
        var attributes = ig.game.attributesManager.info[ this.types[this.data.type].key ];
        for (var thisAttribute in attributes) {
            var info = attributes[thisAttribute];
            if ( i == index && (!info.rankNeeded || ig.game.ourPlayer.rank >= info.rankNeeded) ) {
                attribute = thisAttribute;
                break;
            }
            i++;
        }
        return attribute;
    },

    getTypeIndex: function(typeToFind) {
        var i = 0;
        for (var thisType in this.types) {
            if (thisType == typeToFind) { break; }
            if (!this.types[thisType].parent) { i++; }
        }
        return i;
    },

    getAttributesIndex: function(attributeToFind) {
        var i = 0;
        for (var thisAttribute in ig.game.attributesManager.info[ this.types[this.data.type].key ]) {
            if (thisAttribute == attributeToFind) { break; }
            i++;
        }
        return i;
    },

    getTypeCount: function() {
        var count = 0;
        for (var thisType in this.types) { count++; }
        return count;
    },

    getAttributesCount: function() {
        var count = 0;
        for (var thisAttributes in ig.game.attributesManager.info[ this.types[this.data.type].key ]) { count++; }
        return count;
    },

    pointIsInRectangle: function(x, y, rect) {
        return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
    },

    pointIsInWidthHeightRectangle: function(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    },

    updateBasedOnCursorInPickColorMode: function() {
        if (this.colorPickerType == 'a') { this.updateBasedOnCursorInPickColorMode_typeA(); }
        else { this.updateBasedOnCursorInPickColorMode_typeB(); }
    },

    updateBasedOnCursorUpInPickColorMode: function() {
        if (this.colorPickerType == 'a') {
        }
        else {
            this.updateBasedOnCursorUpInPickColorMode_typeB();
            ig.game.achievementManager.register(ig.game.achievementManager.types.USED_ALTERNATIVE_COLORS_VIEW);
        }
        this.updateLivePreview();
    },

    updateBasedOnCursorInPickColorMode_typeB: function() {
        var x = this.cursorX, y = this.cursorY;
        if ( this.pointIsInRectangle(x, y, this.areas.colorPickerB_base) ) {
            var xOff = null;
            if (x > this.areas.colorPickerB_base.x2 - 4) { xOff = -4; }
            this.colorPickerB.rgbaBase = this.getRgbaAtCursor(xOff, null);
            this.colorPickerB.baseY = y;
            this.updateColorPickNextTime = true;
            this.updateColorPickerPreview( this.data.colors[this.selectedColor] );
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPickerB_tintOff) ) {
            this.colorPickerB.rgbaTint = null;
            this.colorPickerB.tintX = null;
            this.updateColorPickNextTime = true;
            this.updateColorPickerPreview( this.data.colors[this.selectedColor] );
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPickerB_tint) ) {
            var yOff = null;
            if (y < this.areas.colorPickerB_tint.y1 + 3) { yOff = 3; }
            this.colorPickerB.rgbaTint = this.getRgbaAtCursor(null, yOff);
            this.colorPickerB.tintX = x;
            this.updateColorPickNextTime = true;
            this.updateColorPickerPreview( this.data.colors[this.selectedColor] );
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPickerB_main) ) {
            this.updateColorPickerPreview( this.getRgbaAtCursor() );
        }
        else {
            this.updateColorPickerPreview( this.data.colors[this.selectedColor] );
        }

        if (this.updateColorPickNextTime) {
            this.updateColorPickNextTime = false;
            this.drawColorPickerB_main();
        }
    },

    reduceLengthOfPositionOnPickerTypeBArrayIfNeeded: function() {
        // for (var key in ...
    },

    getRgbaAtCursor: function(xOff, yOff) {
        if (xOff == null || xOff == undefined) { xOff = 0; }
        if (yOff == null || yOff == undefined) { yOff = 0; }
        var rgbArray = this.getImageDataPixel(this.cursorX + xOff, this.cursorY + yOff).data;
        return {r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], alpha: 1};
    },

    getRgbaAt: function(x, y) {
        var rgbArray = this.getImageDataPixel(x, y).data;
        return {r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], alpha: 1};
    },

    updateBasedOnCursorUpInPickColorMode_typeB: function() {
        var x = this.cursorX, y = this.cursorY;
        if (this.cursorWasUpSinceMode && this.pointIsInRectangle(x, y, this.areas.colorPickerB_main) ) {
            this.data.colors[this.selectedColor] = this.getRgbaAtCursor();
            this.updateColorPickNextTime = true;
            this.updatePositionOnPickerTypeB(x, y);
            this.hideSubDialog();
            ig.game.sounds.click.play();
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPickerTypeToggler) ) {
            this.toggleColorPickerType();
        }
        else if ( this.pointIsInRectangle(x, y, this.areas.colorPickerCloseButton) ||
            !this.pointIsInRectangle(x, y, this.areas.colorPickerDialog) ) {
            this.hideSubDialog();
            ig.game.sounds.click.play();
        }
    },

    drawColorPickerB_main: function() {
        this.drawImage( 'colorPicker_type' + this.colorPickerType.toUpperCase(), this.areas.colorPickerDialog.x1, this.areas.colorPickerDialog.y1 );
        if (!this.colorPickerB.rgbaBase) { this.colorPickerB.rgbaBase = {r: 0, g: 255, b: 244, alpha: 1}; }

        var rect = this.areas.colorPickerB_main;
        var rgbaBaseString = this.getRgbaString(this.colorPickerB.rgbaBase);

        this.context.fillStyle = rgbaBaseString;
        this.fillRect(rect.x1, rect.y1, rect.width, rect.height);

        var gradient = this.context.createLinearGradient(0, 0, rect.width * this.pageZoom, 0);
        gradient.addColorStop(.1, 'rgba(255,255,255,1)');
        gradient.addColorStop(.8, 'rgba(255,255,255,0)');
        this.context.fillStyle = gradient;
        this.fillRect(rect.x1, rect.y1, rect.width, rect.height);

        gradient = this.context.createLinearGradient(0, 0, 0, rect.height * this.pageZoom);
        gradient.addColorStop(.2, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        this.context.fillStyle = gradient;
        this.fillRect(rect.x1, rect.y1, rect.width, rect.height);

        if (this.colorPickerB.rgbaTint) {
            this.context.globalCompositeOperation = 'lighter';
            var rgbaTint = ig.game.cloneObject(this.colorPickerB.rgbaTint);
            rgbaTint.alpha = .15;
            this.context.fillStyle = this.getRgbaString(rgbaTint);
            this.fillRect(rect.x1, rect.y1, rect.width, rect.height);
            this.context.globalCompositeOperation = 'source-over';
        }

        if (!this.colorPickerB.tintX) {
            this.colorPickerB.tintX = this.areas.colorPickerB_tintOff.x1;
        }
        this.context.fillStyle = 'rgba(255,255,255,1)';
        this.fillRect(this.colorPickerB.tintX, this.areas.colorPickerB_tint.y1 - 1, 1, 3);

        if (!this.colorPickerB.baseY) {
            this.colorPickerB.baseY = Math.round(this.areas.colorPickerB_base.y1 + this.areas.colorPickerB_base.height / 2);
        }
        this.context.fillStyle = 'rgba(255,255,255,1)';
        this.fillRect(this.areas.colorPickerB_base.x2 - 3, this.colorPickerB.baseY, 4, 1);
    },

    updatePositionOnPickerTypeB: function(x, y) {
        var key = this.getPositionOnPickerTypeBKey();
        if (key) {
            this.positionOnPickerTypeB[key] = { x: x, y: y, pickerData: ig.game.cloneObject(this.colorPickerB) };
        }
    },

    getPositionOnPickerTypeBKey: function() {
        var key = null;
        if (this.selectedColor != undefined && this.selectedColor != null) {
            var rgba = this.data.colors[this.selectedColor];
            if (rgba) { key = [this.selectedColor, rgba.r, rgba.g, rgba.b].join('_'); }
        }
        return key;
    },

    showPositionOnColorPickerTypeB: function() {
        var key = this.getPositionOnPickerTypeBKey();
        if (key && this.positionOnPickerTypeB[key]) {
            var pos = this.positionOnPickerTypeB[key];
            var size = 2;
            this.context.fillStyle = 'rgba(0,0,0,.75)';
            this.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
        }
    },

    updateBasedOnCursorInPickColorMode_typeA: function() {
        var x = this.cursorX, y = this.cursorY;
        var isInCloseButtonArea = this.pointIsInRectangle(x, y, this.areas.colorPickerCloseButton);
        var isInColorPickArea = !isInCloseButtonArea && this.pointIsInRectangle(x, y, this.areas.colorPickerDialogInner);

        var rgbArray = this.getImageDataPixel(x, y).data;
        var rgba = {r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], alpha: 1};

        if (this.cursorIsDown && this.cursorWasUpSinceMode) {
            if ( this.pointIsInRectangle(x, y, this.areas.colorPickerTypeToggler) ) {
                this.toggleColorPickerType();
            }
            else if (isInCloseButtonArea) {
                this.hideSubDialog();
                ig.game.sounds.click.play();
            }
            else if (isInColorPickArea) {
                this.data.colors[this.selectedColor] = rgba;
                this.positionOnPicker[this.selectedColor] = {x: x, y: y};
                this.hideSubDialog();
                ig.game.sounds.click.play();
            }
            else if (!isInCloseButtonArea && !isInColorPickArea) {
                this.hideSubDialog();
                ig.game.sounds.click.play();
            }
        }
        else if (isInColorPickArea) {
            this.updateColorPickerPreview(rgba);
        }
        else {
            this.updateColorPickerPreview(this.data.colors[this.selectedColor]);
        }
    },

    updateBasedOnCursorUpInMenuMode: function() {
        var x = this.cursorX, y = this.cursorY;
        var isInCloseButtonArea = this.pointIsInRectangle(x, y, this.areas.menuButton);
        var isInMenuArea = !isInCloseButtonArea && this.pointIsInRectangle(x, y, this.areas.menu);

        if ( this.cursorWasUpSinceMode && (isInCloseButtonArea || !isInMenuArea) ) {
            this.hideSubDialog();
        }
        else if (isInMenuArea) {
            var menuEntries = [
                    'undo|redo',
                    'cloneOld',
                    'toggleDrawSymmetric|toggleShowGrid',
                    'changeColor|changeColorSingle|rgbAsText',
                    'mirror|flip|rotate',
                    (ig.ua.mobile || ig.ua.mac ? 'moveLeft|moveRight|moveUp|moveDown' : 'move|line|overdraw'),
                    'lowerColorOpacity',
                    'brushType0|brushType1|brushType2|brushType3|brushType4',
                    'addRemoveSound',
                    'copy|paste',
                    'clearCanvas|clearAll'
                    ];
            var menuEntryHeight = (this.areas.menu.y2 - this.areas.menu.y1) / menuEntries.length;
            var menuEntryIndex = parseInt( (y - this.areas.menu.y1) / menuEntryHeight );
            var menuEntry = menuEntries[menuEntryIndex];

            switch(menuEntry) {

                case 'undo|redo':
                    switch ( this.getCommandFromMenu(menuEntry, x, [this.areas.menu.width / 2]) ) {
                        case 'undo': this.undoDataHistory(); break;
                        case 'redo': this.redoDataHistory(); break;
                    }
                    this.hideSubDialog();
                    this.update();
                    break;

                case 'cloneOld':
                    this.hideSubDialog();
                    this.update();
                    ig.game.sounds.click.play();
                    this.showCloneOld();
                    break;

                case 'toggleDrawSymmetric|toggleShowGrid':
                    var item = this.getCommandFromMenu(menuEntry, x, [this.areas.menu.width * .5, this.areas.menu.width * .5]);
                    if (item == 'toggleDrawSymmetric') {
                        this.drawSymmetric = !this.drawSymmetric;
                        this.hideSubDialog();
                        this.update();
                    }
                    else {
                        this.toggleShowGrid();
                    }
                    break;

                case 'changeColor|changeColorSingle|rgbAsText':
                    var item = this.getCommandFromMenu(menuEntry, x, [this.areas.menu.width * .33, this.areas.menu.width * .66]);
                    if (item == 'rgbAsText') {
                        this.handleRgbAsTextInput();
                    }
                    else {
                        switch (item) {
                            case 'changeColor': this.singleColorIndexToChange = null; break;
                            case 'changeColorSingle': this.singleColorIndexToChange = this.selectedColor; break;
                        }
                        this.colorsBeforeColorChanges = this.cloneColors(this.data.colors);
                        this.hideInputBox();
                        this.hideSubDialog();
                        this.mode = 'changeColor';
                        this.update();
                        this.updateChangeColorDialog();
                    }
                    break;

                case 'mirror|flip|rotate':
                    var separators = [this.areas.mirrorFlipRotateSeparator1.x1, this.areas.mirrorFlipRotateSeparator2.x1];
                    switch ( this.getCommandFromMenu(menuEntry, x, separators) ) {
                        case 'mirror': this.data.pixels[this.selectedCell] = this.clonePixelsMirrorX(this.data.pixels[this.selectedCell]); break;
                        case 'flip': this.data.pixels[this.selectedCell] = this.clonePixelsMirrorY(this.data.pixels[this.selectedCell]); break;
                        case 'rotate': this.data.pixels[this.selectedCell] = this.clonePixelsRotateRight(this.data.pixels[this.selectedCell]); break;
                    }
                    this.recordDataHistory();
                    ig.game.sounds.click.play();
                    this.update();
                    break;

                case 'move|line|overdraw':
                    var separators = [this.areas.mirrorFlipRotateSeparator1.x1, this.areas.mirrorFlipRotateSeparator2.x1];
                    switch ( this.getCommandFromMenu(menuEntry, x, separators) ) {
                        case 'move':
                            ig.game.alertDialog.openSmall('move the creation using ctrl+arrow keys. extend or shorten it by using ctrl+shift+arrow keys.');
                            break;
                        case 'line':
                            ig.game.alertDialog.openSmall('draw lines by holding down the "a" key.');
                            break;
                        case 'overdraw':
                            ig.game.alertDialog.openSmall('holding down shift allows to only draw over the context color. you can set a color to be the context by ctrl-right-clicking it. (Reversely, holding shift while right-clicking only draws over the main color.)');
                            break;
                    }
                    ig.game.sounds.click.play();
                    break;

                case 'moveLeft|moveRight|moveUp|moveDown':
                    var partWidth = this.areas.menu.width / 4 - 3;
                    var separators = [
                            this.areas.menu.x1 + partWidth * 1 - 2,
                            this.areas.menu.x1 + partWidth * 2,
                            this.areas.menu.x1 + partWidth * 3];
                    switch ( this.getCommandFromMenu(menuEntry, x, separators) ) {
                        case 'moveLeft':  this.movePixels(-1, 0); break;
                        case 'moveRight': this.movePixels(1, 0); break;
                        case 'moveUp':    this.movePixels(0, -1); break;
                        case 'moveDown':  this.movePixels(0, 1); break;
                    }
                    this.recordDataHistory();
                    ig.game.sounds.click.play();
                    this.update();
                    break;

                case 'move':
                    this.drawImage('moveShortcutHi', this.areas.menu.x1 + 51, this.areas.menu.y1 + 58);
                    ig.game.sounds.click.play();
                    this.update();
                    break;
                    
                case 'brushType0|brushType1|brushType2|brushType3|brushType4':
                    var offX = 32, partWidth = 15;
                    var separators = [
                            this.areas.menu.x1 + offX,
                            this.areas.menu.x1 + offX + partWidth * 1,
                            this.areas.menu.x1 + offX + partWidth * 2,
                            this.areas.menu.x1 + offX + partWidth * 3,
                            this.areas.menu.x1 + offX + partWidth * 4,
                            ];
                    var brushTypeString = this.getCommandFromMenu(menuEntry, x, separators);
                    this.brushType = parseInt( ig.game.strings.replaceAll(brushTypeString, 'brushType', '') );
                    
                    ig.game.sounds.click.play();
                    this.hideSubDialog();
                    break;

                case 'lowerColorOpacity':
                    this.hideSubDialog();
                    this.lowerColorOpacity();
                    ig.game.sounds.click.play();
                    break;

                case 'addRemoveSound':
                    this.handleAddRemoveSound();
                    ig.game.sounds.click.play();
                    break;

                case 'copy|paste':
                    switch ( this.getCommandFromMenu(menuEntry, x, [this.areas.menu.width / 2]) ) {
                        case 'copy': this.copyToClipboard(); break;
                        case 'paste': this.pasteFromClipboard(); break;
                    }
                    this.hideSubDialog();
                    this.update();
                    break;

                case 'clearCanvas|clearAll':
                    var clearAll = this.getCommandFromMenu(menuEntry, x, [this.areas.menu.width / 2]) == 'clearAll';
                    this.hideSubDialog();
                    this.clearImage(true, clearAll);
                    this.recordDataHistory();
                    break;
            }
        }
    },

    handleSetMotion: function() {
        if (!ig.game.ourPlayer.currentMotion) {
            var isSmall = true;
            ig.game.alertDialog.openPrompt('Do a motion:', localStorage.motion_while_creating,
                    ig.game.painter.setAndTriggerMotion,
                    null, null, null, null, null, null, isSmall);
        }
    },
    
    setAndTriggerMotion: function(motion) {
        if (motion) {
            motion = String(motion).trim();
            ig.game.localStorageManager.setItem('motion_while_creating', motion)
            ig.game.motionDialog.checkTriggerBySpeech(motion);
        }
        else {
            delete localStorage.motion_while_creating;
        }
    },

    handleAddRemoveSound: function() {
        this.hideSubDialog();
        this.update();

        if ( this.data.type && this.typesWithSoundId.indexOf(this.types[this.data.type].key) >= 0 ) {
            if (this.data.prop.soundId) {
                this.data.prop.soundId = null;
                ig.game.sounds.bin.play();
            }
            else {
                ig.game.alertDialog.open( '<p>Now pick a Sound from the right (<a href="/info-tips#addingSound" target="_blank">more info</a>...)</p>', true );
                ig.game.alertDialog.contextId = 'pickSoundId';
            }
        }
        else {
            ig.game.alertDialog.open( '<p>You can only add sound for <a href="/info-tips#addingSound" target="_blank">certain types</a>...</p>', true );
            ig.game.sounds.nocando.play();
        }
    },

    getCommandFromMenu: function(subMenus, x, separatorsX) {
        var subMenus = subMenus.split('|');
        var subMenuIndex = 0;
        for (var n = 0; n < separatorsX.length; n++) {
            if (x > this.areas.menu.x1 + separatorsX[n]) { subMenuIndex++ };
        }
        return (subMenus[subMenuIndex]);
    },

    clearImage: function(clearCanvas, clearPalette, clearAllCells) {
        if (clearCanvas) {
            if (clearAllCells) {
                for (var i = 0; i < this.maxCells; i++) {
                    this.data.pixels[i] = this.getPixelMap();
                }
            }
            else {
                this.data.pixels[this.selectedCell] = this.getPixelMap();
            }
        }
        if (clearPalette) {
            this.data = this.getEmptyTileData(); // this action does more than the clearPalette name suggests,
                                                 // check into replacing with this.data.colors = this.getDefaultColors()
            this.selectedColor = 0;
            this.selectedCell = 0;
            this.positionOnPicker = [];
        }
        this.updateAll();
    },

    showCloneOld: function() {
        this.mode = 'cloneOld';
        ig.game.alertDialog.open('Now pick a creation from the right (or drag and drop it on the Create tab selector or Create button next time).');
    },

    clonePixelsRotateLeft: function(pixelsToClone) {
        var pixels = this.clonePixelsOfCell(pixelsToClone);
        var max = this.tileWidth;
        for (var i = 0; i < max; i++) {
            for (var j = 0; j < max; j++) {
                pixels[i][j] = pixelsToClone[max - j - 1][i];
            }
        }
        return pixels;
    },

    clonePixelsRotateRight: function(pixelsToClone) {
        var pixels = this.clonePixelsOfCell(pixelsToClone);
        for (var i = 0; i < this.directionMax - 1; i++) { pixels = this.clonePixelsRotateLeft(pixels); }
        return pixels;
    },

    initDataHistory: function() {
        this.dataHistory = [];
        this.recordDataHistory(true);
    },

    recordDataHistory: function(forced) {
        var currentData = ig.game.cloneObject(this.data);
        if ( forced || this.dataChanged(this.dataHistory[this.dataHistoryIndex], currentData) ) {
            
            if (this.dataHistoryIndex < this.dataHistory.length - 1) {
                this.dataHistory.splice(this.dataHistoryIndex + 1);
            }

            this.dataHistory.push( ig.game.cloneObject(this.data) );
            
            if (this.dataHistory.length > this.dataHistoryMax) {
                this.dataHistory.shift();
            }
            
            this.dataHistoryIndex = this.dataHistory.length - 1;            

            this.saveDataEmergencyBackup();
        }
    },

    undoDataHistory: function() {
        if (this.dataHistoryIndex > 0) {
            this.dataHistoryIndex--;
            this.updateToCurrentDataHistory();
        }
    },

    redoDataHistory: function() {
        if (this.dataHistoryIndex < this.dataHistory.length - 1) {
            this.dataHistoryIndex++;
            this.updateToCurrentDataHistory();
        }
    },
    
    updateToCurrentDataHistory: function() {
        var cloneData = ig.game.cloneObject(this.dataHistory[this.dataHistoryIndex]);
        this.data.colors = cloneData.colors;
        this.data.pixels[this.selectedCell] = cloneData.pixels[this.selectedCell];
    },

    dataChanged: function(a, b) {
        var changed = false;
        if (a && b && a.pixels && b.pixels && a.pixels[this.selectedCell] && b.pixels[this.selectedCell]) {
            for (var x = 0; x < this.tileWidth && !changed; x++) {
                for (var y = 0; y < this.tileHeight && !changed; y++) {
                    if (a.pixels[this.selectedCell][x] == undefined && b.pixels[this.selectedCell][x]) {
                        changed = true;
                    }
                    else if (a.pixels[this.selectedCell][x][y] == undefined &&
                            ( b.pixels[this.selectedCell][x] && b.pixels[this.selectedCell][x][y] ) ) {
                        changed = true;
                    }
                    else {
                        changed =
                                a.pixels[this.selectedCell] && a.pixels[this.selectedCell][x] && a.pixels[this.selectedCell][x][y] !== undefined && a.pixels[this.selectedCell][x][y] !== null &&
                                b.pixels[this.selectedCell] && b.pixels[this.selectedCell][x] && b.pixels[this.selectedCell][x][y] !== undefined && b.pixels[this.selectedCell][x][y] !== null &&
                                a.pixels[this.selectedCell][x][y] != b.pixels[this.selectedCell][x][y];
                    }
                }
            }
            for (var i = 0; i < this.maxColors && !changed; i++) {
                changed = JSON.stringify(a.colors[i]) != JSON.stringify(b.colors[i]);
            }
        }
        return changed;
    },

    cloneColors: function(colorsToClone) {
        var colors = [];
        for (var i = 0; i < this.maxColors; i++) {
            if (colorsToClone && colorsToClone[i]) {
                colors[i] = colorsToClone[i];
            }
        }
        return colors;
    },

    clonePixels: function(pixelsToClone) {
        var pixels = [];
        for (var cell = 0; cell < this.maxCells; cell++) {
            pixels[cell] = this.clonePixelsOfCell(pixelsToClone[cell]);
        }
        return pixels;
    },

    clonePixelsOfCell: function(pixelsOfCellToClone) {
        var pixelsOfCell = [];
        if (pixelsOfCellToClone) {
            for (var x = 0; x < pixelsOfCellToClone.length; x++) {
                pixelsOfCell[x] = [];
                for (var y = 0; y < pixelsOfCellToClone[0].length; y++) {
                    if (pixelsOfCellToClone[x] && pixelsOfCellToClone[x][y] != null && pixelsOfCellToClone[x][y] != undefined) {
                        pixelsOfCell[x][y] = pixelsOfCellToClone[x][y];
                    }
                    else {
                        pixelsOfCell[x][y] = this.transparentIndex;
                    }
                }
            }
        }
        return pixelsOfCell;
    },

    toggleColorPickerType: function() {
        this.colorPickerType = this.colorPickerType == 'a' ? 'b' : 'a';
        ig.game.localStorageManager.setItem('colorPickerType', this.colorPickerType);
        this.hideSubDialog();
        this.showColorPicker();
        ig.game.sounds.click.play();
    },

    showColorPicker: function(event) {
        this.stopPlayMusicSheet();

        this.mode = 'pickColor';
        this.drawImage( 'colorPicker_type' + this.colorPickerType.toUpperCase(), this.areas.colorPickerDialog.x1, this.areas.colorPickerDialog.y1 );
        this.updateColorPickerPreview( {r: 0, g: 0, b: 0, alpha: 1} );
        if (this.colorPickerType == 'a') {
            this.showPositionOnColorPicker();
        }
        else {
            var key = this.getPositionOnPickerTypeBKey();
            if (key && this.positionOnPickerTypeB[key]) {
                var pos = this.positionOnPickerTypeB[key];
                this.colorPickerB = ig.game.cloneObject(pos.pickerData);
                this.drawColorPickerB_main();
                this.showPositionOnColorPickerTypeB();
                this.updateColorPickNextTime = false;
            }
            else {
                this.drawColorPickerB_main();
                this.updateColorPickNextTime = false;
            }
        }
    },

    showTypePicker: function(event) {
        this.stopPlayMusicSheet();
        if (this.timeouts.drawBig) { clearTimeout(this.timeouts.drawBig); }

        this.mode = 'pickType';
        this.drawImage('typePicker', this.areas.typePicker.x1, this.areas.typePicker.y1);
        if (this.data.type != null) {
            var type = this.types[this.data.type].parent ? this.types[this.data.type].parent : this.data.type;
            var rect = this.getRectangleOnTypePicker(type);
            this.context.fillStyle = this.getRgbaString( {r: 143, g: 235, b: 109, alpha: 1} );
            this.fillRect(rect.x, rect.y, rect.width, rect.height);
        }

        this.context.font = this.defaultFont;

        var rowCount = 0;
        for (var type in this.types) {
            if (!this.types[type].parent) {
                rowCount++;
                var rect = this.getRectangleOnTypePicker(type);
    
                var text = this.types[type].title.toUpperCase();
                this.context.fillStyle = 'rgba(48,48,48,1)';
                this.fillText( text,
                        rect.x + this.areas.typePickerSingleSelection.x1,
                        rect.y + this.areas.typePickerSingleSelection.y1 + parseInt(rect.height / 2) + this.fontOffsetY - 1);

                if (this.types[type].iconRow) {
                    this.drawImage('typeIcon_' + type, rect.x + rect.width - this.areas.typeIcon.width - 1, rect.y);
                }
            }
        }

        if (!ig.ua.mobile && ig.game.ourPlayer.rank >= 2) {
            var footnote = 'search = ctrl+f'.toUpperCase();;
            this.context.fillStyle = 'rgba(255,255,255,0.25)';
            this.fillText(footnote, this.areas.typePicker.x1 + 52, this.areas.typePicker.y1 + 8);
        }
    },

    showAttributesPicker: function() {
        this.stopPlayMusicSheet();
    
        this.mode = 'pickAttributes';
        this.drawImage('typePicker', this.areas.typePicker.x1, this.areas.typePicker.y1);
        this.context.font = this.defaultFont;

        this.context.fillStyle = 'rgba(160,160,160,1)';
        var title = this.types[this.data.type].title.toUpperCase();
        this.fillText(title, this.areas.typePicker.x1 + 4, this.areas.typePicker.y1 + 8);

        if (!this.data.prop) { this.data.prop = {}; }
        if (!this.data.prop.attributes) { this.data.prop.attributes = []; }

        var useDefault = !this.data.prop.attributes || this.data.prop.attributes.length == 0;

        var x = 0, y = 0;
        var requiresFootnote = false;
        for (var attribute in ig.game.attributesManager.info[ this.types[this.data.type].key ]) {
            var info = ig.game.attributesManager.info[ this.types[this.data.type].key ][attribute];
            var doShow = !info.hidden && ( !info.deprecated || this.data.prop.attributes.indexOf(attribute) >= 0 );
            if ( doShow && (!info.rankNeeded || ig.game.ourPlayer.rank >= info.rankNeeded) ) {
                var rect = this.getRectangleOnAttributesPicker(attribute);
                
                var text = attribute;
                if (info.label) { text = info.label; }
                if ( text.indexOf('*') >= 0 ) { requiresFootnote = true; }
                
                else { text = ig.game.strings.camelCaseToWords(text); }                
                text = text.toUpperCase();
                text = ig.game.strings.replaceAll(text, '_', ' ');
                text = ig.game.strings.replaceAll( text, ' -> ', '->' );
                if (!info.label) { text = ig.game.strings.cutStringLength(text, 15); }

                x = rect.x + this.areas.typePickerSingleSelection.x1;
                y = rect.y + this.areas.typePickerSingleSelection.y1 + parseInt(rect.height / 2) + this.fontOffsetY - 1;

                var iconName = this.data.type + '_attribute_' + attribute;
                if (this.spritesheetImages[iconName]) {
                    this.drawImage(iconName, x - 2, y - 6);
                    x += this.spritesheetImages[iconName].width;
                }

                var opacity = info.rankNeeded && info.rankNeeded == 10 ? .5 : 1;
                this.context.fillStyle = 'rgba(48,48,48,' + opacity + ')';
                this.fillText(text, x, y);

                var isChecked = this.data.prop.attributes.indexOf(attribute) >= 0;
                
                var image = ig.game.attributesManager.getIsTypeWithSingleAttribute(this.types[this.data.type].key) ? 'radioButton' : 'checkbox';
                image += (isChecked ? 'Checked' : 'Unchecked');
                this.drawImageWithAlpha(image, rect.x + rect.width - 10, rect.y);
            }
        }
        
        if (requiresFootnote) {
            var footnote = '*may require friendship'.toUpperCase(); // '*Other Person'
            this.context.fillStyle = 'rgba(255,255,255,0.4)';
            this.fillText(footnote, this.areas.typePicker.x1 + 46, this.areas.typePicker.y1 + 8);
        }
    },

    getTypesInGroup: function(parentType) {
        var typesInGroup = null;
        for (var type in this.types) {
            if (this.types[type].parent == parentType) {
                if (typesInGroup == null) { typesInGroup = []; }
                typesInGroup[typesInGroup.length] = type;
            }
        }
        return typesInGroup;
    },

    getRectangleOnTypePicker: function(type) {
        var index = this.getTypeIndex(type);
        var columnCount = Math.ceil( this.typePickerRowsPerColumn / this.getTypeCount() ) + 1;
        var row = index % this.typePickerRowsPerColumn;
        var column = Math.ceil( (index + 1) / this.typePickerRowsPerColumn ) - 1;
        var x = this.areas.typePickerSelections.x1 + column * this.areas.typePickerGrid.width;
        var y = this.areas.typePickerSelections.y1 + row * this.areas.typePickerGrid.height;
        return {x: x, y: y, width: this.areas.typePickerGrid.width, height: this.areas.typePickerGrid.height};
    },

    getRectangleOnAttributesPicker: function(attribute) {
        var index = this.getAttributesIndex(attribute);
        var columnCount = Math.ceil( this.typePickerRowsPerColumn / this.getAttributesCount() ) + 1;
        var row = index % this.typePickerRowsPerColumn;
        var column = Math.ceil( (index + 1) / this.typePickerRowsPerColumn ) - 1;
        var x = this.areas.typePickerSelections.x1 + column * this.areas.typePickerGrid.width;
        var y = this.areas.typePickerSelections.y1 + row * this.areas.typePickerGrid.height;
        return {x: x, y: y, width: this.areas.typePickerGrid.width, height: this.areas.typePickerGrid.height};
    },

    showPositionOnColorPicker: function() {
        for (var i = 0; i < this.maxColors; i++) {
            if (i != this.transparentIndex) {
                var pos = this.positionOnPicker[i];
                if (pos) {
                    var rgba = pos.x >= 30 ? {r: 0, g: 0, b: 0, alpha: 1} : {r: 255, g: 255, b: 255, alpha: 1}
                    var isSelf = i == this.selectedColor;
                    var size = isSelf ? 2 : 1;
                    var rgba = isSelf ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,.5)';
                    this.context.fillStyle = rgba;
                    this.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
                }
            }
        }
    },

    getRelativePaletteIndexFromAbsolute: function() {
        var relativeSelectedIndex = 0;
        var colors = this.getColorsOfCurrentPage();
        for (var relativeIndex in colors) {
            relativeIndex = parseInt(relativeIndex);
            var index = colors[relativeIndex]; if ( index != parseInt(index) ) { continue; }

            if (index == this.selectedColor) {
                relativeSelectedIndex = relativeIndex;
                break;
            }
        }
        return relativeSelectedIndex;
    },

    updateColorPickerPreview: function(rgba) {
        var relativeIndex = this.getRelativePaletteIndexFromAbsolute(this.selectedColor);
        var rect = this.getPaletteBoxRectangle(this.selectedColor, relativeIndex, true);
        this.drawPaletteBox(rect, this.selectedColor, rgba);
    },

    hideSubDialog: function(event) {
        this.brieflyPauseClicksHandling();
        this.mode = 'default';
        this.showInputBox();
        this.cursorIsDown = false;
        this.cursorWasUpSinceMode = false;
        this.update();
    },

    brieflyPauseClicksHandling: function(timeInMS) {
        if (timeInMS == undefined || timeInMS == null) { timeInMS = 200; }
        var self = this;
        this.handleClicks = false;
        if (this.timeouts.handleClicks != null) {
            clearTimeout(this.timeouts.handleClicks);
            this.timeouts['handleClicks'] = null;
        }
        this.timeouts.handleClicks = setTimeout( function() { self.handleClicks = true; self.timeouts.handleClicks = null; }, timeInMS );
    },

    handleMouseMoved: function(event) {
        if (this.isRunning) {
            var canvasOffset = jQuery(this.canvas).offset();

            var x = null, y = null;
            if (event.touches) {
                if (event.touches.length == 2) {
                    var pixelX = (event.touches[1].clientX - canvasOffset.left - this.areas.drawingOffset.x1);
                    var pixelY = (event.touches[1].clientY - canvasOffset.top - this.areas.drawingOffset.y1);
                    if (pixelX > 0) { pixelX /= this.pageZoom; }
                    if (pixelY > 0) { pixelY /= this.pageZoom; }
                    if (pixelX > 0) { pixelX /= this.drawingZoom; }
                    if (pixelY > 0) { pixelY /= this.drawingZoom; }
                    pixelX = Math.floor(pixelX); pixelY = Math.floor(pixelY);
                    var valueIsSane = pixelX >= 0 && pixelX < this.tileWidth && pixelY >= 0 && pixelY < this.tileHeight;
                    if (valueIsSane) {
                        var symmetricPoint = this.getSymmetricPointIfNeeded(pixelX, pixelY);
                        this.handleFloodFill(pixelX, pixelY, this.selectedColor, symmetricPoint);
                    }
                    return;
                }
                else if (event.touches.length == 1) {
                    x = event.touches[0].clientX;
                    y = event.touches[0].clientY;
                }
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }

            this.cursorX = x - canvasOffset.left;
            this.cursorY = y - canvasOffset.top;
    
            if (this.cursorX > 0) { this.cursorX /= this.pageZoom; }
            if (this.cursorY > 0) { this.cursorY /= this.pageZoom; }
    
            this.cursorX = Math.floor(this.cursorX);
            this.cursorY = Math.floor(this.cursorY);
    
            this.updateBasedOnCursor();
        }
    },

    handleMouseDown: function(event) {
        if (event.type == 'touchstart') { this.handleMouseMoved(event); }

        if (this.isRunning) {
            this.leaveInputBox();
            var isRightClick = event.button == 2;
            if (isRightClick) { this.cursorIsDown = false; this.cursorRightIsDown = true; }
            else { this.cursorIsDown = true; this.cursorRightIsDown = false; }
            this.updateBasedOnCursor();
        }

        if (event && event.preventDefault) { event.preventDefault(); }
        else { window.event.returnValue = false; }
        return false;
    },

    handleDoubleClick: function(event) {
        if (this.isRunning) {
            this.cursorDoubleClicked = true;
            this.updateBasedOnCursorUp();
            this.cursorDoubleClicked = false;
        }
    },

    handleKeyDown: function(event) {
        if (this.isRunning) {
            this.updateCursorMode(event, 'keyDown');

            if ( !( ig.ua.mobile || jQuery('#' + this.inputBoxId).is(':focus') || jQuery('#searchInput').is(':focus') ) ) {
                var letterA = 65;
                if (event.shiftKey) { this.shiftKeyIsPressed = true; }
                if (event.keyCode == letterA) { this.lineKeyIsPressed = true; }
            }
        }
    },

    copyToClipboard: function() {
        if (!ig.game.alertDialog.isOpen) {
            this.clipboardPixels = this.clonePixelsOfCell(this.data.pixels[this.selectedCell]);
            ig.game.sounds.pickup.play();
            this.recordDataHistory();
        }
    },

    pasteFromClipboard: function() {
        if (!ig.game.alertDialog.isOpen) {
            if (this.clipboardPixels) {
                this.drawPixelsOnCanvas(this.clipboardPixels);
                this.update();
                ig.game.sounds.putdown.play();
                this.recordDataHistory();
            }
            else {
                ig.game.sounds.nocando.play();
            }
        }
    },

    drawPixelsOnCanvas: function(pixelsToDraw) {
        var cell = this.data.pixels[this.selectedCell];
        for (var x = 0; x < cell.length; x++) {
            for (var y = 0; y < cell[x].length; y++) {
                if (pixelsToDraw[x] && pixelsToDraw[x][y] != undefined && pixelsToDraw[x][y] != this.transparentIndex) {
                    cell[x][y] = pixelsToDraw[x][y];
                }
            }
        }
    },

    clonePixelsOfCellExpandToTileTypeDefaultSize: function(pixelsOfCellToClone) {
        var pixelsOfCell = [];
        for (var x = 0; x < this.tileWidth; x++) {
            pixelsOfCell[x] = [];
            for (var y = 0; y < this.tileHeight; y++) {
                if (pixelsOfCellToClone[x] && pixelsOfCellToClone[x][y] != null && pixelsOfCellToClone[x][y] != undefined) {
                    pixelsOfCell[x][y] = pixelsOfCellToClone[x][y];
                }
                else {
                    pixelsOfCell[x][y] = this.transparentIndex;
                }
            }
        }
        return pixelsOfCell;
    },

    lowerColorOpacity: function(event) {
        if (this.selectedColor != this.transparentIndex) {
            var allowedAlphas = [0, .07, .1, .25, .5, .75, 1];
            var currentIndex = allowedAlphas.indexOf(this.data.colors[this.selectedColor].alpha);
            currentIndex--;
            if (currentIndex <= 0) { currentIndex = allowedAlphas.length - 1; }
            this.data.colors[this.selectedColor].alpha = allowedAlphas[currentIndex];
            this.update();
            this.recordDataHistory();
        }
    },

    handleKeyUp: function(event) {
        if ( this.isRunning && !jQuery('#' + this.inputBoxId).is(':focus') && !jQuery('#searchInput').is(':focus') &&
                !ig.game.alertDialog.isOpen && !(this.interactingDialog && this.interactingDialog.isOpen) &&
                !(ig.game.userScriptEditor && ig.game.userScriptEditor.isOpen && jQuery('#userScriptEditorText').is(':focus') ) &&
                !ig.ua.mobile
                ) {
            var key = {a: 65, b: 66, c: 67, d: 68, e: 69, f: 70, g: 71, h: 72, i: 73, m: 77, n: 78, o: 79, p: 80, r: 82, s: 83, t: 84, u: 85, v: 86, z: 90,
                    esc: 27, del: 46, tab: 9, left: 37, up: 38, right: 39, down: 40, space: 32,
                    zero: 48, nine: 57, minus: 189
                    };
            var cancel = false;
            var ctrlKey = this.getIsCtrlKeyOrSubstitute(event);
            var shiftKey = !!event.shiftKey;
            this.shiftKeyIsPressed = shiftKey;
            this.lineKeyIsPressed = false;

            if (event.which == key.z) {
                if (ctrlKey) {
                    this.undoDataHistory();
                }
                else {
                    this.redoDataHistory();
                }
                this.updateAll();
                if (this.mode == 'changeColor') { this.updateChangeColorDialog(); }
            }
            else if (ctrlKey && event.which == key.f) {
                ig.game.alertDialog.openPrompt('enter type or part of type:', null, ig.game.painter.setViaTypeSearch,
                        null, null, null, null, null, 150, true);
            }
            else if (ctrlKey && event.which == key.d) {
                this.handleSetMotion();
            }
            else if (ctrlKey && shiftKey && event.which == key.left) {
                this.movePixelsFromStartPoint(-1, 0);
            }
            else if (ctrlKey && shiftKey && event.which == key.right) {
                this.movePixelsFromStartPoint(1, 0);
            }
            else if (ctrlKey && shiftKey && event.which == key.up) {
                this.movePixelsFromStartPoint(0, -1);
            }
            else if (ctrlKey && shiftKey && event.which == key.down) {
                this.movePixelsFromStartPoint(0, 1);
            }

            else if (ctrlKey && event.which == key.left) {
                this.movePixels(-1, 0);
            }
            else if (ctrlKey && event.which == key.right) {
                this.movePixels(1, 0);
            }
            else if (ctrlKey && event.which == key.up) {
                this.movePixels(0, -1);
            }
            else if (ctrlKey && event.which == key.down) {
                this.movePixels(0, 1);
            }
            else if (event.which == key.p) {
                this.alertHoveredPoint();
            }
            else if (event.which == key.g) {
                this.toggleShowGrid();
            }
            else if (event.which == key.c) {
                this.copyToClipboard();
            }
            else if (event.which == key.v && !ig.game.alertDialog.isOpen) {
                this.pasteFromClipboard();
            }
            else if (event.which == key.t) {
                this.lowerColorOpacity();
            }
            else if (event.which == key.space && this.data.type && this.data.type == 'musicSheet') {
                this.togglePlayMusicSheet();
            }
            else if (event.which == key.o) {
                if (this.mode != 'cloneOld') {
                    ig.game.panelSet.setTabState(2)
                    this.update();
                    ig.game.sounds.click.play();
                    this.showCloneOld();
                }
                else { cancel = true; }
            }
            else if (!ctrlKey && event.which == key.i) {
                this.handleRgbAsTextInput();
            }
            else if (event.which == key.s) {
                this.drawSymmetric = !this.drawSymmetric;
                this.update();
                ig.game.sounds.click.play();
            }
            else if (event.which == key.h) {
                if (this.mode != 'changeColor') {
                    this.singleColorIndexToChange = null;
                    this.mode = 'changeColor';
                    this.colorsBeforeColorChanges = this.cloneColors(this.data.colors);
                    this.hideInputBox();
                    this.updateChangeColorDialog();
                }
                else {
                    this.showInputBox();
                    cancel = true;
                }
            }
            else if (event.which == key.n) {
                if (this.mode != 'changeColor') {
                    this.singleColorIndexToChange = this.selectedColor;
                    this.mode = 'changeColor';
                    this.colorsBeforeColorChanges = this.cloneColors(this.data.colors);
                    this.hideInputBox();
                    this.updateChangeColorDialog();
                }
                else {
                    this.showInputBox();
                    cancel = true;
                }
            }
            else if (event.which == key.del) {
                this.clearImage(true, ctrlKey);
            }
            else if (event.which == key.r) {
                this.data.pixels[this.selectedCell] = this.clonePixelsRotateRight(this.data.pixels[this.selectedCell]);
                this.update();
            }
            else if (event.which == key.m) {
                this.data.pixels[this.selectedCell] = this.clonePixelsMirrorX(this.data.pixels[this.selectedCell]);
                this.update();
            }
            else if (event.which == key.f) {
                this.data.pixels[this.selectedCell] = this.clonePixelsMirrorY(this.data.pixels[this.selectedCell]);
                this.update();
            }
            else if (event.which == key.esc) {
                cancel = true;
            }
            else if (ctrlKey && event.which == key.tab) {
                if (this.data.type && ( this.types[this.data.type].isAnimated || this.types[this.data.type].isMultiAnimated) ) {
                    if (this.types[this.data.type].isAnimated) {
                        this.selectedCell = this.selectedCell == 0 ? 1 : 0;
                    }
                    else if ( ['dynamicThing', 'happening', 'musicSheet', 'farBack'].indexOf(this.data.type) >= 0 ) {
                        this.selectedCell = this.selectedCell + 1 <= this.optionalCellCount - 1 ? this.selectedCell + 1 : 0;
                    }
                    else {
                        this.selectedCell = this.selectedCell + 1 <= ig.game.maxCellsMulti - 1 ? this.selectedCell + 1 : 0;
                    }
                    this.previewCell = this.selectedCell;
                    this.update();
                    ig.game.sounds.click.play();
                }
            }
            else if (event.which == key.b) {
                this.brushType++;
                if (this.brushType >= this.brushTypesMax) {
                    this.brushType = 0;
                    ig.game.sounds.shortWhoosh.play();
                }
                else {
                    ig.game.sounds.click.play();
                }
                
                if (this.mode == 'menu') { this.hideSubDialog(); }
            }
            else if (event.which == key.down) {
                ig.game.motionDialog.tryOpen();
            }
            else if ( (event.which >= key.zero && event.which <= key.nine) ||
                    event.which == key.minus ) {
                this.handlePaletteIndexSelectShortcut(event.which);
            }

            this.updateCursorMode(event, 'keyUp');

            if (cancel) {
                if (this.mode == 'default') {
                    this.close();
                }
                else {
                    this.hideSubDialog();
                    this.updateAll();
                }
            }
            
            this.recordDataHistory();
        }
    },
    
    handlePaletteIndexSelectShortcut: function(key) {
        var colorIndex = -1;
        
        switch (key) {
            case  49: colorIndex =  0; break; // Key "1"
            case  50: colorIndex =  1; break; // Key "2"
            case  51: colorIndex =  2; break; // Key "3"
            case  52: colorIndex =  3; break; // Key "4"
            case  53: colorIndex =  4; break; // Key "5"
            case  54: colorIndex =  5; break; // Key "6"
            case  55: colorIndex =  6; break; // Key "7"
            case  56: colorIndex =  7; break; // Key "8"
            case  57: colorIndex =  8; break; // Key "9"
            case  48: colorIndex =  9; break; // Key "0"
            case 189: colorIndex = 10; break; // Key "-"
        }
        
        if (colorIndex >= 0) {
            if (this.selectedPalettePage == 0) {
                this.selectedColor = colorIndex;
            }
            else {
                this.selectedColor = ( this.selectedPalettePage * (this.colorsPerPalettePage) ) + 1 +
                        colorIndex;
            }
            this.update();
        }
    },
    
    setViaTypeSearch: function(s) {
        var fuzzyMatches = [];
        if (s) {
            var self = ig.game.painter;
            s = s.toLowerCase().trim();
            for (var thisType in self.types) {
                var info = self.types[thisType];
                if (info.key && thisType.toLowerCase().indexOf('group') === -1 ) {
                    var title = info.title.toLowerCase();
                    if (title == s) {
                        self.setToType(thisType, true);
                        ig.game.sounds.success.play();
                        fuzzyMatches = [];
                        break;
                    }
                    if ( title.indexOf(s) >= 0 ) {
                        fuzzyMatches.push(thisType);
                    }
                }
            }
        }
        
        if (fuzzyMatches.length == 1) {
            self.setToType(fuzzyMatches[0], true);
            ig.game.sounds.success.play();
        }
        else if (fuzzyMatches.length >= 2) {
            var html = '';
            for (var i = 0; i < fuzzyMatches.length; i++) {
                var thisType = fuzzyMatches[i];
                var escapedType = ig.game.strings.htmlEscape(thisType);
                var escapedTitle = ig.game.strings.htmlEscape( self.types[thisType].title );
                var clickCall = "ig.game.painter.setToType('" + escapedType + "',true);" +
                        "ig.game.sounds.success.play();" +
                        "ig.game.alertDialog.close()";
                html += '<span class="pseudoLink" onclick="' + clickCall + '">' +
                        escapedTitle + '</span> &nbsp; ';
            }
            html = '<p>' + html + '</p>';
            setTimeout( function() {
                    ig.game.alertDialog.open({html: html, doShowSmaller: true, useCloseButton: true});
                }, 50 );
        }
    },
    
    updateLivePreview: function() {
        if ( this.getCurrentTypeHasLivePreview() ) {
            this.removeLivePreviewEntities();
            this.spawnEntityForLivePreview();
        }
    },

    spawnEntityForLivePreview: function() {
        var typeKey = this.types[this.data.type].key;
        var entityName = 'Entity' + ig.game.strings.toUpperCaseFirst( typeKey.toLowerCase() );
        if ( !ig.global[entityName] ) { entityName = 'EntityDefault'; }
        var entity = ig.global[entityName];
        var settings = {};
        
        var cellCount = this.maxCells;
        var realWidth = this.tileWidth * cellCount * ig.system.scale;
        var realHeight = this.tileHeight * ig.system.scale;
        var canvas = document.createElement('canvas');
        canvas.width = realWidth;
        canvas.height = realHeight;
        
        var context = canvas.getContext('2d');
        this.drawCurrentOnLivePreviewContext(context);
        
        var img = new ml.Image(null, null, null, canvas);
        img.path = 'extracted/creator_live_preview';

        settings.animSheet = new ml.AnimationSheet(null, this.tileWidth, this.tileHeight, img);
        settings.givenName = jQuery('#' + this.inputBoxId).val();
        settings.isCreatorLivePreview = true;
        settings.rgb =  this.getRgbString(this.data.colors[0]);
        settings.rgb2 = this.getRgbString(this.data.colors[1]);
        var currentText = jQuery('#promptInputBox').val();
        if (currentText) { this.data.prop.text = currentText; }
        settings.text = this.data.prop.text;

        if (!settings.givenName || settings.givenName == '') { settings.givenName = 'noname'; }
        
        settings.attributes = {};
        if (this.data.prop.attributes) {
            for (var i = 0; i < this.data.prop.attributes.length; i++) {
                var attributeName = this.data.prop.attributes[i];
                settings.attributes[attributeName] = true;
            }
        }

        var pos = this.getLivePreviewEntitySpawnPosition();
        ig.game.spawnEntityIfPosOnScreenPlusMargin(entity, pos.x, pos.y, settings);
    },
    
    getLivePreviewEntitySpawnPosition: function() {
        var basePos = {
                x: ig.game.ourPlayer.pos.x + ig.game.ourPlayer.thingBehindPlayerOffset.x,
                y: ig.game.ourPlayer.pos.y + ig.game.ourPlayer.thingBehindPlayerOffset.y - ig.game.tileSize * 3
                };
        var coords = ig.game.mapManager.convertGameCoordsToMapCoords(basePos.x, basePos.y);
        return ig.game.mapManager.convertMapCoordsToGameCoords(coords.x, coords.y);
    },

    drawCurrentOnLivePreviewContext: function(context) {
        var cellMax = this.data.pixels.length;
        if (this.types[this.data.type].hasOptionalCells && this.optionalCellCount) {
            cellMax = this.optionalCellCount;
        }
        for (var cell = 0; cell < cellMax; cell++) {
            var pixels = this.data.pixels[cell];
            for (var x = 0; x < this.tileWidth; x++) {
                for (var y = 0; y < this.tileHeight; y++) {
                    var colorIndex = pixels[x] != undefined && pixels[x][y] != undefined ? pixels[x][y] : this.transparentIndex;
                    if (colorIndex != this.transparentIndex) {
                        var rgba = this.data.colors[colorIndex];
                        context.fillStyle = this.getRgbaString(rgba);
                        var offsetX = cell * this.tileWidth * ig.system.scale;
                        context.fillRect(x * ig.system.scale + offsetX, y * ig.system.scale, ig.system.scale, ig.system.scale);
                    }
                }
            }
        }
    },
    
    removeLivePreviewEntities: function() {
        for (var key in ig.game.entitiesByType) {
            var entities = ig.game.entitiesByType[key];
            if (entities) {
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].isCreatorLivePreview) {
                        entities[i].kill();
                    }
                }
            }
        }
    },

    toggleShowGrid: function() {
        ig.game.sounds.click.play();
        this.showGrid = !this.showGrid;
        this.hideSubDialog();
        this.updateAll();
    },
    
    startPlayMusicSheet: function() {
        if (!this.musicSheetTimer) {
            if (this.data.prop && !this.data.prop.noteDelayMS) {
                this.data.prop.noteDelayMS = this.noteDelayMSDefault;
            }
                
            this.musicSheetTimer = setInterval(
                    'ig.game.painter.continuePlayMusicSheet()',
                    this.data.prop.noteDelayMS );

            var point = this.getHoveredPoint();
            this.musicSheetPosition = point ? point.x : 0;

            this.continuePlayMusicSheet();
        }
    },
    
    stopPlayMusicSheet: function() {
        if (this.musicSheetTimer) {
            clearInterval(this.musicSheetTimer);
            this.musicSheetTimer = undefined;
            this.update();
        }
    },
    
    togglePlayMusicSheet: function() {
        if (this.musicSheetTimer) { this.stopPlayMusicSheet();  }
        else {                      this.startPlayMusicSheet(); }
        this.updateCells();
    },
    
    saveNoteDelay: function(v) {
        if (v) {
            if ( parseInt(v) == v ) {
                v = parseInt(v).limit(ig.game.painter.noteDelayMSMin, ig.game.painter.noteDelayMSMax);
                v = parseInt( Math.floor(v / 50) * 50 );
                ig.game.painter.data.prop.noteDelayMS = v;
            }
            else {
                alert('Please use a number between ' + ig.game.painter.noteDelayMSMin + ' and ' + ig.game.painter.noteDelayMSMax + ' in steps of 50.');
            }
        }
    },

    getObjectPropertiesAsArray: function(propertiesObject) {
        var arr = [];
        for (var key in propertiesObject) {
            if ( propertiesObject.hasOwnProperty(key) ) {
                arr.push(key);
            }
        }
        return arr;
    },

    continuePlayMusicSheet: function() {
        this.updateDrawing();
        
        this.adjustMusicSheetCellAndPositionBasedOnMarker();

        if (this.musicSheetTimer) {        
            for (var y = 0; y < this.tileHeight; y++) {
                this.playPixelAsSound(this.selectedCell, this.musicSheetPosition, y);
            }

            this.musicSheetPosition++;
            if (this.musicSheetPosition >= this.data.pixels[this.selectedCell].length) {
                this.musicSheetPosition = 0;
                
                if (++this.selectedCell > this.optionalCellCount - 1) {
                    this.selectedCell = 0;
                    this.stopPlayMusicSheet();
                }
                this.update();
            }
        }
    },
    
    adjustMusicSheetCellAndPositionBasedOnMarker: function() {
        for (var y = 0; y < this.tileHeight; y++) {
            if ( this.data.pixels[this.selectedCell] && 
                    this.data.pixels[this.selectedCell][this.musicSheetPosition] &&
                    this.data.pixels[this.selectedCell][this.musicSheetPosition][y] !== undefined ) {
                
                var colorIndex = this.data.pixels[this.selectedCell][this.musicSheetPosition][y];
                if (colorIndex !== undefined) {
                    var marker = this.musicSheetSpecialIndex[colorIndex];
                    if (marker == 'terminator') {
                        if (++this.selectedCell > this.optionalCellCount - 1) {
                            this.selectedCell = 0;
                            this.stopPlayMusicSheet();
                        }
                        this.musicSheetPosition = 0;
                        this.update();
                        break;
                    }
                }
                
            }
        }
    },

    convertTypeMusicSheetToMusic: function() {
        var ms = 0;
        ig.game.musicManager.reset();
        
        ig.game.musicManager.isRecording = true;

        for (this.selectedCell = 0; this.selectedCell < this.optionalCellCount; this.selectedCell++) {
            for (this.musicSheetPosition = 0; this.musicSheetPosition < this.tileWidth; this.musicSheetPosition++) {
                this.adjustMusicSheetCellAndPositionBasedOnMarker();
                for (var y = 0; y < this.tileHeight; y++) {
                    var data = this.getPixelAsSoundData(this.selectedCell, this.musicSheetPosition, y);
                    if (data && data.note) {
                        var thisTime = ig.game.musicManager.getFormattedTickTime(ms / 1000);
                        if (data.isKit) {
                            ig.game.musicManager.recordInstrumentWithKitNumberSoundIfNeeded(data.instrument, data.note, thisTime);
                        }
                        else {
                            ig.game.musicManager.recordInstrumentSoundIfNeeded(data.instrument, data.octave, data.note, thisTime);
                        }
                    }
                }
                ms += this.data.prop.noteDelayMS;
            }
        }

        ig.game.musicManager.isRecording = false;

        this.optionalCells = this.maxCells = 1;
        for (var i = 1; i <= 2; i++) {
            this.clearImage(true, true, true);
            this.setToType('music');
        }
        this.loadMusicIntoPropertyIfNeeded();
        this.updateAll();
    },

    drawMusicSheetPosition: function() {
        ml.Misc.setDrawMode('lighter');
        this.context.fillStyle = 'rgba(255,255,255,.3)';
        this.fillRect(
                this.areas.drawingOffset.x1 + this.musicSheetPosition * this.drawingZoom,
                this.areas.drawingOffset.y1,
                this.drawingZoom,
                this.drawingZoom * this.tileHeight);
        ml.Misc.resetDrawMode();
    },
    
    getMusicSheetHasTerminator: function() {
        var hasIt = false;
        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                if ( this.data.pixels && this.data.pixels[this.selectedCell] && this.data.pixels[this.selectedCell][x] ) {
                    var colorIndex = this.data.pixels[this.selectedCell][x][y];
                    var marker = this.musicSheetSpecialIndex[colorIndex];
                    if (marker == 'terminator') {
                        hasIt = true;
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
        return hasIt;
    },
    
    drawInstrumentGridLines: function() {
        var hasTerminator = this.getMusicSheetHasTerminator();
    
        this.context.fillStyle = 'rgba(0,0,0,.3)';
        var instrumentInfo = this.getInstrumentInfo();
        var rect = {x1: this.areas.drawingOffset.x1,
                    y1: this.areas.drawingOffset.y1,
                    width: this.tileWidth * this.drawingZoom,
                    height: this.tileHeight * this.drawingZoom};

        var isMarker = this.musicSheetSpecialIndex[this.selectedColor];

        if (instrumentInfo || isMarker) {
            if (!instrumentInfo) { instrumentInfo = {}; }

            if (instrumentInfo.isGuitar) {
                var nonUsableHeight = 4;
                this.fillRect(rect.x1, rect.y1 + rect.height - nonUsableHeight * this.drawingZoom,
                        rect.width, nonUsableHeight * this.drawingZoom);
            }
            else if (instrumentInfo.isKit && instrumentInfo.max < this.tileHeight) {
                var nonUsableHeight = (this.tileHeight - instrumentInfo.max);
                this.fillRect(rect.x1, rect.y1, rect.width, nonUsableHeight * this.drawingZoom);
            }

            if (!instrumentInfo.isKit || instrumentInfo.isGuitar) {
                var amountInGroup = ig.game.sounds.tones.length;
                for (var y = 1; y < this.tileHeight + 1; y++) {
                    if ( (this.tileHeight - y) % amountInGroup === 0 ) {
                        this.fillRect(rect.x1, rect.y1 + y * this.drawingZoom - 1, rect.width, 1);
                    }
                }
            }
            
            if (!hasTerminator) {
                for (var x = 1; x < this.tileWidth - 1; x++) {
                    if (x % 8 === 0) {
                        this.fillRect(rect.x1 + x * this.drawingZoom, rect.y1, 1, rect.height);
                    }
                }
            }
            
            if (!instrumentInfo.isKit || instrumentInfo.isGuitar) {
                this.context.fillStyle = 'rgba(0,0,0,.15)';
                for (var y = 0; y < this.tileHeight; y++) {
                    var noteIndex = (this.tileHeight - y) % ig.game.sounds.tones.length - 1;
                    var note = ig.game.sounds.tones[noteIndex];
                    var isSharp = note && note.indexOf('s') >= 0;
                    if (isSharp) {
                        this.fillRect(rect.x1, rect.y1 + y * this.drawingZoom,
                                rect.width, this.drawingZoom);
                    }
                }            
            }
            
        }
        else if ( !this.musicSheetSpecialIndex[this.selectedColor] ) {
            this.fillRect(rect.x1, rect.y1, rect.width, rect.height);
            
        }
        
        this.context.fillStyle = this.getRgbaString(this.canvasOverlayRgb);
        var leftRightMargin = ( (this.tileHeight - this.tileWidth) / 2 ) * this.drawingZoom;
        this.fillRect(rect.x1 - leftRightMargin, rect.y1, leftRightMargin, rect.height);
        this.fillRect(rect.x1 + rect.width, rect.y1, leftRightMargin, rect.height);

    },
    
    getInstrumentInfo: function() {
        var instrumentInfo = null;
        if (this.selectedColor !== undefined) {
            var instrument = this.instruments[this.selectedColor];
            if (instrument) {
                instrumentInfo = ig.game.sounds.instruments[instrument];
            }
        }
        return instrumentInfo; 
    },

    playPixelAsSound: function(cell, x, y) {
        var data = this.getPixelAsSoundData(cell, x, y);
        if (data) {
            if (data.isKit) {
                ig.game.sounds.playInstrumentWithKitNumberSound(data.instrument, data.note);
            }
            else {
                ig.game.sounds.playInstrumentSound(data.instrument, data.octave, data.note);
            }
        }
    },
    
    getPixelAsSoundData: function(cell, x, y) {
        var data = null;
        var colorIndex = this.data.pixels[cell][x][y];
        if (colorIndex != this.transparentIndex) {
            var instrument = this.instruments[colorIndex];
            if (instrument) {
                var instrumentInfo = ig.game.sounds.instruments[instrument];
                
                if (instrumentInfo.isKit) {
                    var noteIndex = this.tileHeight - y;
                    if (noteIndex <= instrumentInfo.max) {
                        if (instrumentInfo.isGuitar) { noteIndex = this.getConvertedGuitarNote(noteIndex); }
                        if (noteIndex != -1) {
                            data = {instrument: instrument, note: noteIndex, isKit: true};
                        }
                    }
                    
                }
                else {
                    var noteNumber = this.tileHeight - y - 1;
                    var noteIndex = noteNumber % ig.game.sounds.tones.length;
                    var octave = instrumentInfo.minOctave + Math.floor(noteNumber / ig.game.sounds.tones.length);
                    var note = ig.game.sounds.tones[noteIndex];
                    if (note) {
                        data = {instrument: instrument, octave: octave, note: note};
                    }
                    
                }
                
            }
        }
        return data;
    },

    getConvertedGuitarNote: function(noteIndex) {
        var mappingIndex = ig.game.sounds.getGuitarIndexToAssignedIndexMapping();
        var actualNotes = ig.game.sounds.getGuitarIndexDistinctMapping();
        var distinctNotes = {};
        var converted = -1;
        if (noteIndex >= 5) {
            noteIndex -= 4;
            var n = 0;
            for (var i = 0; i < actualNotes.length; i++) {
                var note = actualNotes[i];
                if ( !distinctNotes['n' + note] ) {
                    n++;
                    if (n == noteIndex) {
                        converted = mappingIndex[i];
                        break;
                    }
                    distinctNotes['n' + note] = true;
                }
            }
        }
        return converted;
    },

    getHoveredPoint: function() {
        var point = null;
        var x = this.cursorX, y = this.cursorY;
        var maxX = this.areas.drawingOffset.x1 + this.areas.drawing.width;
        var maxY = this.areas.drawingOffset.y1 + this.areas.drawing.height;
        var cursorIsOverDrawing = x >= this.areas.drawingOffset.x1 && x <= maxX && y >= this.areas.drawingOffset.y1 && y <= maxY;
        var pixelX = Math.floor( (x - this.areas.drawingOffset.x1) / this.drawingZoom );
        var pixelY = Math.floor( (y - this.areas.drawingOffset.y1) / this.drawingZoom );
        var valueIsSane = pixelX >= 0 && pixelX < this.tileWidth && pixelY >= 0 && pixelY < this.tileHeight;
        if (valueIsSane) {
            point = {x: pixelX, y: pixelY};
        }
        return point;
    },
    
    alertHoveredPoint: function() {
        var point = this.getHoveredPoint();
        if (point) {
            ig.game.alertDialog.open('The coordinates are ' + point.x + ' ' + point.y);
        }
    },

    handleRgbAsTextInput: function() {
        if (this.selectedColor != this.transparentIndex) {
            this.hideSubDialog();
            var rgba = this.getRgbaStringForInputBox( this.data.colors[this.selectedColor] );
            ig.game.alertDialog.openPrompt('Red, green, blue (0-255) and alpha (0.1-1) of this color, or hexadecimal color:',
                    rgba, ig.game.painter.rgbAsTextCallback, 'Ok');
        }
        else {
            ig.game.sounds.nocando.play();
        }
    },

    getIsCtrlKeyOrSubstitute: function(event) {
        return event.ctrlKey || (ig.ua.mac && event.metaKey);
    },

    updateCursorMode: function(event) {
        if (event == null || event == undefined) {
            this.cursorMode = 'default';
            document.body.style.cursor = 'default';
        }
        else {
            if ( this.getIsCtrlKeyOrSubstitute(event) && !this.anotherDialogIsOpen() ) {
                if (this.cursorMode != 'pickColor') {
                    this.cursorMode = 'pickColor';
                    document.body.style.cursor = 'url(' + this.imagePath + 'cursor_pickColor.png) 0 15, default';
                }
            }
            else if ( event.altKey && !this.anotherDialogIsOpen() ) {
                if (this.cursorMode != 'floodFill') {
                    this.cursorMode = 'floodFill';
                    document.body.style.cursor = 'url(' + this.imagePath + 'cursor_floodFill.png) 1 12, default';
                }
            }
            else {
                
                if (this.cursorMode != 'default') {
                    this.cursorMode = 'default';
                    document.body.style.cursor = 'default';
                }
            }
        }
    },

    anotherDialogIsOpen: function() {
        return (this.interactingDialog && this.interactingDialog.isOpen) ||
                (ig.game.alertDialog && ig.game.alertDialog.isOpen);
    },

    handleMouseRightDown: function(event) {
        if (this.isRunning) {
            this.leaveInputBox();
            this.cursorIsDown = false;
            this.cursorRightIsDown = true;
            this.updateBasedOnCursor();
            this.cursorRightIsDown = false;
        }
    },

    handleMouseUp: function(event) {
        if (this.isRunning) {
            this.leaveInputBox();
            this.cursorIsDown = false;
            this.cursorWasUpSinceMode[this.mode] = true;
            this.updateBasedOnCursorUp();
            this.cursorRightIsDown = false;
        }
    },

    movePixelsFromStartPoint: function(byX, byY) {
        var x = this.cursorX, y = this.cursorY;
        var maxX = this.areas.drawingOffset.x1 + this.areas.drawing.width;
        var maxY = this.areas.drawingOffset.y1 + this.areas.drawing.height;
        var cursorIsOverDrawing = x >= this.areas.drawingOffset.x1 && x <= maxX && y >= this.areas.drawingOffset.y1 && y <= maxY;
        var pixelX = (x - this.areas.drawingOffset.x1) / this.drawingZoom;
        var pixelY = (y - this.areas.drawingOffset.y1) / this.drawingZoom;
        pixelX = Math.floor(pixelX); pixelY = Math.floor(pixelY);
        var valueIsSane = pixelX >= 0 && pixelX < this.tileWidth && pixelY >= 0 && pixelY < this.tileHeight;
        if (cursorIsOverDrawing && valueIsSane) {
            this.doMovePixelsFromStartPoint(pixelX, pixelY, byX, byY);
        }
    },

    doMovePixelsFromStartPoint: function(pixelX, pixelY, byX, byY, cellIndex) {
        if (cellIndex === undefined) { cellIndex = this.selectedCell; }
        var cell = this.data.pixels[cellIndex];
        var cellOld = this.clonePixelsOfCell(cell);

        var minX = 0, maxX = this.tileWidth, stepX = 1;
        var minY = 0, maxY = this.tileHeight, stepY = 1;
        if (byX > 0) { minX = pixelX; }
        else if (byX < 0) { minX = pixelX; }
        else if (byY > 0) { minY = pixelY; }
        else if (byY < 0) { minY = pixelY; }

        var touches = this.getBorderTouches(cellIndex);

        if (byX < 0 && touches.left) { minX++; }
        else if (byX > 0 && touches.right) { maxX--; }
        else if (byY < 0 && touches.top) { minY++; }
        else if (byY > 0 && touches.bottom) { maxY--; }

        for (var x = minX; x < maxX; x += stepX) {
            for (var y = minY; y < maxY; y += stepY) {
                var otherX = x - byX;
                if (otherX < 0) { otherX = this.tileWidth - 1; }
                else if (otherX > this.tileWidth - 1) { otherX = 0; }

                var otherY = y - byY;
                if (otherY < 0) { otherY = this.tileHeight - 1; }
                else if (otherY > this.tileHeight - 1) { otherY = 0; }

                cell[x][y] = cellOld[otherX][otherY];
            }
        }

        this.recordDataHistory();
        this.update();
    },

    movePixelsAllCells: function(byX, byY) {
        for (var i = 0; i < this.data.pixels.length; i++) {
            this.movePixels(byX, byY, true, i);
        }
    },

    movePixels: function(byX, byY, doQuietly, cellIndex) {
        if (cellIndex === undefined) { cellIndex = this.selectedCell; }
        var cell = this.data.pixels[cellIndex];
        var cellOld = this.clonePixelsOfCell(cell);

        for (var x = 0; x < this.tileWidth; x++) {
            for (var y = 0; y < this.tileHeight; y++) {
                var otherX = x - byX;
                if (otherX < 0) { otherX = this.tileWidth - 1; }
                else if (otherX > this.tileWidth - 1) { otherX = 0; }

                var otherY = y - byY;
                if (otherY < 0) { otherY = this.tileHeight - 1; }
                else if (otherY > this.tileHeight - 1) { otherY = 0; }

                if (cell[x] && cell[x][y] !== undefined &&
                        cellOld[otherX] && cellOld[otherX][otherY] !== undefined) {
                    cell[x][y] = cellOld[otherX][otherY];
                }
            }
        }

        if (!doQuietly) {
            this.recordDataHistory();
            this.update();
        }
    },

    cloneArea: function(area) {
        return {x1: area.x1, y1: area.y1, x2: area.x2, y2: area.y2, width: area.width, height: area.height};
    },

    clearDrawing: function() {
        this.clearRect(this.areas.drawingOffset, this.areas.drawingOffset, this.areas.drawing.width, this.areas.drawing.height);
    },

    getPixelMap: function(width, height) {
        if (!width) { width = this.tileWidth; }
        if (!height) { height = this.tileHeight; }

        var map = [];
        for (var x = 0; x < width; x++) {
            map[x] = [];
            for (var y = 0; y < height; y++) {
                map[x][y] = this.transparentIndex;
            }
        }
        return map;
    },

    getRgbaString: function(rgba) {
        if (!rgba) { rgba = {}; }
        if (rgba.alpha === undefined || rgba.alpha == null) { rgba.alpha = 1; }
        return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.alpha + ')';
    },

    getRgbaStringForInputBox: function(rgba) {
        if (!rgba) { rgba = {}; }
        if (rgba.alpha === undefined || rgba.alpha == null) { rgba.alpha = 1; }
        return rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.alpha;
    },

    getRgbString: function(rgbOrRgba) {
        if (!rgbOrRgba) { rgbOrRgba = {r: 0, g: 0, b: 0}; }
        return rgbOrRgba.r + ',' + rgbOrRgba.g + ',' + rgbOrRgba.b;
    },
    
    addTemplateIfNeeded: function() {
        if (this.data.type == 'motion') {
            this.loadBodyForMotion();
        }
        else if ( !this.somethingIsDrawn() ) {
            if (this.data.type == 'walking') {
                this.data.pixels = this.getLivingTypeWalkingDefaultCells();
            }
        }
    },

    loadBodyForMotion: function() {
        var self = this;
        var itemId = ig.game.ourPlayer.attachments && ig.game.ourPlayer.attachments.b ? ig.game.ourPlayer.attachments.b.id : null;
        if (itemId) {
            var retrieveItem_Promise = ig.game.httpApi.getItemImageDataFromPng_P(itemId);
            retrieveItem_Promise.done(function(data){
                if(data) {
                    var isCreator = ig.game.ourPlayer.remoteId == data.creator;
                    if (isCreator) {
                        self.loadMotionByPixelsAndColors(data.imageData.pixels, data.imageData.colors, true);
                    }
                    else {
                        ig.game.alertDialog.open("You can only add motions for bodies you've created.");
                    }
                }
            });
        }
        else {
            ig.game.alertDialog.open('To create a Motion, please change into a body of yours first.');
            setTimeout( function() { ig.game.painter.setToType('body'); }, 500 );
        }
    },

    loadMotionByPixelsAndColors: function(pixels, colors, isLoadedFromBody) {
        this.data.colors = this.getDefaultColors();
        for (var i = 0; i < colors.length; i++) {
            this.data.colors[i] = ig.game.cloneObject(colors[i]);
        }

        this.data.pixels[0] = ig.game.cloneObject(pixels[0]);
        this.types.motion.tileSize = {width: this.data.pixels[0].length, height: this.data.pixels[0][0].length};
        this.tileWidth = this.data.pixels[0].length;
        this.tileHeight = this.data.pixels[0][0].length;

        var minCellToClear = isLoadedFromBody ? 1 : 3;
        for (var cell = minCellToClear; cell < this.maxCells; cell++) {
            this.data.pixels[cell] = this.getPixelMap();
        }

        this.initAreas();
        this.updateAll();
    },

    getLivingTypeWalkingDefaultCells: function() {
        return [
            [ [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,0,0,0,0,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,0,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,0,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,0],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9],[9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9,9,9,0],[9,9,9,9,9,9,9,9,9,9,9,9,0,9,0,0,0,0,0],[9,9,9,9,9,9,9,0,9,9,9,9,9,0,9,9,9,9,9],[9,9,9,9,9,9,9,9,0,9,9,9,0,9,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9] ],
            [ [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,0,0,0,0,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,0,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,0,0,0],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,9,9,0],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,0,9,9],[9,9,9,9,9,9,9,9,9,9,9,0,9,9,9,0,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,0,9,0,9,9,9,9],[9,9,9,9,9,9,9,0,9,9,9,9,9,0,9,9,9,9,9],[9,9,9,9,9,9,9,9,0,9,9,9,0,9,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9] ]
        ];
    },

    getDefaultColors: function() {
        var colors = [];
        for (var i = 0; i < this.maxColors; i++) { colors[i] = this.getDefaultColor(i); }
        return colors;
    },

    getDefaultColor: function(index) {
        var color = null;
        if (index == 0) { color = {r: 0, g: 0, b: 0, alpha: 1}; }
        else if (index == this.transparentIndex) { color = {r: 0, g: 0, b: 0, alpha: 0}; }
        else { color = {r: 255, g: 255, b: 255, alpha: 1}; }
        return color;
    },

    arrayContains: function(arr, v) {
        var doesContain = false, max = arr.length;
        for (var i = 0; i < max && !doesContain; i++) {
            if (arr[i] == v) { doesContain = true; }
        }
        return doesContain;
    },

    getChance: function(chanceOfSuccessInPercent) {
        var ok = false;
        if (chanceOfSuccessInPercent > 0) { ok = this.getRandom(0, 100) <= chanceOfSuccessInPercent; }
        return ok;
    },

    getRandom: function(min, max) {
        return ( (max + 1 - min) * Math.random() ) + min;
    },

    getRandomInt: function(min, max) {
        return parseInt( Math.floor( ( (max + 1 - min) * Math.random() ) + min ) );
    },

    clearRects: function(areaNames) {
        var max = areaNames.length;
        if (max == 0) { areaNames = [areaNames]; max = areaNames.length; }
        for (var i = 0; i < max; i++) {
            var area = this.areas[ areaNames[i] ];
            this.clearRect(area.x1, area.y1, area.x2 - area.x1, area.y2 - area.y1);
        }
    },

    clearRect: function(x, y, width, height) {
        this.context.clearRect( Math.ceil(x * this.pageZoom), Math.ceil(y * this.pageZoom), Math.ceil(width * this.pageZoom), Math.ceil(height * this.pageZoom) );
    },

    fillRect: function(x, y, width, height) {
        this.context.fillRect( Math.ceil(x * this.pageZoom), Math.ceil(y * this.pageZoom), Math.ceil(width * this.pageZoom), Math.ceil(height * this.pageZoom) );
    },

    strokeRect: function(x, y, width, height) {
        this.context.strokeRect( Math.ceil(x * this.pageZoom), Math.ceil(y * this.pageZoom), Math.ceil(width * this.pageZoom), Math.ceil(height * this.pageZoom) );
    },

    fillText: function(text, x, y) {
        this.context.fillText(text, x * this.pageZoom, y * this.pageZoom);
    },

    getImageData: function(x, y, width, height) {
        return this.context.getImageData( Math.ceil(x * this.pageZoom), Math.ceil(y * this.pageZoom), Math.ceil(width * this.pageZoom), Math.ceil(height * this.pageZoom) );
    },

    getImageDataPixel: function(x, y) {
        return this.context.getImageData(x * this.pageZoom, y * this.pageZoom, 1, 1);
    },

    drawImage: function(name, x, y) {
        this.drawImageWithAlpha(name, x, y, null);
    },

    drawImageWithAlpha: function(name, x, y, alpha) {
        var oldAlpha = null;
        if (alpha != null) { oldAlpha = this.context.globalAlpha; this.context.globalAlpha = alpha; }

        if (this.spritesheetImages[name]) {
            var sheet = this.spritesheetImages[name];
            this.context.drawImage(this.images[sheet.spritesheet],
                    sheet.x, sheet.y, sheet.width, sheet.height,
                    x * this.pageZoom, y * this.pageZoom, sheet.width * this.pageZoom, sheet.height * this.pageZoom);
        }
        else {
            var image = this.images[name];
            if (image) { this.context.drawImage(image, x * this.pageZoom, y * this.pageZoom); }
        }

        if (alpha != null) { this.context.globalAlpha = oldAlpha; }
    },

    drawImageWithAlphaRotated: function(name, x, y, alpha, rotation) {
        // function in progress

        var oldAlpha = null;
        if (alpha != null) {
            oldAlpha = this.context.globalAlpha;
            this.context.globalAlpha = alpha;
        }

        this.context.save();
        this.context.translate(50, 35);
        this.context.rotate(0.5); 

        if (this.spritesheetImages[name]) {
            var sheet = this.spritesheetImages[name];
            this.context.drawImage(this.images[sheet.spritesheet],
                    sheet.x, sheet.y, sheet.width, sheet.height,
                    x * this.pageZoom, y * this.pageZoom, sheet.width * this.pageZoom, sheet.height * this.pageZoom);
        }
        else {
            var image = this.images[name];
            if (image) { this.context.drawImage(image, x * this.pageZoom, y * this.pageZoom); }
        }

        this.context.restore();

        if (alpha != null) { this.context.globalAlpha = oldAlpha; }
    },

    finalizeSpecialLoadingIfNeeded: function() {
        if (this.data && this.data.type) {
            if (this.data.type == 'viewable' || this.data.type == 'glow') {
                this.movePixels(9, 9, true);
            }
            else if (this.data.type == 'holder') {
                this.selectedCell = 2;
                this.movePixels(5, 29 - 19, true);
                this.selectedCell = 0;
            }
            else if (this.data.type == 'motion') {
                this.loadMotionByPixelsAndColors( ig.game.cloneObject(this.data.pixels), ig.game.cloneObject(this.data.colors) );
            }
            else if (this.data.type == 'body') {
                this.moveToBottomCenter();
            }
            else if (this.data.type == 'musicSheet') {
                if (!this.autoStartPlayMusicSheetTimer) {
                    var delayToPreventOpeningSpaceToStopAgain = 1000;
                    this.autoStartPlayMusicSheetTimer = setTimeout(
                        function() { ig.game.painter.startPlayMusicSheet(); }, delayToPreventOpeningSpaceToStopAgain
                    );
                }
            }

            if (this.types[this.data.type].hasOptionalCells) {
                this.removeEmptyOptionalCells();
            }

            if (this.data.prop && this.data.type == 'thrower') {
                this.data.direction = this.data.prop.throwDirection;
            }
        }

        if (this.data.prop && this.data.prop.rgb) { delete this.data.prop.rgb; }
        if (this.data.prop && this.data.prop.rgb2) { delete this.data.prop.rgb2; }

        if ( this.data.prop && (this.data.type == 'mountableGround' || this.data.type == 'mountableAir') ) {
            var mountableOffset = this.data.prop.offset;
            this.avatarTemplatePosition = {x: 0, y: 0};

            if (mountableOffset.x < 0) { this.avatarTemplatePosition.x = Math.abs(mountableOffset.x); }
            if (mountableOffset.y < 0) { this.avatarTemplatePosition.y = Math.abs(mountableOffset.y); }

            for (var cell = 1; cell >= 0; cell--) {
                this.selectedCell = cell;
                this.movePixels(
                        this.avatarTemplatePosition.x + mountableOffset.x,
                        this.avatarTemplatePosition.y + mountableOffset.y,
                        true);
            }
        }
        
        this.updateLivePreview();
        this.handleUserScriptEditorShowingAndGeneralPositioning();
        this.doCloneContents = false;
        
        if (this.data && this.data.type == 'multithing') {
            if ( confirm( 'clone contents too?'.toUpperCase() ) ) {
                this.doCloneContents = true;
            }
        }
    },
    
    dynamicThingFinishedRound: function() {
        if ( !(ig.game.alertDialog && ig.game.alertDialog.isOpen) ) {
            this.updateLivePreview();
        }
    },

    moveToBottomCenter: function() {
        var limits = this.getLimitsRectangle();
        var size = this.types[this.data.type].tileSize;
        var offsetX = Math.round( size.width / 2 - (limits.x2 - limits.x1) / 2 ) - 1;
        var offsetY = size.height - limits.y2 - 1;
        this.movePixelsAllCells(offsetX, offsetY);
    },

    moveToCenter: function() {
        var limits = this.getLimitsRectangle();
        var size = this.types[this.data.type].tileSize;
        var offsetX = Math.round( size.width / 2 - (limits.x2 - limits.x1) / 2 ) - 1;
        this.movePixelsAllCells(offsetX, 0);
    },

    drawFillPreventBorderIfNeeded: function(drawColor, originColor, newColor) {
        var borderColor = this.transparentIndex;
        if (drawColor) {
            for (var i = 0; i < this.maxColors; i++) {
                if (i != originColor && i != newColor && i != this.transparentIndex) {
                    borderColor = i;
                    break;
                }
            }
        }

        if (this.data.type == 'viewable' && this.data && this.data.pixels && this.data.pixels[0]) {
            var minX = 8, minY = 8;
            var maxX = minX + 20, maxY = minY + 20;
            for (var x = minX; x <= maxX; x++) {
                for (var y = minY; y <= maxY; y++) {
                    if (x == minX || x == maxX || y == minY || y == maxY) {
                        this.data.pixels[0][x][y] = borderColor;
                    }
                }
            }

        }
    },

    pixelHasBeenDrawnInAnyCell: function() {
        var hasBeen = false;      
        if (this.data && this.data.pixels) {
            for (var cell = 0; cell < this.data.pixels.length; cell++) {
                var hasBeenDrawnInThisCell = this.pixelHasBeenDrawn(cell);
                if (hasBeenDrawnInThisCell) {
                    hasBeen = true;
                    break;
                }
            }
        }
        return hasBeen;
    },

    removeEmptyOptionalCells: function() {
        this.optionalCellCount = this.optionalCellCountMax;
        for (var cell = this.data.pixels.length - 1; cell >= 2; cell--) {
            if ( this.pixelHasBeenDrawn(cell) ) { break; }
            this.optionalCellCount--;
        }
    },

    showInputBox: function() {
        jQuery('#' + this.inputBoxId).show();
    },

    hideInputBox: function() {
        jQuery('#' + this.inputBoxId).hide();
    },

    saveDataEmergencyBackup: function() {
        var dataString = JSON.stringify(this.data);
        ig.game.localStorageManager.setItem('creatorEmergencyBackupData', dataString);
    },

    getDataFromEmergencyBackupIfNeeded: function() {
        var dataString = localStorage.getItem('creatorEmergencyBackupData');
        var data = null;
        if (dataString != null && dataString != undefined && dataString != '') {
            data = JSON.parse(dataString);
        }
        return data;
    },

    clearEmergencyBackup: function() {
        localStorage.removeItem('creatorEmergencyBackupData');
    },

    getValidAttributes: function(baseType, unsafeAttributes) {
        var attributes = null;

        if (unsafeAttributes instanceof Array) {
            var attributesForBaseType = ig.game.attributesManager.info[ this.types[this.data.type].key ];
            if (attributesForBaseType) {
    
                for (var i = 0; i < unsafeAttributes.length; i++) {
                    var unsafeAttribute = unsafeAttributes[i];
                    if (unsafeAttribute) {
                        if (attributesForBaseType[unsafeAttribute]) {
                            if (!attributes) { attributes = []; }
                            attributes.push(unsafeAttribute);
                        }
                        else {
                            attributes = null;
                            break;
                        }
                    }
                }
    
            }
        }

        return attributes;
    },

    getRepresentativeRgba: function(colors, pixels) {
        var getIndexOfHighestValueInArray = function(arr) {
            var bestIndex = 0;
            var max = arr.length;
            for (var i = 1; i < max; i++) {
                if (!arr[bestIndex] || arr[i] > arr[bestIndex]) {
                    bestIndex = i;
                }
            }
            return bestIndex;
        };
    
        var amountByIndex = [];
        var cell = 0;
        var maxX = pixels[cell].length, maxY = pixels[cell][0].length;
        for (var x = 0; x < maxX; x++) {
            for (var y = 0; y < maxY; y++) {
                var index = pixels[cell][x][y];
                if (colors[index].alpha >= .5) {
                    if (!amountByIndex[index]) { amountByIndex[index] = 0; }
                    amountByIndex[index]++;
                }
            }
        }

        var bestIndex = getIndexOfHighestValueInArray(amountByIndex);
        return colors[bestIndex];
    },

    getCreateColorIndexByRgba: function(rgba) {
        var index = null;
        for (var i = 0; i < this.maxColors && index == null; i++) {
            if (i != this.transparentIndex) {
                if ( this.rgbasAreSame(rgba, this.data.colors[i]) || this.rgbasAreBothNearBlack(rgba, this.data.colors[i]) ) {
                    index = i;
                }
            }
        }

        if (index == null) {
            var defaultColor = this.getDefaultColor();
            for (var i = 0; i < this.maxColors && index == null; i++) {
                if (i != this.transparentIndex) {
                    if ( this.rgbasAreSame(defaultColor, this.data.colors[i]) ) {
                        this.data.colors[i] = {r: rgba.r, g: rgba.g, b: rgba.b, alpha: rgba.alpha};
                        index = i;
                    }
                }
            }
        }

        if (index == null) { index = 0; }
        return index;
    },
    
    handleCloningOfItemIfOk: function(itemId, base, optionalName) {
        ig.game.sounds.pickup.play();
        if (!this.isRunning) {
            this.launch();
            this.mode = 'cloneOld';
        }
        ig.game.itemsManager.retrieveItemAndSendToPainter(itemId,
                null, null, optionalName, ig.game.isDraggingTilePlacement.base);
        if (ig.game.panelSet.tabState != 2) { ig.game.panelSet.setTabState(2); }
    },

   imageToCanvas: function(image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return canvas;
    },

    getEmptyTileData: function() {
        /*
         name: 'thing'
         type: 'deadlyMoving' (or externally: 'DEADLYMV')
         direction: null or 0 - 3
         colors:
             [0] {r: 0, g: 0, b: 0, alpha: 1}
             ...
             [9]
         pixels[cell] [x][y]:
             [0]
                 [0]...[18]
                 ...
             [18]
         prop: {
            musicData: {...},
            attributes: [...]
        }
        */

        var data = {
            name: null,
            type: null,
            direction: null,
            colors: this.getDefaultColors(),
            pixels: [],
            prop: { musicData: null, attributes: [], noteDelayMS: this.noteDelayMSDefault }
        };
        
        for (var i = 0; i < ig.game.maxCellsMulti; i++) {
            data.pixels[i] = this.getPixelMap();
        }
        
        return data;
    },

    toMoreVerboseColorStructure: function(colors) {
        for (var i = 0; i < colors.length; i++) {
            colors[i] = {red: colors[i].r, green: colors[i].g, blue: colors[i].b, alpha: colors[i].alpha};
        }
        return colors;
    },
    
    toLessVerboseColorStructure: function(colors) {
        for (var i = 0; i < colors.length; i++) {
            if (colors[i]) {
                colors[i] = {r: colors[i].red, g: colors[i].green, b: colors[i].blue, alpha: colors[i].alpha};
            }
        }
        return colors;
    },
    
    getDataForUserScriptEditor: function() {
        var data = ig.game.cloneObject(this.data);
        this.clearUnneededCells(data);
        this.removeNullCells(data);
        
        var input = {};
        input.name = data.name ? data.name.toLowerCase() : '';

        if (data.type) {
            var base = this.types[data.type].key;
            input.type = ig.game.brainManager.getPublicType(base);
        }
        
        input.cells = data.pixels;
        input.colors = this.toMoreVerboseColorStructure(data.colors);

        input.text = null;
        if (this.data.type == 'dynamicThing') {
            input.text = data.prop.text ? data.prop.text : '';
        }
        else if (this.data.type == 'readable' && data.prop.textData) {
            input.text = data.prop.textData ? data.prop.textData : '';
        }

        input.info = this.getUserScriptInfoData();
        return input; 
    },
    
    userScriptEditorRunStarted: function(code) {
        if (this.data.type == 'changer') {
            var input = this.getDataForUserScriptEditor();
            var self = this;
            ig.game.userScriptManager.getResultByCode(code, input, 'change', function (data) {
                if (!data.internal_error) {
                    var issue = self.userScriptEditorReturnsData(data);
                    if (issue) {
                        var startPhrase = data && data.feedback ? '' : 'Oops... ';
                        ig.game.alertDialog.open(startPhrase + issue, null, null, null, null, true);
                    }
                    self.updateAll();
                }
                else {
                    if (ig.game.userScriptEditor) {
                        ig.game.userScriptEditor.showError(data.internal_error.message,
                                data.internal_error.lineNumber, data.internal_error.columnNumber, true);
                    }
                }
            });
        }
        
        return false;
    },
    
    getUserScriptInfoData: function() {
        return {
                selectedIndex: this.selectedColor,
                secondSelectedIndex: this.secondaryColorIndex,
                selectedCell: this.selectedCell,
                transparentIndex: 11,
                nameMaxLength: ig.game.validations.itemName.maxLength
                };
    },
    
    userScriptEditorReturnsData: function(data) {
        var issue = null;
        
        if (data.feedback && typeof data.feedback === 'string') {
            issue = data.feedback;
        }
        else {
            if (data.cells) {
                var cells = ig.game.cloneObject(data.cells);
                
                var usesFullColor = cells[0] && cells[0][0] && cells[0][0][0] !== undefined &&
                        typeof cells[0][0][0] === 'object';
                if (usesFullColor) {
                    data.colors = this.getExtractedColors(cells, this.maxColors, this.transparentIndex);
                    cells = this.getCellsAsPalette(cells, data.colors, this.transparentIndex);
                }

                cells = this.cleanItemCellsArray( cells, this.getTypeFromKey(this.data.type) );
                if (cells) {
                    this.data.pixels = cells;
                }
                else {
                    issue = 'Invalid cells were returned';
                    window.consoleref.log(issue, data.cells);
                }
            }
            
            if ( !issue && data.colors && Array.isArray(data.colors) ) {
                var colors = ig.game.cloneObject(data.colors);
                
                for (var i = 0; i < this.maxColors; i++) {
                    if ( !colors[i] ) { colors[i] = {red: 255, green: 255, blue: 255, alpha: 1}; }
                }

                colors = this.toLessVerboseColorStructure(colors);
                colors = this.cleanItemColorArray(colors);
                if (colors) {
                    this.data.colors = colors;
                    this.data.colors[this.transparentIndex] = this.getDefaultColor(this.transparentIndex);
                }
                else {
                    issue = 'Invalid colors were returned';
                    window.consoleref.log(issue, data.colors);
                }
            }
            
            if (!issue && data.name && typeof data.name === 'string') {
                data.name = data.name.toLowerCase();
                data.name = ig.game.validations.itemName.clean(data.name);
                if (data.name) {
                    this.data.name = data.name;
                }
                else {
                    issue = 'An invalid name was returned';
                    window.consoleref.log(issue, data.name);
                }
            }

            if (!issue && data.text && typeof data.text === 'string') {
                if (this.data.type == 'dynamicThing') {
                    if (data.text.length > this.dynamicTextMaxLength) {
                        data.text = data.text.substr(0, this.dynamicTextMaxLength);
                    }
                    this.data.prop.text = data.text;
                }
                else if (this.data.type == 'mift') {
                    if (data.text.length > this.miftTextMaxLength) {
                        data.text = data.text.substr(0, this.miftTextMaxLength);
                    }
                    this.data.prop.text = data.text;
                }
                else if (this.data.type == 'readable') {
                    var maxLength = 1000000;
                    if (data.text.length > maxLength) {
                        data.text = data.text.substr(0, maxLength);
                    }
                    this.data.prop.textData = data.text;
                }
            }

            if (issue) { ig.game.sounds.shortWhoosh.play(); }
       }
        
        return issue;
    },
    
    cleanItemCellsArray: function(unsafeCells, baseType) {
        // shared between client's painter.js and server's validationutils.js
    
        var limit = function(value, min, max) {
            return Math.min( max, Math.max(min, value) );
        };

        var baseType = this.types[this.data.type].key;
        var array = null;
        var minSizeAllowed = 2;
        var baseTypesWithAnimation = [
                'DECOANIM', 'FLEXIBLE', 'LIVELY', 'LIVANIM', 'LIVMOV', 'HARMANIM', 'PORTAL', 'PORTALDIR', 'DECOACT', 'GATHER',
                'DECOTCH', 'MOTION', 'THROWER', 'STACKWEAR', 'LIQUID', 'MNTGROUND', 'MNTAIR', 'MNTWATER',
                'VIEWABLE', 'DYNATHING', 'GLOW', 'EMITTER', 'AIMABLE', 'INTERACT', 'INTERMOT', 'SPARKLING', 'DECOFB', 'MUSICSHEET',
                'HOLDER', 'FARBACK'
                ];
        var baseTypesWithMultiAnimation = ['STACKWEARB'];
        var baseTypesWithOptionalCells = ['VIEWABLE', 'DYNATHING', 'MUSICSHEET', 'FARBACK'];
        var baseTypesSemiBig = ['LIVING', 'LIVANIM', 'LIVMOV', 'STACKWEARB', 'MOTION', 'INTERACT', 'INTERMOT',
                'DYNATHING', 'HOLDER'];
        var baseTypesBig = ['MNTGROUND', 'MNTAIR', 'MNTWATER', 'VIEWABLE', 'GLOW', 'DECOBIG',
                'PLACENAME', 'POINTER', 'MUSICSHEET', 'DECOFB', 'STACKWEAR', 'FARBACK'];
        var baseTypesVeryBig = ['DECOVBIG'];
        var isAnimated = baseTypesWithAnimation.indexOf(baseType) >= 0;
        var isMultiAnimated = baseTypesWithMultiAnimation.indexOf(baseType) >= 0;

        var maxSizePerCell = {x: 19, y: 19};
        if (baseType == 'MUSICSHEET')                       { maxSizePerCell = {x: 32, y: 36}; }
        else if ( baseTypesSemiBig.indexOf(baseType) >= 0 ) { maxSizePerCell = {x: 29, y: 29}; }
        else if ( baseTypesBig.indexOf(baseType) >= 0 )     { maxSizePerCell = {x: 38, y: 38}; }
        else if ( baseTypesVeryBig.indexOf(baseType) >= 0 ) { maxSizePerCell = {x: 57, y: 57}; }
        
        var cellCount = 1;
        if ( ['MOTION', 'INTERMOT', 'HOLDER'].indexOf(baseType) >= 0 ) {
            cellCount = 3;
        }
        else if ( ['MUSICSHEET', 'DYNATHING', 'HAPPENING'].indexOf(baseType) >= 0 ) {
            cellCount = Math.max( 1, Math.min(unsafeCells.length, 9) );
        }
        else if (baseType == 'FARBACK') {
            cellCount = Math.max( 1, Math.min(unsafeCells.length, this.farBackCellsMax) );
        }
        else if (baseTypesWithOptionalCells.indexOf(baseType) >= 0) {
            cellCount = Math.max( 2, Math.min(unsafeCells.length, 6) );
        }
        else if (isAnimated) {
            cellCount = 2;
        }
        else if (isMultiAnimated) {
            cellCount = 9;
        }

        if ( Array.isArray(unsafeCells) &&
                (unsafeCells.length == 1 || unsafeCells.length == 2 || unsafeCells.length == 9 || unsafeCells.length == cellCount) &&
                unsafeCells[0] && unsafeCells[0][0] !== undefined && unsafeCells[0][0][0] !== undefined ) {
            array = [];
            
            var width = limit( unsafeCells[0].length, minSizeAllowed, maxSizePerCell.x );
            var height = limit( unsafeCells[0][0].length, minSizeAllowed, maxSizePerCell.y );

            for (var cell = 0; cell < cellCount && array != null; cell++) {
                if ( Array.isArray(unsafeCells[cell]) ) {
                    array[cell] = [];

                    for (var x = 0; x < width; x++) {
                        array[cell][x] = [];
                        for (var y = 0; y < height; y++) {
                            array[cell][x][y] = 0;
                            if (
                                    unsafeCells[cell][x] != undefined && unsafeCells[cell][x][y] != undefined &&
                                    unsafeCells[cell][x] != null && unsafeCells[cell][x][y] != null &&
                                    this.isNumber(unsafeCells[cell][x][y]) ) {
                                array[cell][x][y] = parseInt(unsafeCells[cell][x][y]);
                            }
                        }
                    }

                }
                else {
                    array = null;
                }
            }
        }

        return array;
    },

    isValidRgb: function(colorValue) {
        return colorValue != undefined && colorValue != null && this.isNumber(colorValue) && colorValue >= 0 && colorValue <= 255;
    },

    cleanItemColorArray: function(unsafeArray) {
        // shared between client and server
        var array = null;

        if ( Array.isArray(unsafeArray) && unsafeArray.length <= this.maxColors ) {

            array = [];
            for (var i = 0; array != null && i < unsafeArray.length; i++) {
                array[i] = {r: 0, g: 0, b: 0, alpha: 1};
                var color = unsafeArray[i];

                if ( color && this.isValidRgb(color.r) && this.isValidRgb(color.g) && this.isValidRgb(color.b) ) {
                    array[i].r = parseInt(color.r);
                    array[i].g = parseInt(color.g);
                    array[i].b = parseInt(color.b);
                    if ( !(color.alpha == undefined || color.alpha == null) && color.alpha >= 0 && color.alpha <= 1 ) {
                        array[i].alpha = parseFloat( parseFloat(color.alpha).toFixed(2) );
                    }
                }
                else {
                    array = null;
                }

            }

        }

        return array;
    },
    
    userScriptEditorOpenHelp: function() {
        if (this.data.type == 'changer') {
            ml.Misc.openUrl('/info-changer');
        }
    },
    
    getCellsAsPalette: function(cells, colors, transparentIndex) {
        var width = cells[0].length;
        var height = cells[0][0].length;

        for (var cell = 0; cell < cells.length; cell++) {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var rgba = cells[cell][x][y];
                    var index;
                    if (rgba.alpha == 0) {
                        index = transparentIndex;
                    }
                    else {
                        index = this.getNearestColorIndexByRgba(rgba, colors);
                    }
                    cells[cell][x][y] = index;
                }
            }
        }
        return cells;
    },

    getNearestColorIndexByRgba: function(rgba, colors) {
        var bestIndex = -1;
        var bestDistance = null;
        
        for (var i = 0; i < colors.length; i++) {
            var thisRgba = colors[i];
            if (thisRgba) {
                var distance = Math.sqrt( Math.abs(thisRgba.red - rgba.red) ) +
                               Math.sqrt( Math.abs(thisRgba.green - rgba.green) ) +
                               Math.sqrt( Math.abs(thisRgba.blue - rgba.blue) ) + 
                               Math.abs(thisRgba.alpha - rgba.alpha) * 10;
                if (bestDistance === null || distance < bestDistance) {
                    bestIndex = i;
                    bestDistance = distance;
                }
            }
        }

        return bestIndex;
    },

    getExtractedColors: function(cells, maxColors, transparentIndex) {
        var colorCount = this.getColorCount(cells);
        var topColors = [];
        while (topColors.length < maxColors - 1 &&
                ml.Misc.getObjectLength(colorCount) >= 1) {
            var highest = null;
            var highestKey = null;
            for (var key in colorCount) {
                if (highest == null || colorCount[key] > highest) {
                    highest = colorCount[key];
                    highestKey = key;
                }
            }
            var rgba = highestKey.split('_');
            var rgbaData = {
                    red: parseInt(rgba[0]),
                    green: parseInt(rgba[1]),
                    blue: parseInt(rgba[2]),
                    alpha: parseFloat(rgba[3])
                    };
            if (topColors.length == transparentIndex) {
                topColors.push({red: 0, green: 0, blue: 0, alpha: 0});
            }
            if (rgbaData.alpha > 0) {
                topColors.push(rgbaData);
            }
            delete colorCount[highestKey];
        }
        topColors[transparentIndex] = {red: 0, green: 0, blue: 0, alpha: 0};
        
        for (var i = 0; i < maxColors; i++) {
            if ( !topColors[i] ) {
                topColors[i] = {red: 255, green: 255, blue: 255, alpha: 1};
            }
        }
        
        return topColors;
    },

    getColorCount: function(cells) {
        var colorCount = {};
        var width = cells[0].length;
        var height = cells[0][0].length;

        for (var cell = 0; cell < cells.length; cell++) {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var rgba = cells[cell][x][y];
                    var key = rgba.red + '_' +
                              rgba.green + '_' +
                              rgba.blue + '_' +
                              rgba.alpha;
                    if (colorCount[key] === undefined) {
                        colorCount[key] = 0;
                    }
                    colorCount[key]++;
                }
            }
        }
        return colorCount;
    },
    
    applyChangerChange: function(changerItemId) {
        if (this.data.type) {
            this.recordDataHistory();
            this.data.prop.changerId = changerItemId;
            
            var self = this;
            this.playChangerSound(changerItemId);
            
            var input = this.getDataForUserScriptEditor();
            ig.game.userScriptManager.getResultByItemId(changerItemId, input, 'change', function (resultData) {
                if (!resultData.internal_error) {
                    var issue = self.userScriptEditorReturnsData(resultData);
                    if (issue) {
                        var startPhrase = resultData && resultData.feedback ? '' : 'Oops... ';
                        ig.game.alertDialog.open(startPhrase + issue, null, null, null, null, true);
                    }
                    self.updateAll();
                }
                else {
                    self.userScriptEditorShowError(resultData, changerItemId);
                }
            });
        }
        else {
            ig.game.alertDialog.open('Please set a type first');
        }
    },

    playChangerSound: function(changerItemId) {
        var changerItem = ig.game.itemCache.getItemBasic(changerItemId, 'ui_pnt10');
        if (changerItem) {
            if (changerItem && changerItem.soundId) {
                ig.game.sounds.playFromLibrary(changerItem.soundId);
            }
            else {
                ig.game.sounds.whoosh.play();
            }
        }
    },
    
    applyChangerChangeAndSave: function(sourceItemId, changerItemId) {
        var self = this;
        this.playChangerSound(changerItemId);
        var typesWithTooManyImplicationsToClone = ['WRITABLE', 'INTERACT', 'BRAIN', 'CHANGER', 'FARBACK'];
        
        var retrieveItem_Promise = ig.game.httpApi.getItemImageDataFromPng_P(sourceItemId);
        retrieveItem_Promise.done(function(data){
            if (data && data.imageData && data.name) {
                var isCreator = ig.game.ourPlayer.remoteId == data.creator;
                var isClonable = data.prop && data.prop.attributes &&
                        data.prop.attributes.indexOf('clonable') >= 0;

                if ( (isCreator || isClonable) &&
                        ig.game.typesWithExternalBigData.indexOf(data.base) === -1 &&
                        typesWithTooManyImplicationsToClone.indexOf(data.base) === -1 ) {

                    self.data = {
                        id: data.id,
                        name: data.name,
                        type: data.base,
                        direction: data.rotation,
                        prop: data.prop ? ig.game.cloneObject(data.prop) : {},
                        colors: data.imageData.colors,
                        pixels: data.imageData.pixels
                    };
                    self.data.prop.clonedFrom = sourceItemId;
                    self.data.prop.changerId = changerItemId;
                    if (self.data.prop) {
                        ig.game.attributesManager.uncompressData(self.data);
                    }
                    
                    self.data.type = self.getTypeFromKey(self.data.type);

                    self.initSettingValues();

                    var input = {};
                    input.name = data.name.toLowerCase();
                    input.type = ig.game.brainManager.getPublicType(data.base);
                    input.cells = data.imageData.pixels;
                    input.colors = self.toMoreVerboseColorStructure(data.imageData.colors);

                    input.text = null;
                    if (self.data.type == 'dynamicThing') {
                        input.text = data.prop.text ? data.prop.text : '';
                    }
                    else if (self.data.type == 'readable' && data.prop.textData) {
                        input.text = data.prop.textData ? data.prop.textData : '';
                    }

                    input.info = self.getUserScriptInfoData();
                
                    ig.game.userScriptManager.getResultByItemId(changerItemId, input, 'change', function (resultData) {
                        if (!resultData.internal_error) {
                            var issue = self.userScriptEditorReturnsData(resultData);
                            if (issue) { self.userScriptEditorShowError(issue, changerItemId, Boolean(resultData && resultData.feedback)); }
                            else { self.createIfValid(); }
                        }
                        else {
                            self.userScriptEditorShowError(resultData, changerItemId);
                        }
                    });
                }
                else {
                    ig.game.sounds.nocando.play();
                }
            }
        });
    },
    
    userScriptEditorShowError: function(resultDataOrMessage, changerItemId, isFeedback) {

        ig.game.itemsManager.getCreatorInfo_P(changerItemId, this).done(function(data) {
            var creatorName = data && data.name;
            var creatorId   = data && data.id;

            var message;
            if (resultDataOrMessage.internal_error) {
                message = 'line ' + resultDataOrMessage.internal_error.lineNumber + ', ' +
                    resultDataOrMessage.internal_error.message.toLowerCase();
            }
            else {
                message = String(resultDataOrMessage).toLowerCase();
            }

            var issuePhrase = isFeedback ? 'says' : 'has an issue';
            var intro = 'this changer ' + issuePhrase;
            if (creatorId != ig.game.ourPlayer.remoteId) {
                intro = 'this changer by ' + creatorName + ' ' + issuePhrase;
            }
            ig.game.ourPlayer.say(intro);
            setTimeout(function () {
                ig.game.ourPlayer.say('"' + message + '"');
            }, 1500);
        });
        
    },
    
    addMiftToId: function(playerId) {
        if (playerId != ig.game.ourPlayer.remoteId) {
            var self = this;
            var ignoreCanMiftCheckOnLocal = true;
            if (ignoreCanMiftCheckOnLocal && ig.game.isLocal) {
                self.data.prop.toId = playerId;
                ig.game.friendsDialog.close();
                ig.game.sounds.success.play();
                self.updateAll();
            }
            else {
                ig.game.httpApi.getCanIMiftUser_P(playerId).done(function(data){
                    if (data && data.canMift) {
                        self.data.prop.toId = playerId;
                        ig.game.friendsDialog.close();
                        ig.game.sounds.success.play();
                        self.updateAll();
                    }
                    else {
                        ig.game.alertDialog.openSmall('You already Mifted this person recently, please wait a bit');
                    }
                });
            }
        }
        else {
            ig.game.sounds.nocando.play();
        }
    },

    updateFromMain: function() {
        if (this.isRunning && this.data) {
            switch (this.data.type) {
            
                case 'farBack':
                    if ( jQuery('#canvas').is(':hover') &&
                            ig.game.alertDialog.isOpen && ig.game.alertDialog.contextId == 'farBackText' &&
                            ig.input.pressed('click') ) {
                        var pos = this.getCursorPosRelativeToFarBack();
                        var toInsert = pos.x + ' ' + pos.y + "\r";
                        ig.game.alertDialog.insertAtCursorPos(toInsert);
                        this.updateLivePreview();
                    }
                    break;
            }

        }
    },
    
    draw: function() {
        if (this.isRunning && this.data) {
            switch (this.data.type) {
                
                case 'farBack':
                    if ( jQuery('#canvas').is(':hover') ) {
                        var pos = this.getCursorPosRelativeToFarBack();
                        var label = pos.x + ' ' + pos.y;
                        ig.system.context.globalAlpha = .5;
                        ig.game.blackWhiteFont.draw(label, ig.input.mouse.x, ig.input.mouse.y - 9,
                                ig.Font.ALIGN.CENTER);
                        ig.system.context.globalAlpha = 1;
                    }
                    break;

            }
        }
    },
    
    getCursorPosRelativeToFarBack: function() {
        var livePreviewPos = this.getLivePreviewEntitySpawnPosition();
        var mousePos = ig.game.mouseManager.getGamePos();
        var pos = {};
        pos.x = Math.round(mousePos.x - livePreviewPos.x - ig.game.tileSizeHalf);
        pos.y = Math.round(mousePos.y - livePreviewPos.y - 5);
        return pos;
    },

});

});
