import { inRange } from '../utils.js'
import newGameTab from '../tabs/new-game.js'

export default class Input {
    disabled = false
    /**@type HTMLCanvasElement */
    canvas

    constructor(app) {
        this.app = app
        this.canvas = this.app.canvas

        //touch input
        let lastTouches, heldSqr, heldTimeout,
            clearHold = () => {
                heldSqr = null
                clearTimeout(heldTimeout)
            }

        this.canvas.addEventListener('touchstart', ({ touches }) => {
            if (!this.disabled) {
                lastTouches = touches

                if (touches.length == 1) {
                    let { x, y } = this.getWorldFromClient(touches[0].clientX, touches[0].clientY),
                        sqr = this.getSqr(x, y)

                    if (sqr) {
                        heldSqr = sqr

                        heldTimeout = setTimeout(() => {
                            this.app.flagSqr(heldSqr)
                            clearHold()

                            let l = this.app.audio.ctx.listener
                            l.positionX.value = x
                            l.positionY.value = y
                        }, 500)
                    }
                } else clearHold()
            }
        })

        this.canvas.addEventListener('touchmove', ev => {
            if (!this.disabled) {
                let { touches } = ev

                ev.preventDefault()

                clearHold()

                if (touches.length == 1) {
                    let t = touches[0], last = lastTouches[0]

                    this.app.camera.x -= Math.floor((t.clientX - last.clientX)) * this.app.settings.scrollSensitivity
                    this.app.camera.y -= Math.floor((t.clientY - last.clientY)) * this.app.settings.scrollSensitivity

                    this.app.scrollBar.show()

                    lastTouches = touches
                } else if (touches.length == 2 && lastTouches.length == 2) {
                    let c1 = this.getWorldFromClient(touches[0].clientX, touches[0].clientY),
                        c2 = this.getWorldFromClient(touches[1].clientX, touches[1].clientY),
                        l1 = this.getWorldFromClient(lastTouches[0].clientX, lastTouches[0].clientY),
                        l2 = this.getWorldFromClient(lastTouches[1].clientX, lastTouches[1].clientY),
                        mid = { x: Math.floor((c1.x + c2.x) / 2), y: Math.floor((c1.y + c2.y) / 2) },
                        d1 = Math.hypot(c1.x - c2.x, c1.y - c2.y), d2 = Math.hypot(l1.x - l2.x, l1.y - l2.y),
                        zoomFactor = d1 / d2

                    this.app.camera.setOriginSafe((mid.x - this.app.camera.startX) / this.app.camera.scrollW, (mid.y - this.app.camera.startY) / this.app.camera.scrollH)
                    this.app.camera.zoom *= zoomFactor

                    lastTouches = touches
                }
            }
        })

        this.canvas.addEventListener('touchend', () => clearHold())

        // keyboard & mouse
        let zoomState = 'off'

        document.addEventListener('keydown', ({ key }) => {
            if (key == 'Control' && !this.disabled) {
                switch (zoomState) {
                    case 'in': zoomState = 'out'; break
                    case 'out': zoomState = 'off'; break
                    case 'off': zoomState = 'in'
                }

                this.canvas.style.cursor = zoomState == 'in' ? 'zoom-in' : zoomState == 'out' ? 'zoom-out' : 'default'
            }
        })

        let clickedSqr, clickTimeout
        this.canvas.addEventListener("click", ({ offsetX, offsetY }) => {
            if (!this.disabled) {
                let rPos = this.getRenderFromOffset(offsetX, offsetY)

                if (rPos.inBounds) {
                    let { x, y } = this.toWorldSpace(rPos.x, rPos.y)

                    let l = this.app.audio.ctx.listener
                    l.positionX.value = x
                    l.positionY.value = y

                    if (zoomState == 'off') {
                        let sqr = this.getSqr(x, y)

                        if (!clickedSqr) {
                            clickedSqr = sqr
                            clickTimeout = setTimeout(() => clickedSqr = null, 700)
                        } else {
                            clearTimeout(clickTimeout)

                            if (clickedSqr == sqr) {
                                this.app.openSqr(sqr)
                            }

                            clickedSqr = null
                        }
                    } else {
                        let oX = (x - this.app.camera.startX) / this.app.camera.scrollW,
                            oY = (y - this.app.camera.startY) / this.app.camera.scrollH

                        this.app.camera.setOriginSafe(oX, oY)

                        this.app.camera.zoom += zoomState == 'in' ? 0.2 : -0.2
                    }
                }
            }
        })

        this.canvas.addEventListener('contextmenu', ev => {
            ev.preventDefault()

            if (!this.disabled && navigator.maxTouchPoints == 0) {
                let rPos = this.getRenderFromOffset(ev.offsetX, ev.offsetY)

                if (rPos.inBounds) {
                    let { x, y } = this.toWorldSpace(ev.offsetX, ev.offsetY),
                        sqr = this.getSqr(x, y)

                    let l = this.app.audio.ctx.listener
                    l.positionX.value = x
                    l.positionY.value = y

                    if (sqr) this.app.flagSqr(sqr)
                }
            }
        })

        let held = false, lastEv,
            cb = () => {
                held = false
                if (zoomState == 'off') this.canvas.style.cursor = 'default'
            }

        this.canvas.addEventListener('mousedown', ev => {
            held = true
            lastEv = ev
        })

        this.canvas.addEventListener('mouseup', cb)
        this.canvas.addEventListener('mouseleave', cb)

        this.canvas.addEventListener('mousemove', ev => {
            if (navigator.maxTouchPoints == 0 && !this.disabled) {
                clickedSqr = null

                if (held) {
                    this.app.camera.stopMoving()

                    if (zoomState == 'off') {
                        if (!this.app.camera.locked.x || !this.app.camera.locked.y) {
                            this.canvas.style.cursor = "grabbing"
                        }
                    }

                    this.app.camera.x -= Math.floor((ev.x - lastEv.x)) * this.app.settings.scrollSensitivity
                    this.app.camera.y -= Math.floor((ev.y - lastEv.y)) * this.app.settings.scrollSensitivity

                    this.app.scrollBar.show()

                    lastEv = ev
                }
            }
        })

        document.addEventListener('keydown', ({ key }) => {
            if (!this.disabled) {
                if (key == 'Escape') {
                    let tab = this.app.openTabs[this.app.openTabs.length - 1]
                    if (tab && tab.closeBtn) tab.close()
                }

                let focused = this.app.canvas.matches(":focus")

                if (focused) {
                    if (key.includes("Arrow")) this.app.scrollBar.show()

                    switch (key) {
                        case "ArrowUp": this.app.camera.y -= 2 * this.app.settings.scrollSensitivity; break
                        case "ArrowDown": this.app.camera.y += 2 * this.app.settings.scrollSensitivity; break
                        case "ArrowLeft": this.app.camera.x -= 2 * this.app.settings.scrollSensitivity; break
                        case "ArrowRight": this.app.camera.x += 2 * this.app.settings.scrollSensitivity; break
                    }
                }
            }
        })
    }

    toWorldSpace(x, y) {
        return {
            x: this.app.camera.startX + ((x / this.app.camera.width) / devicePixelRatio * this.app.camera.scrollW),
            y: this.app.camera.startY + ((y / this.app.camera.height) / devicePixelRatio * this.app.camera.scrollH)
        }
    }

    getWorldFromClient(x, y) {
        let rPos = this.getRenderFromClient(x, y)
        return this.toWorldSpace(rPos.x, rPos.y)
    }

    getOffsetFromClient(x, y) {
        let rect = this.canvas.getBoundingClientRect(),
            styles = getComputedStyle(this.canvas),
            borderL = parseInt(styles.borderLeftWidth),
            borderT = parseInt(styles.borderTop)

        return {
            x: Math.round(x - rect.x - borderL),
            y: Math.round(y - rect.y - borderT)
        }
    }

    getRenderFromOffset(x, y) {
        let styles = getComputedStyle(this.canvas),
            padL = parseInt(styles.paddingLeft),
            padT = parseInt(styles.paddingTop),
            styW = parseInt(styles.width),
            styH = parseInt(styles.height),
            styX = x - padL,
            styY = y - padT,
            oX = styX / styW,
            oY = styY / styH

        return {
            x: this.canvas.width * oX,
            y: this.canvas.height * oY,
            inBounds: oX >= 0 && oX <= 1 && oY >= 0 && oY <= 1
        }
    }

    getRenderFromClient(x, y) {
        let pos = this.getOffsetFromClient(x, y)
        return this.getRenderFromOffset(pos.x, pos.y)
    }

    getSqr(x, y) {
        return this.app.sqrs.find(s => inRange(x, s.startX, s.endX) && inRange(y, s.startY, s.endY) && s.input)
    }
}
