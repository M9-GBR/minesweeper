const ceil = Math.ceil

export default class Camera {
    _x = 0
    _y = 0

    set x(num) {
        this._x = num
    }
    get x() {
        return this._x
    }
    set y(num) {
        this._y = num
    }
    get y() {
        return this._y
    }

    width = 0
    height = 0

    _zoom = 1
    get zoom() {
        return this._zoom
    }
    set zoom(num) {
        this._zoom = num
        this._zoom = Math.max(this.app.settings.minZoom, this._zoom)
        this._zoom = Math.min(this.app.settings.maxZoom, this._zoom)
        this.app.audio.resetPos()
    }
    origin = { x: 0, y: 0 }
    locked = { x: false, y: false }

    get scrollW() {
        return ceil(this.width / this.zoom)
    }
    get scrollH() {
        return ceil(this.height / this.zoom)
    }
    get startX() {
        return ceil(this.x - (this.scrollW * this.origin.x))
    }
    get startY() {
        return ceil(this.y - (this.scrollH * this.origin.y))
    }
    get endX() {
        return this.startX + this.scrollW
    }
    get endY() {
        return this.startY + this.scrollH
    }
    get centerX() {
        return this.startX + (this.scrollW / 2)
    }
    get centerY() {
        return this.startY + (this.scrollH / 2)
    }

    get obj() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom
        }
    }

    constructor(app) {
        this.app = app
    }

    setOriginSafe(oX, oY) {
        let nX = this.startX + (oX * this.scrollW),
            nY = this.startY + (oY * this.scrollH)

        this.x = nX
        this.y = nY

        this.origin.x = oX
        this.origin.y = oY
    }

    moveCounters = []
    moveTo(x, y, duration = 500) {
        this.stopMoving()

        let ease = "outSine",
            steps = Math.round(1000 / this.curDelta),
            config = { duration, ease, steps }

        let xC = this.app.addCounter({
            from: this.x,
            to: x,
            ...config,
            onUpdate: c => this.x = Math.floor(c.value)
        }).start(),
            yC = this.app.addCounter({
                from: this.y,
                to: y,
                ...config,
                onUpdate: c => this.y = Math.floor(c.value)
            }).start()

        this.moveCounters.push(xC, yC)
    }

    stopMoving() {
        this.moveCounters.forEach(c => c.stop())
        this.moveCounters = []
    }

    update(delta) {
        this.curDelta = delta

        let gW = this.app.sqrSize * this.app.curGame.cols * this.zoom,
            gH = this.app.sqrSize * this.app.curGame.rows * this.zoom

        if (gW < this.width) {
            this.origin.x = .5
            this.x = gW / this.zoom / 2
        } else {
            this.setOriginSafe(0, this.origin.y)

            if (this.startX < 0) {
                this.x = 0
            } else if (this.endX > gW / this.zoom) {
                this.x = (gW / this.zoom) - this.scrollW
            }
        }

        if (gH < this.height) {
            this.origin.y = .5
            this.y = gH / this.zoom / 2
        } else {
            this.setOriginSafe(this.origin.x, 0)

            if (this.startY < 0) {
                this.y = 0
            } else if (this.endY > gH / this.zoom) {
                this.y = (gH / this.zoom) - this.scrollH
            }
        }

        this.locked.x = gW < this.width
        this.locked.y = gH < this.height
    }
}
