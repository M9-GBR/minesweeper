export default class AudioManager {
    audios = {}
    ctx = new AudioContext
    volume = this.ctx.createGain()

    spatialAudios = []

    constructor(app) {
        this.app = app
        this.load("click.wav", "click")
        this.load("sqr_open.mp3", "sqr_open")
        this.load("test_audio.mp3", "test_audio")
        this.load("explosion.wav", "explosion")
        this.load("unflag.wav", "unflag")
        this.load("flag.wav", "flag")

        document.addEventListener("click", ev => {
            let btns = [...document.querySelectorAll("button")],
                checkBoxes = [...document.querySelectorAll("input[type='checkbox']")]

            for (const elem of btns.concat(checkBoxes)) {
                if (elem.contains(ev.target)) {
                    this.play("click")
                    break
                }
            }
        })

        this.volume.connect(this.ctx.destination)
    }

    load(src, name) {
        return new Promise(async resolve => {
            let buffer = await (this.ctx.decodeAudioData(await ((await fetch('./sound/' + src)).arrayBuffer())))
            this.audios[name] = buffer
            resolve()
        })
    }

    play(name) {
        let s = this.ctx.createBufferSource()
        s.buffer = this.audios[name]
        s.connect(this.volume)
        s.start()
    }

    playSpatial(name, x, y) {
        let s = this.ctx.createBufferSource()
        s.buffer = this.audios[name]

        let a = new SpatialAudio(this, name, x, y)

        this.spatialAudios.push(a)

        a.src.addEventListener("ended", () => {
            this.spatialAudios = this.spatialAudios.filter(s => s != a)
        })

        a.play()
    }

    resetPos() {
        this.ctx.listener.positionX.value = Math.ceil(this.app.camera.centerX)
        this.ctx.listener.positionY.value = Math.ceil(this.app.camera.centerY)
        this.ctx.listener.positionZ.value = 0
    }

    reset() {
        this.resetPos()
        this.spatialAudios.forEach(a => a.src.stop())
    }
}

class SpatialAudio {
    constructor(manager, name, x, y) {
        /**@type AudioManager */
        this.manager = manager

        let ctx = this.manager.ctx

        this.x = x
        this.y = y

        this.src = ctx.createBufferSource()
        this.src.buffer = this.manager.audios[name]

        this.pannerNode = ctx.createPanner()
        this.pannerNode.positionX.value = x
        this.pannerNode.positionY.value = y

        this.pannerNode.refDistance = manager.app.sqrSize * 2
        this.pannerNode.distanceModel = "inverse"
        this.pannerNode.rolloffFactor = 5

        this.src.connect(this.pannerNode).connect(this.manager.volume)
    }

    play() {
        this.src.start()
    }
}