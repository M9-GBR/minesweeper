import Tab from './tab.js'
import confirmTab from './confirm.js'
import infoTab from './info.js'
import Minesweeper from '../game/minesweeper.js'
import { get, touchHoldEvent, randInt, getTimeStr } from '../utils.js'

class NewGameTab extends Tab {
    get rowsVal() {
        return Number(this.rowsInput.value)
    }
    get colsVal() {
        return Number(this.colsInput.value)
    }
    get minesVal() {
        return Number(this.minesInput.value)
    }

    _fullSeedMode = false
    get fullSeedMode() {
        return this._fullSeedMode
    }
    set fullSeedMode(bool) {
        let { rowsVal, colsVal, minesVal } = this,
            seedVal = this.seedInput.value

        this._fullSeedMode = bool
        this.elem.dataset.fsmode = Number(this.fullSeedMode)

        this.clearInputs()

        if (this.fullSeedMode) {
            if (rowsVal >= 1 && colsVal >= 1 && minesVal < rowsVal * colsVal) {
                let seed = seedVal.length == 0 ? randInt(48) : seedVal
                this.seedInput.value = Minesweeper.getFullSeed(rowsVal, colsVal, minesVal, seed)
            }
        } else {
            if (Minesweeper.isValidSeed(seedVal)) {
                let { rows, cols, mines, seed } = Minesweeper.decodeFullSeed(seedVal)
                this.rowsInput.value = rows
                this.colsInput.value = cols
                this.minesInput.value = mines
                this.seedInput.value = seed
            }
        }

        this.updateElems()
    }

    fsSwitchBtn = get("#top-wrap button:first-of-type")
    createBtn = get('#create-btn')
    presetSaveBtn = get('#preset-save-btn')
    presetsBtn = get('#presets-btn')
    presetsDropdown = get("#presets-dropdown")
    rowsInput = get('#rows-input')
    colsInput = get('#cols-input')
    minesInput = get('#mines-input')
    seedInput = get('#seed-input')
    randSeedBtn = get('#rand-seed-btn')
    estTimeText = get('#ng-est-time')
    infoBtn = get("#top-wrap button:nth-of-type(2)")

    presetSaveWrap = get('#preset-save-wrap')
    newGameInfoWrap = get("#new-game-info-wrap")

    constructor() {
        super(get("#new-game-tab"), get("#ngt-head button"))

        this.fsSwitchBtn.onclick = () => {
            this.fullSeedMode = !this.fullSeedMode
        }

        this.randSeedBtn.onclick = () => {
            this.seedInput.value = randInt(48)
            this.updateElems()
        }

        this.rowsInput.oninput = this.colsInput.oninput = this.minesInput.oninput = this.seedInput.oninput = () => this.updateElems()

        this.createBtn.onclick = () => {
            let rows, cols, mines, seed

            if (!this.fullSeedMode) {
                rows = this.rowsVal
                cols = this.colsVal
                mines = this.minesVal
                seed = this.seedInput.value

                if (seed.length == 0) seed = randInt(48)
            } else {
                let obj = Minesweeper.decodeFullSeed(this.seedInput.value)

                rows = obj.rows
                cols = obj.cols
                mines = obj.mines
                seed = obj.seed
            }

            this.app.newGame(rows, cols, mines, seed)
            this.close()
        }

        this.presetSaveBtn.onclick = () => {
            infoTab.open(this.presetSaveWrap)

            let str = "p:nth-of-type(2)",
                rowsElem = get("#ps-rows " + str),
                colsElem = get("#ps-cols " + str),
                minesElem = get("#ps-mines " + str),
                seedElem = get("#ps-seed " + str),
                psNameInput = get("#ps-name-input"),
                psSaveBtn = get("#ps-save-btn")

            let rows, cols, mines, seed

            if (!this.fullSeedMode) {
                rows = this.rowsVal
                cols = this.colsVal
                mines = this.minesVal
                seed = this.seedInput.value
            } else {
                let obj = Minesweeper.decodeFullSeed(this.seedInput.value)

                rows = obj.rows
                cols = obj.cols
                mines = obj.mines
                seed = obj.seed
            }

            psSaveBtn.disabled = true
            psNameInput.value = ""

            rowsElem.textContent = rows
            colsElem.textContent = cols
            minesElem.textContent = mines

            if (String(seed).length > 0) seedElem.textContent = seed
            else seedElem.innerHTML = "<i>Random</i>"

            psNameInput.oninput = () => {
                psSaveBtn.disabled = psNameInput.value.trim().length == 0
            }

            psSaveBtn.onclick = () => {
                let name = psNameInput.value.trim(),
                    add = () => {
                        this.app.presets.add(name, rows, cols, mines, seed)
                        infoTab.close()
                        this.updateElems()
                    }

                if (this.app.presets.has(name)) {
                    confirmTab.open("A preset with this name already exists, do you want to overwrite its properties?", false).then(bool => {
                        if (bool) {
                            this.app.presets.remove(name)
                            add()
                        }
                    })
                } else add()
            }
        }

        let close = () => {
            this.presetsBtn.dataset.active = false
            this.presetsDropdown.classList.add("hide-2")
        }

        this.presetsBtn.onclick = () => {
            if (!this.app.presets.arr.length) return

            this.presetsDropdown.innerHTML = ""

            let bool = eval(this.presetsBtn.dataset.active)
            this.presetsBtn.dataset.active = !bool

            if (bool) close()
            else {
                this.presetsDropdown.classList.remove("hide-2")

                this.app.presets.arr.forEach(p => {
                    let div = document.createElement("div"),
                        btn = document.createElement("button")

                    div.classList.add("pd-item")
                    div.appendChild(btn)

                    btn.textContent = p.name
                    btn.classList.add("ctx-elem")

                    btn.onclick = () => {
                        close()

                        this.fullSeedMode = false

                        this.rowsInput.value = p.rows || ""
                        this.colsInput.value = p.cols || ""
                        this.minesInput.value = p.mines || ""
                        this.seedInput.value = p.seed || ""

                        this.updateElems()
                    }

                    touchHoldEvent(btn, () => {
                        this.app.audio.play("click")
                        close()
                        confirmTab.open(
                            `Delete preset: <b>${p.name}</b>`
                            , false).then(bool => {
                                if (bool) this.app.presets.remove(p.name)
                                this.updateElems()
                            }
                            )
                    })

                    this.presetsDropdown.appendChild(div)
                })
            }
        }

        document.addEventListener("click", ev => {
            if (!this.presetsBtn.contains(ev.target) && !this.presetsDropdown.contains(ev.target)) close()
        })

        this.infoBtn.addEventListener("click", () => {
            infoTab.open(this.newGameInfoWrap)
        })

        this.presetSaveWrap.remove()
        this.newGameInfoWrap.remove()
    }

    open(showCur = false) {
        super.open()

        this.fullSeedMode = false

        this.clearInputs()

        if (showCur) {
            this.rowsInput.value = this.app.curGame.rows
            this.colsInput.value = this.app.curGame.cols
            this.minesInput.value = this.app.curGame.mines
            this.seedInput.value = this.app.curGame.seed
        }

        this.updateElems()
    }

    close() {
        super.close()
        if (this.curTimeWorker) this.curTimeWorker.terminate()
    }

    curTimeWorker
    updateElems() {
        this.presetsBtn.disabled = !this.app.presets.arr.length
        this.randSeedBtn.disabled = this.fullSeedMode

        let fixInput = inputElem => {
            let v = inputElem.value
            inputElem.value = v.replace("-", "").replace(".", "")
            return fixInput
        }

        fixInput(this.rowsInput)(this.colsInput)(this.minesInput)

        this.estTimeText.classList.add("hide-2")
        this.estTimeText.innerHTML = "<div class=\"wait-anim\"></div>"
        if (this.curTimeWorker) this.curTimeWorker.terminate()

        let func = obj => {
            if (!obj.val) this.estTimeText.textContent = "Est Time: " + getTimeStr(obj.minTime) + (obj.minTime != obj.maxTime ? " - " + getTimeStr(obj.maxTime) : "")
        }

        if (!this.fullSeedMode) {
            let { rowsVal, colsVal, minesVal } = this

            this.createBtn.disabled = this.presetSaveBtn.disabled = rowsVal < 1 || colsVal < 1 || minesVal >= rowsVal * colsVal

            if (!this.createBtn.disabled && this.seedInput.value.length > 0) {
                this.estTimeText.classList.remove("hide-2")

                this.curTimeWorker = this.app.getEstTime(Minesweeper.getFullSeed(rowsVal, colsVal, minesVal, this.seedInput.value), func)
            }
        } else {
            this.createBtn.disabled = this.presetSaveBtn.disabled = !Minesweeper.isValidSeed(this.seedInput.value)

            if (!this.createBtn.disabled) {
                this.estTimeText.classList.remove("hide-2")

                this.curTimeWorker = this.app.getEstTime(this.seedInput.value, func)
            }
        }
    }

    clearInputs() {
        this.rowsInput.value = this.colsInput.value = this.minesInput.value = this.seedInput.value = ""
        this.createBtn.disabled = this.presetSaveBtn.disabled = true
    }
}

const newGameTab = new NewGameTab
export default newGameTab