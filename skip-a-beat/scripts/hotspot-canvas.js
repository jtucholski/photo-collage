HotspotCanvas = function (hotspots, canvas_id, backgroundImage) {
    this.hotspots = hotspots;
    this.canvas = new fabric.Canvas(canvas_id);

    this.setBackground(backgroundImage);
    this.setHotspots();
    this.setEventHandlers();
}

HotspotCanvas.prototype = {

    setBackground: function (backgroundImage) {
        this.addImage(backgroundImage, { selectable: false }, function (img) {
            img.sendToBack();
        });
    },

    setEventHandlers: function () {
        var _this = this;
        var objects = this.canvas.getObjects('rect');
        objects.forEach(function (rect) {
            rect.on('mouseup', function () {
                if (_this.enabled) {
                    console.log('yes');
                    _this.enableHotspots(false);
                }
            }, this);
        }, this);

    },

    setHotspots: function () {
        for (var i = 0; i < this.hotspots.length; i++) {
            var hotspot = this.hotspots[i];
            var clipSpot = new fabric.Rect({
                originX: 'left',
                originY: 'top',
                left: hotspot.x,
                top: hotspot.y,
                height: hotspot.height,
                width: hotspot.width,
                fill: 'transparent',
                stroke: '#000',
                strokeWidth: 0,
                selectable: false,
            });

            this.canvas.add(clipSpot);
            hotspot.clip = clipSpot;
        }
    },

    /*
    * adds an image to the canvas
    * @imageUrl relative or global url of the image
    * @properties an object with the canvas properties to set on the image
    * @callback a callback function to invoke after the image has been added
    */
    addImage: function (imageUrl, properties, callback) {
        var _this = this;
        fabric.Image.fromURL(imageUrl, function (img) {
            _this.canvas.add(img);
            for (var p in properties) {
                img.set(p, properties[p]);
            }
            callback(img);
        });
    },

    getDataUrl: function () {
        return this.canvas.toDataURL();
    },

    enableHotspots: function (shouldEnable) {

        var strokeWidth = (shouldEnable) ? 1 : 0;

        this.enabled = shouldEnable;

        for (var i = 0; i < this.hotspots.length; i++) {
            this.hotspots[i].clip.set('strokeWidth', strokeWidth);
            this.hotspots[i].clip.bringToFront();            
        }
    }

}

function findByClipName(name) {
    return _(canvas.getObjects()).where({
        clipFor: name
    }).first()
}

var clipByName = function (ctx) {
    this.setCoords();
    var clipRect = findByClipName(this.clipName);
    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    ctx.save();

    var ctxLeft = -(this.width / 2) + clipRect.strokeWidth;
    var ctxTop = -(this.height / 2) + clipRect.strokeWidth;
    var ctxWidth = clipRect.width - clipRect.strokeWidth;
    var ctxHeight = clipRect.height - clipRect.strokeWidth;

    ctx.translate(ctxLeft, ctxTop);

    ctx.rotate(degToRad(this.angle * -1));
    ctx.scale(scaleXTo1, scaleYTo1);
    ctx.beginPath();
    ctx.rect(
        clipRect.left - this.oCoords.tl.x,
        clipRect.top - this.oCoords.tl.y,
        clipRect.width,
        clipRect.height
    );
    ctx.closePath();
    ctx.restore();
}

