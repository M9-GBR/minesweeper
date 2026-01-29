import { get } from "../utils.js"
import confirmTab from "./confirm.js"
import Tab from "./tab.js"

class SettingsTab extends Tab {
    // for theme
    themeBtn = get("#theme-select > button")
    themeDropdown = get("#theme-dropdown")
    lightThemeBtn = get("#light-theme-btn")
    darkThemeBtn = get("#dark-theme-btn")
    sysThemeBtn = get("#sys-theme-btn")

    //zoom
    zoomRange = get("#zoom-input")
    zoomTxt = get("#set-zoom-txt")

    //nice start
    niceStartInput = get("#nice-start-wrap input")

    //saved game
    savedGameInput = get("#saved-game-wrap input")

    //sensitivity
    sensitivityRange = get("#sensitivity-input")

    //listener
    showListenerInput = get("#show-listener-wrap input")

    //volume
    volumeRange = get("#volume-input")

    //clear
    resetBtn = get("#reset-btn")
    clearBtn = get("#clear-btn")

    constructor() {
        super(get("#settings-tab"), get("#settings-head button"))

        //theme
        document.addEventListener("click", ev => {
            if (!(this.themeBtn.contains(ev.target)) && !(this.themeDropdown.contains(ev.target))) {
                this.themeDropdown.classList.add("hide-2")
            }
        })

        this.themeBtn.addEventListener("click", () => {
            this.themeDropdown.classList.toggle("hide-2")
        });

        [...this.themeDropdown.children].forEach(e => {
            let data = e.dataset.val

            e.addEventListener("click", () => {
                this.app.settings.theme = data
                this.themeDropdown.classList.add("hide-2")
                this.update()
            })
        })

        //zoom
        this.initRange(get("#def-zoom-range-wrap"), val => {
            this.app.settings.defZoom = val
            this.zoomTxt.textContent = val + "x"
        })

        //niceStart
        this.niceStartInput.oninput = () => {
            this.app.settings.niceStart = this.niceStartInput.checked
            this.update()
        }

        //saved game
        this.savedGameInput.oninput = () => {
            this.app.settings.continueSavedGame = this.savedGameInput.checked
            this.update()
        }

        //sensitivity
        this.initRange(get("#sensitivity-range-wrap"), val => this.app.settings.scrollSensitivity = val)

        //listener
        this.showListenerInput.oninput = () => {
            this.app.settings.showListenerPosition = this.showListenerInput.checked
            this.update()
        }

        //volume
        this.initRange(get("#volume-range-wrap"), val => {
            this.app.settings.volume = val / 100
        })

        this.volumeRange.onchange = () => {
            this.app.audio.play("click")
        }

        //clear
        this.resetBtn.onclick = () => {
            this.app.settings.resetToDefault()
            this.update()
        }

        this.clearBtn.onclick = () => {
            confirmTab.open("This will clear all stats, reset settings to default and reload the page. Continue?", false).then(p => {
                if (p) {
                    document.body.classList.add("inactive")
                    clearInterval(this.app.timerInterval)
                    localStorage.clear()
                    sessionStorage.clear()
                    location.reload()
                }
            })
        }
    }

    update() {
        let settings = this.app.settings

        switch (settings.theme) {
            case "light":
                this.themeBtn.innerHTML = this.lightThemeBtn.innerHTML
                break
            case "dark":
                this.themeBtn.innerHTML = this.darkThemeBtn.innerHTML
                break
            case "light dark":
                this.themeBtn.innerHTML = this.sysThemeBtn.innerHTML
                break
        }

        this.zoomRange.value = settings.defZoom

        this.niceStartInput.checked = settings.niceStart

        this.savedGameInput.checked = this.app.settings.continueSavedGame

        this.sensitivityRange.value = settings.scrollSensitivity

        this.showListenerInput.checked = this.app.settings.showListenerPosition

        this.volumeRange.value = this.app.settings.volume * 100

        this.app.settings.save()
    }

    open() {
        super.open()
        this.update()
    }

    /**@param {HTMLElement} wrap */
    initRange(wrap, cb) {
        let p = wrap.getElementsByTagName("p")[0],
            range = wrap.getElementsByTagName("input")[0]

        let rangeCB = () => {
            p.classList.remove("hide-2")

            let min = Number(range.min),
                max = Number(range.max),
                val = range.valueAsNumber,
                i = 1 - (val - min) / (max - min)

            p.style.right = (i * 100) + "%"
            p.textContent = val

            cb(val)

            this.update()
        }

        range.oninput = () => rangeCB()
        range.onmouseenter = () => rangeCB()
        range.onmouseleave = () => p.classList.add("hide-2")

        document.addEventListener("pointerdown", ev => {
            if (!range.contains(ev.target)) {
                p.classList.add("hide-2")
            }
        })
    }
}

const settingsTab = new SettingsTab
export default settingsTab