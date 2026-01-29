import {nbVecs} from '../utils.js'

export default class Square {
    row = 0
    col = 0
    rigged = false
    opened = false
    flagged = false
    mineCount = 0
    chainCount
    neighbours = []
    
    updateMineCount() {
        this.mineCount = this.rigged ? 'M' : this.neighbours.filter(sqrs => sqrs.rigged).length
    }
    
    updateNeighbours() {
        this.neighbours = nbVecs.map(vec => this.game.sqrAt(this.row + vec.x, this.col + vec.y)).filter(sqr => sqr)
    }

    constructor(game, row, column) {
        this.game = game
        this.row = row
        this.col = column
    }
}
