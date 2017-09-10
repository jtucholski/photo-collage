HotspotCanvas = function (hotspots, canvas_id, backgroundImage, eventCallback) {

    this.canvas = new fabric.Canvas(canvas_id);


    this.setBackground(backgroundImage);
    this.setHotspots(hotspots);
    this.setEventHandlers();
    

    this.eventCallback = eventCallback;
}

HotspotCanvas.prototype = {


    setBackground: function (backgroundImage) {
        this.addImage(backgroundImage, { selectable: false }, function (img) {
            img.sendToBack();
        });
    },

    addImageToHotspot: function (hotspotRect, url) {
              
        hotspotRect.hasImage = true;        

        this.addImage(url,
            this.getImagePropertiesForHotspot(hotspotRect), 
            function (img) {                                
                if (hotspotRect.width > hotspotRect.height) {
                    img.scaleToWidth(hotspotRect.width);
                }
                else {
                    img.scaleToHeight(hotspotRect.height);
                }
            });
    },

    

    downloadCanvas: function () {        

        const downloadFileName = "skip-a-beat.png";

        // Convert a dataUrl object to a binary object
        var dataURLtoBlob = function (dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        // Get the Object Url
        var imgData = this.canvas.toDataURL({
            format: 'png',
            multiplier: 4
        });
        var strDataURI = imgData.substr(22, imgData.length);
        var blob = dataURLtoBlob(imgData);
        var objurl = URL.createObjectURL(blob);

        // Bind the Object Url to <a> and click
        var link = document.createElement("a");
        link.download = "helloWorld.png";
        link.href = objurl;
        link.click();

    },

    

    setEventHandlers: function () {
        var _this = this;

        var disableScroll = function () {            
            _this.canvas.allowTouchScrolling = false;
        };

        var enableScroll = function () {
            _this.canvas.allowTouchScrolling = true;
        };

        this.canvas.on('object:moving', disableScroll);
        this.canvas.on('object:scaling', disableScroll);
        this.canvas.on('object:rotating', disableScroll);
        this.canvas.on('mouse:up', enableScroll);


        var objects = this.canvas.getObjects('rect');
        objects.forEach(function (rect) {
            
            rect.on('mouseup', function () {

                _this._rect = this;
                var imageSelector = $("#imageselector");
                imageSelector.click();               
                

            }, this);
        }, this);

        $("#imageselector").on("change", function(e) { 
            if (this.files) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    _this.addImageToHotspot(_this._rect, e.target.result);     
                    _this.eventCallback({
                        hotspotsRemaining: _this.getHotspotsWithoutImages(),
                        hotspots: _this.canvas.getObjects('rect').length
                    })                       
                }
                reader.readAsDataURL(this.files[0]);
            }
        });

    },

  
    

    setHotspots: function (hotspots) {
        for (var i = 0; i < hotspots.length; i++) {

            var hotspot = hotspots[i];
            
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
            clipSpot.hotspot = hotspot;
        }
    },

    
    addImage: function (imageUrl, properties, callback) {
        

        loadImage(imageUrl, function(img) { 

            var image = new fabric.Image(img);
            if (properties !== undefined) { 
                for(var p in properties) { 
                    image.set(p, properties[p]);
                }
            }

            this.canvas.add(image);

            if (callback !== undefined) { 
                callback(image);
            }    
        }.bind(this), { canvas: true});

        // var imageObj = new Image();
        
        // imageObj.onload = function() { 

            

        //     var image = new fabric.Image(imageObj);

        //     if (properties !== undefined) { 
        //         for(var p in properties) { 
        //             image.set(p, properties[p]);
        //         }
        //     }

        //     _this.canvas.add(image);

        //     if (callback !== undefined) { 
        //         callback(image);
        //     }
        // }
        // imageObj.crossOrigin = 'anonymous';
        // imageObj.src = imageUrl;

        // fabric.Image.fromURL(imageUrl, function (img) {

        //     if (properties !== undefined) {
        //         for (var p in properties) {
        //             img.set(p, properties[p]);
        //         }
        //     }

        //     _this.canvas.add(img);

        //     if (callback !== undefined) {
        //         callback(img);
        //     }
        // });
    },

    // HELPER METHODS

    getImagePropertiesForHotspot: function(hotspotRectangle){ 
        return {
            originX: 'left',
            originY: 'top',
            lockUniScaling: true,
            lockRotation: false,
            lockScalingFlip: true,
            left: hotspotRectangle.hotspot.x,
            top: hotspotRectangle.hotspot.y,
            clipTo: function (ctx) {
                var retina = this.canvas.getRetinaScaling();
                ctx.save();
                ctx.setTransform(retina, 0, 0, retina, 0, 0);
                ctx.rect(
                    hotspotRectangle.left,
                    hotspotRectangle.top,
                    hotspotRectangle.width,
                    hotspotRectangle.height);
                ctx.restore();
            }.bind(this),

        };
    },

    getHotspotsWithoutImages: function () {
        var rects = this.canvas.getObjects('rect');
        return rects.filter((rect) => {
            return rect.hasImage === undefined || rect.hasImage === false;
        }).length;
    },

}