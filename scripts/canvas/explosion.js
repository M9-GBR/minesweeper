export default class ExplosionSprite {
    scale = 1
    alpha = 1

    get startX() {
        return this.x - (this.size * this.scale / 2)
    }
    get startY() {
        return this.y - (this.size * this.scale / 2)
    }
    get endX() {
        return this.startX + (this.size * this.scale)
    }
    get endY() {
        return this.startY + (this.size * this.scale)
    }

    constructor(app, x, y, frame = 1) {
        this.app = app
        this.size = app.sqrSize
        this.x = x
        this.y = y
        this.frame = frame
        this.app.explosions.push(this)
    }

    timeObjs = []
    explode() {
        this.timeObjs.forEach(o => {
            if (o) o.stop()
        })
        this.timeObjs = []

        this.alpha = 1

        let scaleVals = { start: .5, end: 2 },
            duration = 200,
            alphaDelay = 150

        let animCounter = this.app.addCounter({
            from: 0,
            to: 1,
            duration,
            onUpdate: c => {
                this.frame = Math.floor(c.value * 9)
                this.scale = c.value * (scaleVals.end - scaleVals.start) + scaleVals.start
            }
        }).start()

        let alphaDelayTimer = this.app.addTimeEvent(() => {
            let alphaCounter = this.app.addCounter({
                from: 1,
                to: 0,
                duration: duration - alphaDelay,
                onUpdate: c => this.alpha = c.value
            }).start()

            this.timeObjs.push(alphaCounter)
        }, alphaDelay)

        this.timeObjs.push(alphaDelayTimer, animCounter)

        this.app.audio.playSpatial("explosion", this.x, this.y)

        return this
    }

    destroy() {
        this.timeObjs.forEach(o => o.stop())
        this.app.explosions = this.app.explosions.filter(e => e != this)
    }

    draw() {
        let ctx = this.app.ctx,
            img = this.app.explosionImg,
            spriteW = img.width / 11

        ctx.restore()
        ctx.save()

        ctx.globalAlpha = this.alpha

        ctx.translate(this.x, this.y)
        ctx.scale(this.scale, this.scale)

        ctx.fillStyle = "black"

        ctx.drawImage(img, this.frame * spriteW, 0, spriteW, img.height, -this.size / 2, -this.size / 2, this.size, this.size)
    }
}