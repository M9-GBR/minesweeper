export default class AppSquare {
    row = 0
    col = 0
    alpha = 1
    input = true

    opened = false
    flagged = false
    mineCount = null
    overlayColor = null
    
    get x() {
        return (this.col - 1) * this.app.sqrSize + this.app.sqrSize / 2
    }
    
    get y() {
        return (this.row - 1) * this.app.sqrSize + this.app.sqrSize / 2
    }
    
    get startX() {
        return this.x - this.app.sqrSize / 2
    }
    
    get startY() {
        return this.y - this.app.sqrSize / 2
    }
    
    get endX() {
        return this.x + this.app.sqrSize / 2
    }
    
    get endY() {
        return this.y + this.app.sqrSize / 2
    }
    
    constructor(app, row, col, mineCount, opened = false, flagged = false) {
        this.app = app
        this.row = row
        this.col = col
        this.mineCount = mineCount || null
        this.opened = opened
        this.flagged = flagged
    }
}