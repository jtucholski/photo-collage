Hotspot = function (width, height, x, y) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
}

Hotspot.prototype = {

    containsCoordinate: function (x, y) {
        return (y > this.y && y < (this.y + this.height)) &&
            (x > this.x && x < (this.x + this.width));
    },

    setImage: function (image) {
        image.offsetX = 0;
        image.offsetY = 0;
        image.zoom = 0;
        this.image = image;
    }

}