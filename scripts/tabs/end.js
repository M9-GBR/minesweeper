import { GameStat } from "../stats.js"
import { get, randInt } from "../utils.js"
import Tab from "./tab.js"

class GameEndTab extends Tab {
    statusElem = get("#get-status h2")
    pointsElem = get("#get-status p")
    playBtn = get("#get-btns-wrap button:first-of-type")
    confettis = []

    constructor() {
        super(get("#game-end-tab"), get("#get-btns-wrap button:not(:first-of-type)"))
    }

    open(gameIndex) {
        super.open()

        let g = this.app.stats.gamesPlayed[gameIndex]

        this.statusElem.textContent = "You " + (g.won ? "Won" : "Lost")

        this.playBtn.onclick = () => {
            this.app.newGame(g.rows, g.cols, g.mines, !g.won ? g.seed : randInt(48))
            this.close()
        }

        this.playBtn.textContent = g.won ? "Play Again" : "Retry"

        this.pointsElem.textContent = (g.won ? "+" : "-") + this.app.stats.getPointsFromGame(g) + " MP"
        this.pointsElem.style.color = `var(--${g.won ? "green" : "red"})`

        if (g.won) {
            this.closeBtn.focus()
        } else {
            this.playBtn.focus()
        }
    }
}

const gameEndTab = new GameEndTab
export default gameEndTab