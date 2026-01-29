export default class ScrollBar {
    alpha = 0
    hideCounter
    hideDelay

    constructor(app) {
        this.app = app
    }

    show() {
        this.alpha = 1
        this.hide()
    }

    hide() {
        if (this.hideDelay) this.hideDelay.stop()
        if (this.hideCounter) this.hideCounter.stop()

        this.hideDelay = this.app.addTimeEvent(() => {
            this.hideCounter = this.app.addCounter({
                from: 1,
                to: 0,
                duration: 500,
                onUpdate: c => {
                    this.alpha = c.value
                }
            }).start()
        }, 2000)
    }

    draw() {
        let ctx = this.app.ctx, color = '#0005', cam = this.app.camera,
            gW = this.app.curGame.cols * this.app.sqrSize,
            gH = this.app.curGame.rows * this.app.sqrSize,
            barSize = 5 / devicePixelRatio

        ctx.restore()
        ctx.save()
        ctx.fillStyle = color
        ctx.globalAlpha = this.alpha

        let maxW = cam.scrollW,
            barW = (cam.scrollW / gW) * cam.scrollW,
            barX = (cam.startX / gW) * cam.scrollW

        if (barW < maxW) {
            ctx.fillRect(cam.startX + barX, cam.startY, barW, barSize)
        }

        let maxH = cam.scrollH,
            barH = (cam.scrollH / gH) * cam.scrollH,
            barY = (cam.startY / gH) * cam.scrollH

        if (barH < maxH) {
            ctx.fillRect(cam.startX, cam.startY + barY, barSize, barH)
        }
    }
}