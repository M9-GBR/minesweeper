import Minesweeper from './game/minesweeper.js'
import AppSquare from './canvas/square.js'
import ExplosionSprite from './canvas/explosion.js'
import Flag from './canvas/flag.js'
import TimeEvent from './canvas/time_event.js'
import Counter from './canvas/counter.js'
import Input from './canvas/input.js'
import Camera from './canvas/camera.js'
import ScrollBar from './canvas/scrollbar.js'
import menu from './menu.js'
import confirmTab from './tabs/confirm.js'
import newGameTab from './tabs/new-game.js'
import infoTab from './tabs/info.js'
import waitTab from './tabs/wait.js'
import statsTab from './tabs/stats.js'
import gameEndTab from './tabs/end.js'
import settingsTab from './tabs/settings.js'
import PresetManager from './presets.js'
import Statistics from './stats.js'
import Settings from './settings.js'
import { get, randInt, getTimeStr, getData, setData, random } from './utils.js'
import AudioManager from './audio.js'

class App {
    _paused = !true
    get paused() {
        return this._paused
    }
    set paused(bool) {
        this._paused = bool
    }

    _elapsed = 0
    get elapsed() {
        return this._elapsed
    }
    set elapsed(num) {
        this._elapsed = num
        get("#time-wrap div").textContent = getTimeStr(this.elapsed)

        let { minTime, maxTime } = this.curGameInfo.timeRange

        get("#time-wrap svg").style.fill = num <= minTime ? "var(--green)" : num > minTime && num <= maxTime ? "var(--yellow)" : "var(--red)"
    }

    /**@type {HTMLCanvasElement} */
    canvas = get('#game-canvas')
    ctx = this.canvas.getContext('2d')

    curGame
    curGameInfo = null
    savedGame = null
    timeCache = {}

    sqrs = []
    colorMap = ['#fff0', 'red', 'orange', 'gold', 'green', 'blue', 'indigo', 'violet', 'black']
    explosions = []
    flags = []

    input = new Input(this)
    audio = new AudioManager(this)
    camera = new Camera(this)
    scrollBar = new ScrollBar(this)

    sqrSizingBtn = get("#sqr-size-wrap button")
    sqrSizingRange = get("#sqr-size-wrap input")
    sqrSizingRangeWrap = get("#sqr-size-wrap > div")
    gameInfoBtn = get("#game-info-btn")
    gameInfoWrap = get("#game-info-wrap")

    presets = new PresetManager
    stats = new Statistics

    debug = !true

    sqrSize = 20
    settings = new Settings(this)

    constructor() {
        let firstTime = getData("first-time")

        if (!firstTime) {
            setData("first-time", "yes")
        } else setData("first-time", "no")

        this.presets.load()

        menu.app = newGameTab.app = confirmTab.app = infoTab.app = waitTab.app = statsTab.app = gameEndTab.app = settingsTab.app = this

        this.gameInfoBtn.onclick = () => {
            infoTab.open(this.gameInfoWrap)

            let str = " p:nth-of-type(2)",
                rowsElem = get("#gi-rows" + str),
                colsElem = get("#gi-cols" + str),
                minesElem = get("#gi-mines" + str),
                seedElem = get("#gi-seed" + str),
                fsElem = get("#gi-fs" + str),
                timeElem = get("#gi-time" + str),
                dateElem = get("#gi-date" + str),
                info = this.curGameInfo

            rowsElem.textContent = info.rows
            colsElem.textContent = info.cols
            minesElem.textContent = info.mines
            seedElem.textContent = info.seed
            fsElem.textContent = info.fullSeed
            timeElem.textContent = getTimeStr(info.timeRange.minTime) + (info.timeRange.minTime != info.timeRange.maxTime ? " - " + getTimeStr(info.timeRange.maxTime) : "")

            dateElem.textContent = (new Date(info.date)).toLocaleString()
        }

        get("#opened-wrap").onclick = () => {
            infoTab.open("This shows the squares that have been opened over the sqaures to be opened to win the game.")
        }

        this.loadSVGs().then(() => {
            this.addSVGs()

            this.settings.load()

            this.flagImg = document.createElement("img")
            this.flagImg.src = "./svgs/flag.svg"

            this.explosionImg = document.createElement("img")
            this.explosionImg.src = "./imgs/explosion.png"

            get("#load-wrap").classList.add("hide")

            this.stats.load()
            this.timeCache = getData("time-cache", true) || {}
            this.savedGame = getData("saved-game")

            let props = getData("new-game-props") || { rows: 9, cols: 9, mines: 10 }

            if (this.savedGame) {
                if (this.settings.continueSavedGame) this.continueSavedGame()
                else {
                    confirmTab.open("Continue saved game? Not doing so will count as a loss in your statistics.").then(bool => {
                        if (bool) {
                            this.continueSavedGame()
                        } else {
                            let g = Minesweeper.createFromString(this.savedGame.gameData)

                            this.stats.add(this.savedGame.date, g.rows, g.cols, g.mines, g.seed, false, this.savedGame.elapsed, this.savedGame.timeRange)

                            this.newGame(props.rows, props.cols, props.mines, randInt(48))
                        }
                    })
                }
            } else {
                this.newGame(props.rows, props.cols, props.mines, randInt(48))
            }
        })

        this.gameInfoWrap.remove()
    }

    svgs = {}
    loadSVGs() {
        return new Promise(resolve => {
            let arr = [
                "info", "flag", "stopwatch", "plus", "stats",
                "settings", "tick", "x", "rotate", "save",
                "dice", "trash-can", "back", "sun", "moon",
                "laptop", "facebook-f", "reddit", "envelope"
            ], count = 0

            arr.forEach(async (s, i) => {
                let tempElem = document.createElement("div")
                tempElem.innerHTML = await ((await fetch("svgs/" + s + ".svg")).text())

                Object.defineProperty(this.svgs, s, {
                    get: () => tempElem.getElementsByTagName("svg")[0].cloneNode(true)
                })

                count++

                if (count == arr.length) resolve()
            })
        })
    }

    addSVGs() {
        let s = this.svgs

        get("#game-info-btn").append(s.info)
        get("#flags-wrap").prepend(s.flag)
        get("#time-wrap").prepend(s.stopwatch)
        get("#ct-ok-btn").append(s.tick)
        get("#top-wrap button:first-of-type").append(s.rotate)
        get("#top-wrap button:nth-of-type(2)").append(s.info)
        get("#rand-seed-btn").append(s.dice)
        get("#preset-save-btn").append(s.save)
        get("#clear-stats-btn").append(s['trash-can'])
        get("#sl-back-btn").append(s.back)
        get("#light-theme-btn").prepend(s.sun)
        get("#dark-theme-btn").prepend(s.moon)
        get("#sys-theme-btn").prepend(s.laptop)

        document.querySelectorAll(".cancel-btn").forEach(b => {
            b.append(s.x)
        })

        menu.items.forEach(i => i.update())
    }

    continueSavedGame() {
        let s = this.savedGame

        this.curGame = Minesweeper.createFromString(s.gameData)

        this.sqrs = []

        this.curGame.sqrs.forEach(s => {
            this.sqrs.push(new AppSquare(this, s.row, s.col, s.mineCount, s.opened, s.flagged))
        })

        this.timeCache[this.curGame.fullSeed] = s.timeRange
        setData("time-cache", this.timeCache, true)

        this.updateGameInfo()

        this.sqrSize = this.settings.sqrSize
        this.camera.x = s.camera.x
        this.camera.y = s.camera.y
        this.camera.zoom = s.camera.zoom

        this.audio.reset()

        this.elapsed = s.elapsed

        this.updateFlagElem()
        this.updateOpenedElem()

        this.stopUpdateLoop()
        this.startUpdateLoop()
    }

    waiting = false
    newGame(rows, cols, mines, seed, force = !true) {
        let create = () => {
            this.removeSave()

            this.curGame = new Minesweeper(rows, cols, mines, seed)

            setData("new-game-props", { rows, cols, mines })

            this.explosions.forEach(e => e.destroy())
            this.flags.forEach(f => f.destroy())

            this.stopUpdateLoop()

            clearTimeout(this.endTabTimeout)

            this.waiting = false

            if (!force) {
                this.waiting = true
                waitTab.open("Creating Game")
            } else {
                this.startUpdateLoop()
            }

            this.updateGameInfo()

            this.sqrs = []

            this.curGame.sqrs.forEach(sqr => {
                this.sqrs.push(new AppSquare(this, sqr.row, sqr.col, sqr.mineCount))
            })

            this.updateFlagElem()
            this.updateOpenedElem()

            this.sqrSize = this.settings.sqrSize

            this.camera.x = 0
            this.camera.y = 0
            this.camera.zoom = this.settings.defZoom

            this.audio.reset()

            this.resetTimer()

            if (this.settings.niceStart) {
                for (let i = 0; i < 9; i++) {
                    let sqrs = this.curGame.sqrs.filter(s => s.mineCount == i)

                    if (sqrs.length > 0) {
                        let sqr = sqrs[Math.floor(Math.random() * sqrs.length)],
                            appSqr = this.sqrs.find(s => s.row == sqr.row && s.col == sqr.col)

                        appSqr.overlayColor = "green"

                        this.camera.origin = { x: .5, y: .5 }

                        this.camera.x = appSqr.x
                        this.camera.y = appSqr.y

                        break
                    }
                }
            }
        }

        if (!this.curGame || force || (!this.curGame.started || this.curGame.ended)) create()
        else {
            confirmTab.open("You haven't finished the game you started. Creating a new game will count as a loss in your statistics.", false).then(p => {
                if (p) {
                    this.stats.add(
                        this.curGameInfo.date,
                        this.curGameInfo.rows,
                        this.curGameInfo.cols,
                        this.curGameInfo.mines,
                        this.curGameInfo.seed,
                        false,
                        this.elapsed,
                        this.curGameInfo.timeRange
                    )
                    create()
                }
            })
        }
    }

    updateGameInfo() {
        this.curGameInfo = {
            rows: this.curGame.rows,
            cols: this.curGame.cols,
            mines: this.curGame.mines,
            seed: this.curGame.seed,
            fullSeed: this.curGame.fullSeed,
            date: Date.now(),
            timeRange: { minTime: 0, maxTime: 0 }
        }

        this.getEstTime(this.curGame.fullSeed, obj => {
            if (!obj.val) {
                this.curGameInfo.timeRange = obj

                waitTab.updateBar(1)
                waitTab.close()

                if (this.waiting) {
                    this.waiting = false
                    this.startUpdateLoop()
                }
            } else {
                waitTab.updateBar(obj.val)
            }
        })
    }

    getEstTime(seed, func) {
        if (this.timeCache[seed]) {
            func(this.timeCache[seed])
            return
        }

        let w = new Worker("scripts/time_worker.js")

        w.addEventListener("message", ev => {
            func(ev.data)

            if (!ev.data.val) {
                this.timeCache[seed] = ev.data
                setData("time-cache", this.timeCache, true)
                w.terminate()
            }
        })

        w.postMessage(seed)

        return w
    }

    markRiggedSqrs() {
        this.curGame.rigged.forEach(sqr => {
            this.sqrs.find(s => s.row == sqr.row && s.col == sqr.col).overlayColor = "red"
        })
    }

    saveGame() {
        let i = this.curGameInfo
        this.savedGame = {
            gameData: this.curGame.getStringData(),
            timeRange: i.timeRange,
            date: i.date,
            camera: this.camera.obj,
            elapsed: this.elapsed
        }

        setData("saved-game", this.savedGame)
    }

    removeSave() {
        this.savedGame = null
        setData("saved-game", null)
    }

    openSqr(sqr) {
        if (!this.curGame.ended) {
            if (!this.curGame.started) {
                this.sqrs.forEach(s => s.overlayColor = null)
            }

            if (!this.timerRunning) this.startTimer()

            let row = sqr.row, col = sqr.col

            this.curGame.openSqr(row, col)

            let openedArr = this.curGame.openedArr

            if (this.curGame.ended) {
                this.stopTimer()
                this.removeSave()

                this.stats.add(
                    this.curGameInfo.date,
                    this.curGameInfo.rows,
                    this.curGameInfo.cols,
                    this.curGameInfo.mines,
                    this.curGameInfo.seed,
                    this.curGame.won,
                    this.elapsed,
                    this.curGameInfo.timeRange
                )

                this.endTabTimeout = setTimeout(() => gameEndTab.open(this.stats.gamesPlayed.length - 1), 2000)
            }

            if (this.curGame.failed && openedArr.length) {
                let rSqr = openedArr.find(s => s.rigged && s.opened),
                    fSqr = this.sqrs.find(s => s.row == rSqr.row && s.col == rSqr.col)

                this.startFailSys(fSqr)

                return
            }

            if (this.curGame.won) {
                let count = 9
                this.pourConfetti(10)

                let i = setInterval(() => {
                    this.pourConfetti(10)
                    count--

                    if (!count) clearInterval(i)
                }, 500)
            }

            this.curGame.openedArr.forEach(s => {
                let appSqr = this.sqrs.find(sqr => sqr.row == s.row && sqr.col == s.col)

                this.addTimeEvent(() => {
                    appSqr.opened = true
                    appSqr.input = true

                    if (!s.mineCount) this.audio.playSpatial("sqr_open", appSqr.x, appSqr.y)
                }, 100 * s.chainCount)

                appSqr.input = false
            })

            this.updateOpenedElem()
        }
    }

    flagSqr(sqr) {
        let wasFlagged = sqr.flagged

        if (this.curGame.started && !this.curGame.ended && !this.timerRunning) {
            this.startTimer()
        }

        let row = sqr.row, col = sqr.col

        this.curGame.toggleFlag(row, col)

        sqr.flagged = this.curGame.sqrAt(row, col).flagged

        if (!sqr.flagged && wasFlagged) {
            new Flag(this, sqr.x, sqr.y).leave()
        } else if (sqr.flagged && !wasFlagged) {
            this.audio.play("flag")
        }

        this.updateFlagElem()
    }

    updateFlagElem() {
        get("#flags-wrap > div").textContent = this.curGame.flagCount
    }

    updateOpenedElem() {
        get("#opened-wrap").textContent = this.curGame.opened.length + ' / ' + (this.curGame.sqrs.length - this.curGame.rigged.length)
    }

    pourConfetti(amt) {
        let colors = ["red", "orange", "yellow", "green", "blue"]

        for (let i = 0; i < amt; i++) {
            let elem = document.createElement("div")

            elem.classList.add("confetti")
            elem.style.backgroundColor = colors[random(0, colors.length - 1)]
            elem.style.top = "0px"
            elem.style.left = random(0, 100) + "vw"
            elem.style.width = random(10, 20) + "px"

            get("#confetti-wrap").appendChild(elem)

            let fallSpeed = random(1000, 5000),
                left = parseInt(getComputedStyle(elem).left),
                offset = random(-200, 200)
            elem.animate([
                { top: "100vh", left: (left + offset) + "px" }
            ], {
                duration: fallSpeed,
                fill: "forwards"
            })

            let rotRand = random(0, 360)
            elem.animate([
                { transform: `rotateZ(${rotRand}deg)` },
                { transform: `rotateZ(${rotRand}deg) ` + "rotateX(360deg)" }
            ], {
                duration: 500,
                iterations: Infinity,
            })

            elem.animate([
                { opacity: 0 }
            ], {
                duration: 500,
                delay: fallSpeed - 500,
                fill: "forwards"
            }).addEventListener("finish", () => elem.remove())
        }
    }

    failTimeEvents = []
    startFailSys(sqr) {
        let getSqr = (row, col) => this.sqrs.find(s => s.row == row && s.col == col),
            firstDelay = 1000

        let failSqrs = this.curGame.rigged.filter(s => !s.flagged)
            .concat(this.curGame.sqrs.filter(s => !s.rigged && s.flagged))
            .sort((s1, s2) => {
                let appSqr1 = getSqr(s1.row, s1.col),
                    appSqr2 = getSqr(s2.row, s2.col),
                    d1 = Math.hypot(appSqr1.x - sqr.x, appSqr1.y - sqr.y),
                    d2 = Math.hypot(appSqr2.x - sqr.x, appSqr2.y - sqr.y)

                return d1 - d2
            })

        failSqrs.forEach((s, i) => {
            let appSqr = getSqr(s.row, s.col),
                remnantsShown = false,
                initExplosion = () => {
                    let e = new ExplosionSprite(this, appSqr.x, appSqr.y).explode()

                    e.timeObjs[1].addEventListener("complete", () => e.destroy())
                    e.timeObjs[1].addEventListener("update", ev => {
                        if (ev.detail.value >= .5 && !remnantsShown) {
                            remnantsShown = true

                            let e = new ExplosionSprite(this, appSqr.x, appSqr.y, 10)
                            e.alpha = 0.5
                            e.scale = .9
                        }
                    })
                }

            if (i == 0) {
                initExplosion()
            } else {
                let e = this.addTimeEvent(() => {
                    if (!s.flagged) {
                        initExplosion()
                    } else {
                        appSqr.flagged = false

                        let f = new Flag(this, appSqr.x, appSqr.y)

                        f.velocity.y = -5
                        f.acceleration.y = .1
                        f.velocity.x = Math.random() * (3 + 3) - 3

                        let arr = [0.01, -0.01]
                        f.angularAcceleration = arr[Math.floor(Math.random() * arr.length)]
                        f.maxAngularVelocity = 0.05

                        f.leave()
                    }
                }, (i * 50) + firstDelay)

                this.failTimeEvents.push(e)
            }
        })
    }

    timerInterval
    timerRunning = false
    startTimer() {
        this.stopTimer()
        this.timerRunning = true
        this.timerInterval = setInterval(() => {
            this.elapsed++
            this.saveGame()
        }, 1000)
    }
    resetTimer() {
        this.stopTimer()
        this.elapsed = 0
    }
    stopTimer() {
        clearInterval(this.timerInterval)
        this.timerRunning = false
    }

    sizeCanvas() {
        let { width, height } = get('#canvas-wrap').getBoundingClientRect()

        this.canvas.width = width
        this.canvas.height = height

        this.camera.width = Math.floor(this.canvas.width / devicePixelRatio)
        this.camera.height = Math.floor(this.canvas.height / devicePixelRatio)
    }

    addTimeEvent(cb, delay, loops) {
        let e = new TimeEvent(cb, delay, loops)
        this.timeEvents.push(e)
        return e
    }

    addCounter(config) {
        return new Counter(this, config)
    }

    animFrame
    fps = 60
    curFPS = 0
    startUpdateLoop() {
        this.running = true

        let minFPS = 5, then = 0

        let loop = now => {
            if (!this.paused && (now - then)) {
                let delta = now - then, fps = 1000 / delta

                then = now

                if (fps >= minFPS) this.update(delta)
            }

            if (this.running) this.animFrame = requestAnimationFrame(loop)
        }

        loop()
    }

    timeEvents = []
    update(delta) {
        this.sizeCanvas()

        this.timeEvents.forEach(e => e.update(delta))
        this.timeEvents = this.timeEvents.filter(e => e.loopsLeft)

        this.flags.forEach(f => f.update(delta))

        this.camera.update(delta)

        this.draw(delta)
    }

    running = false
    stopUpdateLoop() {
        this.timeEvents = []
        this.running = false
        cancelAnimationFrame(this.animFrame)
    }

    draw(delta) {
        let ctx = this.ctx

        ctx.reset()
        ctx.fillStyle = '#ccf'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.scale(devicePixelRatio, devicePixelRatio)
        ctx.translate(this.camera.x, this.camera.y)
        ctx.scale(this.camera.zoom, this.camera.zoom)
        ctx.translate(
            -(this.camera.x / this.camera.zoom) - this.camera.startX,
            -(this.camera.y / this.camera.zoom) - this.camera.startY
        )

        let t = ctx.getTransform()
        ctx.setTransform(t.a, t.b, t.c, t.d, Math.ceil(t.e), Math.ceil(t.f))
        ctx.save()

        let isInView = obj => obj.startX < this.camera.endX && obj.endX > this.camera.startX && obj.startY < this.camera.endY && obj.endY > this.camera.startY,
            change = str => str == '#aaf' ? '#bbf' : '#aaf',
            startColor = '#bbf'

        this.sqrs.forEach(sqr => {
            if (isInView(sqr)) {
                ctx.restore()
                ctx.save()

                if (!sqr.opened) {
                    ctx.globalAlpha = sqr.alpha

                    let rowStart = sqr.row % 2 ? startColor : change(startColor),
                        colColor = sqr.col % 2 ? rowStart : change(rowStart)

                    ctx.fillStyle = colColor

                    let s = this.sqrSize

                    ctx.fillRect(sqr.startX, sqr.startY, s, s)

                    if (sqr.overlayColor) {
                        ctx.fillStyle = sqr.overlayColor
                        ctx.fillRect(sqr.startX, sqr.startY, s, s)
                    }

                    if (sqr.flagged) {
                        let w = s * .8,
                            h = this.flagImg.height / this.flagImg.width * w

                        ctx.translate(sqr.x, sqr.y)
                        ctx.drawImage(this.flagImg, -w / 2, -h / 2, w, h)
                    }
                } else {
                    ctx.fillStyle = '#ddf'

                    ctx.fillRect(sqr.startX, sqr.startY, this.sqrSize, this.sqrSize)

                    if (sqr.mineCount) {
                        ctx.fillStyle = this.colorMap[sqr.mineCount] || 'grey'

                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'top'
                        ctx.font = this.sqrSize + 'px monospace'

                        let m = ctx.measureText(sqr.mineCount),
                            h = m.actualBoundingBoxDescent - m.actualBoundingBoxAscent

                        ctx.fillText(sqr.mineCount, sqr.x, sqr.y - h / 2)
                    }
                }
            }
        })

        this.flags.forEach(f => f.draw())

        this.explosions.forEach(e => {
            ctx.restore()
            ctx.save()

            if (isInView(e)) e.draw()
        })

        this.scrollBar.draw()

        if (this.settings.showListenerPosition) {
            ctx.restore()
            ctx.save()

            ctx.globalAlpha = .7

            let l = this.audio.ctx.listener
            ctx.fillStyle = "yellow"
            ctx.beginPath()
            ctx.arc(l.positionX.value, l.positionY.value, this.sqrSize / 5, 0, Math.PI * 2)
            ctx.fill()
        }

        if (this.debug) {
            ctx.resetTransform()
            ctx.globalAlpha = 1

            ctx.scale(devicePixelRatio, devicePixelRatio)

            ctx.fillStyle = 'black'
            ctx.font = '30px arial'
            ctx.textBaseline = 'top'

            let debugTxt = Math.round(1000 / delta),
                m = ctx.measureText(debugTxt)
            ctx.fillText(debugTxt, this.canvas.width - m.width - 5, this.canvas.height - m.actualBoundingBoxDescent - m.actualBoundingBoxAscent - 5)
        }
    }
}

window.app = new App