import { getData } from "./utils.js"

export default class PresetManager {
    arr = []

    default = [
        new Preset("Easy", 9, 9, 10),
        new Preset("Medium", 16, 16, 40),
        new Preset("Hard", 16, 30, 99),
        // new Preset("Test", 20, 20, 100),
        // new Preset("Test2", 100, 100, 0)
    ]

    load() {
        if (getData("first-time") == "yes") {
            this.arr.push(...this.default)
            this.save()
        } else {
            let obj = JSON.parse(localStorage.getItem("presets"))
    
            if (obj) {
                obj.forEach(o => {
                    if (this.arr.every(p => p.name != o.name)) {
                        this.arr.push(new Preset(o.name, o.rows, o.cols, o.mines, o.seed))
                    }
                })
            }
        }

    }

    save() {
        localStorage.setItem("presets", JSON.stringify(this.arr))
    }

    add(name, rows, cols, mines, seed) {
        if (this.arr.every(p => p.name != name)) {
            this.arr.push(new Preset(...arguments))
            this.save()
        }
    }

    remove(name) {
        this.arr = this.arr.filter(p => p.name != name)
        this.save()
    }

    has(name) {
        return this.arr.some(p => p.name == name)
    }
}

class Preset {
    constructor(name, rows, cols, mines, seed) {
        this.name = name
        this.rows = rows
        this.cols = cols
        this.mines = mines
        this.seed = seed
    }
}