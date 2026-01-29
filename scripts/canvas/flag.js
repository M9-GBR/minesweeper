export default class Flag {
    scale = 1

    rotation = 0
    angularVelocity = 0
    maxAngularVelocity = Infinity
    angularAcceleration = 0

    velocity = { x: 0, y: 0 }
    maxVelocity = { x: 10, y: 50 }
    acceleration = { x: 0, y: 0 }

    constructor(app, x, y) {
        this.app = app
        this.x = x
        this.y = y
        this.size = app.sqrSize
        this.app.flags.push(this)
    }

    update(delta) {
        let uM = this.app.fps / (1000 / delta)

        this.velocity.x += this.acceleration.x * uM
        this.velocity.y += this.acceleration.y * uM

        if (Math.abs(this.velocity.x) > this.maxVelocity.x) {
            this.velocity.x = this.maxVelocity.x * (Math.abs(this.velocity.x) == this.velocity.x ? 1 : -1)
        }

        if (Math.abs(this.velocity.y) > this.maxVelocity.y) {
            this.velocity.y = this.maxVelocity.y * (Math.abs(this.velocity.y) == this.velocity.y ? 1 : -1)
        }

        this.x += this.velocity.x * uM
        this.y += this.velocity.y * uM

        this.angularVelocity += this.angularAcceleration * uM

        if (Math.abs(this.angularVelocity) > this.maxAngularVelocity) {
            this.angularVelocity = this.maxAngularVelocity * (Math.abs(this.angularVelocity) == this.angularVelocity ? 1 : -1)
        }

        this.rotation += this.angularVelocity * uM
    }

    scaleCounter
    leave() {
        this.app.audio.play("unflag")
        this.velocity.y = -5
        this.acceleration.y = .1
        this.velocity.x = Math.random() * (3 + 3) - 3

        let arr = [0.01, -0.01]
        this.angularAcceleration = arr[Math.floor(Math.random() * arr.length)]
        this.maxAngularVelocity = 0.05

        this.scaleCounter = this.app.addCounter({
            duration: 2000,
            from: this.scale,
            to: 0,
            onUpdate: c => this.scale = c.value,
            onComplete: () => this.destroy()
        }).start()
    }

    destroy() {
        if (this.scaleCounter) this.scaleCounter.stop()
        this.app.flags = this.app.flags.filter(f => f != this)
    }

    draw() {
        let ctx = this.app.ctx

        ctx.restore()
        ctx.save()

        let w = this.app.sqrSize * .8,
            h = this.app.flagImg.height / this.app.flagImg.width * w

        ctx.translate(this.x, this.y)
        ctx.scale(this.scale, this.scale)
        ctx.rotate(this.rotation)
        ctx.drawImage(this.app.flagImg, -w / 2, -h / 2, w, h)
    }
}