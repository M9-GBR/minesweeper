export default class TimeEvent {
    constructor(cb, delay, loop = 1) {
        this.cb = cb
        this.delay = delay
        this.loop = loop

        this.timeLeft = this.delay
        this.loopsLeft = this.loop
    }

    stop() {
        this.started = false
        this.timeLeft = 0
        this.loopsLeft = 0
    }

    update(delta) {
        if (this.loopsLeft) {
            this.timeLeft -= delta

            if (this.timeLeft <= 0) {
                this.loopsLeft--
                this.cb()
            }

            if (this.loopsLeft && this.timeLeft <= 0) {
                let func = () => {
                    this.timeLeft = this.timeLeft + this.delay

                    if (this.timeLeft <= 0) {
                        this.loopsLeft--
                        this.cb()

                        if (this.loopsLeft) func()
                    }
                }

                func()
            }
        }
    }
}