import { setData, getData } from "./utils.js"

export default class Settings {
    _theme = "light dark"
    get theme() {
        return this._theme
    }
    set theme(value) {
        this._theme = value
        document.querySelector(":root").style.colorScheme = this.theme == "light" ? "light" : this.theme == "dark" ? "dark" : "light dark"
    }

    _volume = 1
    get volume() {
        return this._volume
    }
    set volume(num) {
        this._volume = num
        this.app.audio.volume.gain.value = this._volume
    }

    sqrSize = 20
    niceStart = false
    scrollSensitivity = 1
    minZoom = .5
    maxZoom = 2
    defZoom = 1
    showListenerPosition = true
    continueSavedGame = false

    constructor(app) {
        this.app = app

        this.volume = this.volume
        this.theme = this.theme
    }

    save() {
        let save = {
            theme: this.theme,
            niceStart: this.niceStart,
            scrollSensitivity: this.scrollSensitivity,
            defZoom: this.defZoom,
            showListenerPosition: this.showListenerPosition,
            volume: this.volume,
            continueSavedGame: this.continueSavedGame
        }

        setData("settings", save)
    }

    load() {
        let data = getData("settings")

        if (data) {
            this.theme = data.theme
            this.niceStart = data.niceStart
            this.scrollSensitivity = data.scrollSensitivity
            this.defZoom = data.defZoom
            this.showListenerPosition = data.showListenerPosition
            this.volume = data.volume
            this.continueSavedGame = data.continueSavedGame
        }
    }

    resetToDefault() {
        this.theme = "light dark"
        this.volume = 1
        this.scrollSensitivity = 1
        this.defZoom = 1
        this.continueSavedGame = false
        this.showListenerPosition = true
        this.niceStart = false
    }
}