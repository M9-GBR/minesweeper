let pi = Math.PI,
    cos = Math.cos,
    sin = Math.sin

export default class Counter extends EventTarget {
    value = 0
    curTime = 0
    ease = "linear"

    easeFuncs = {
        linear: x => x,
        outSine: x => sin((x * pi) / 2),
        inSine: x => 1 - cos((x * pi) / 2),
        inOutSine: x => -(cos(pi * x) - 1) / 2
    }

    constructor(app, config) {
        super()

        this.app = app
        this.to = config.to
        this.from = config.from
        this.duration = config.duration
        this.ease = config.ease || "linear"
        this.steps = config.steps || 30
        this.onUpdate = config.onUpdate || (() => { })
        this.onComplete = config.onComplete || (() => { })
    }

    _updateEv = new CustomEvent("update", { detail: this })
    _completeEv = new CustomEvent("complete", { detail: this })
    start() {
        this.value = 0
        this.curTime = 0

        this.tE = this.app.addTimeEvent(() => {
            this.curTime += (this.duration / this.steps)

            this.value = (this.to - this.from) * this.easeFuncs[this.ease](this.curTime / this.duration) + this.from

            if (this.tE.loopsLeft == 0) {
                this.value = this.to
                this.onComplete(this)
                this.dispatchEvent(this._completeEv)
            }

            this.onUpdate(this)
            this.dispatchEvent(this._updateEv)
        }, this.duration / this.steps, this.steps)

        return this
    }

    stop() {
        if (this.tE) this.tE.stop()
    }
}
