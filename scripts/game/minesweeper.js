import {seedRand, hashCode} from '../utils.js'
import Square from './square.js'

export default class Minesweeper {
    sqrs = []
    openedArr = []
    type = "standard"

    get started() {
        return this.sqrs.some(s => s.opened == true)
    }
    
    get rigged() {
        return this.sqrs.filter(sqr => sqr.rigged)
    }
    
    get opened() {
        return this.sqrs.filter(sqr => sqr.opened && !sqr.rigged)
    }
    
    get won() {
        return this.sqrs.every(sqr => (sqr.opened && !sqr.rigged) || (sqr.rigged && !sqr.opened))
    }
    
    get failed() {
        return this.sqrs.some(sqr => sqr.opened && sqr.rigged)
    }
    
    get ended() {
        return this.failed || this.won
    }
    
    get fullSeed() {
        return Minesweeper.getFullSeed(this.rows, this.cols, this.mines, this.seed)
    }

    constructor(rows, cols, mines, seed) {
        if (typeof rows == 'number') {
            this.rows = rows
            this.cols = cols
            this.seed = seed
            this.mines = mines
        } else {
            let {rows, cols, mines, seed} = Minesweeper.decodeFullSeed(arguments[0])
            this.rows = rows
            this.cols = cols
            this.seed = seed
            this.mines = mines
        }
        
        this.flagCount = this.mines
                
        this.createSqrs()
        this.rigSquares()
        
        this.sqrs.forEach(sqr => {
            sqr.updateNeighbours()
            sqr.updateMineCount()
        })
    }

    createSqrs() {
        this.sqrs = new Array(this.rows * this.cols).fill()
        
        let row = 1, col = 1
        
        this.sqrs.forEach((_, i) => {
            this.sqrs[i] = new Square(this, row, col)
            
            if ((i + 1) % this.cols == 0) {
                row++
                col = 1
            } else col++
        })
    }
    
    rigSquares() {
        let newSeed = isNaN(Number(this.seed)) ? hashCode(this.seed) : Number(this.seed),
            rand = seedRand(newSeed * this.mines)
    
        this.sqrs.map(s => s).sort(() => rand.next().value > rand.next().value ? 1 : -1)
            .reverse().sort(() => rand.next().value > rand.next().value ? -1 : 1)
            .slice(0, this.mines).forEach(s => s.rigged = true)
        
        rand.return()
    }
    
    sqrAt(row, col) {
       let inRange = (n1, n2) => n1 > 0 && n1 <= n2
        
        if (inRange(row, this.rows) && inRange(col, this.cols)) {                    
            return this.sqrs[(this.cols * (row - 1)) + (col - 1)]
        }        
    }
    
    openSqr(row, col) {      
        let sqr = this.sqrAt(row, col)
        
        this.openedArr.forEach(s => s.chainCount = null)
        this.openedArr = []
        
        if (!this.ended && sqr) {
            sqr.chainCount = 0
            
            if (!sqr.opened && !sqr.flagged) {
                this.openedArr.push(sqr)
            } else {
                let unFlagged = sqr.neighbours.filter(s => !s.flagged && !s.opened),
                    flagged = sqr.neighbours.filter(s => s.flagged).length
                    
                if (sqr.mineCount == flagged) {
                    unFlagged.forEach(s => {
                        s.chainCount = 0
                        this.openedArr.push(s)
                    })
                }
            }
            
            for (const sqr of this.openedArr) {
                sqr.opened = true
                
                if (!sqr.mineCount) {
                    sqr.neighbours.forEach(s => {
                        if (!s.opened && !s.flagged && s.chainCount == null) {
                            s.chainCount = sqr.chainCount + 1
                            this.openedArr.push(s)
                        }
                    })
                }
                
                if (sqr.opened && sqr.rigged) break
            }
        }
    }
    
    flagSqr(row, col) {
        let sqr = this.sqrAt(row, col)
        
        if (sqr && !sqr.opened && !sqr.flagged && this.flagCount && !this.ended && this.started) {
            sqr.flagged = true
            this.flagCount--
        }
    }
    
    unflagSqr(row, col) {
        let sqr = this.sqrAt(row, col)
        
        if (sqr && sqr.flagged && !this.ended) {
            sqr.flagged = false
            this.flagCount++
        }
    }
    
    toggleFlag(row, col) {
        let sqr = this.sqrAt(row, col)
        
        if (sqr) {
            if (sqr.flagged) this.unflagSqr(sqr.row, sqr.col)
            else this.flagSqr(sqr.row, sqr.col)
        }
    }
    
    getStringData() {
        let str = ""
        
        str += this.seed + "\n"
        
        this.sqrs.forEach(s => {
            let char = s.opened ? "o" : s.flagged ? "f" : "c"
            if (s.rigged) char = char.toUpperCase()
            
            str += char
            
            if (s.col == this.cols && s.row != this.rows) str += "\n"
        })
        
        return str
    }
    
    static getFullSeed(rows, cols, mines, seed) {
        let rowStr = rows.toString(16),
            colStr = cols.toString(16),
            mineStr = mines.toString(16),
            numSeed = isNaN(Number(seed)) ? hashCode(seed) : Number(seed),
            seedStr = numSeed.toString(16)
            
         let startStr = rowStr + "#" + colStr + "#" + mineStr + "#" + seedStr,
             rand = seedRand(startStr.length)
        
         return startStr.split("").sort(() => rand.next().value > .5 ? 1 : -1).join("")
    }
    
    static decodeFullSeed(str) {
        let rand = seedRand(str.length),
            mockArr = new Array(str.length).fill().map((_, i) => i)
                .sort(() => rand.next().value > .5 ? 1 : -1),
            valsArr = mockArr.map((_, i) => str[mockArr.indexOf(i)]).join("").split("#")
            
        function getNum(hex) {
            if (hex) {
                let abs = hex.replace("-", ""),
                    neg = hex.includes("-")
                    
                return Number("0x" + abs) * (neg ? -1 : 1)
            }
        }
            
        return {
            rows: getNum(valsArr[0]),
            cols: getNum(valsArr[1]),
            mines: getNum(valsArr[2]),
            seed: getNum(valsArr[3])
        }
    }
    
    static isValidSeed(str) {
        let obj = Minesweeper.decodeFullSeed(str)
        
        return !isNaN(obj.rows) && !isNaN(obj.cols) && !isNaN(obj.mines) && !isNaN(obj.seed)
    }
    
    static createFromString(str) {
        let rowArr = str.split("\n"),
            rows = rowArr.length - 1,
            cols = rowArr[1].length,
            game = new Minesweeper(rows, cols, 0, rowArr[0])
        
        for (const s of game.sqrs) {
            let char = rowArr[s.row][s.col - 1],
                rigged = char.toLowerCase() != char
            
            char = char.toLowerCase()
            
            s.rigged = rigged
            
            if (rigged) {
                game.mines++
                game.flagCount++
            }
            
            switch(char) {
                case "o":
                    s.opened = true
                    break
                case "f":
                    s.flagged = true
                    game.flagCount--
                    break
            }
        }
        
        game.sqrs.forEach(s => {
            s.updateMineCount()
            s.updateNeighbours()
        })
        
        return game
    }
}