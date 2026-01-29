this.onmessage = async (ev) => {
    let Minesweeper = (await import("./game/minesweeper.js")).default

    let game = new Minesweeper(ev.data),
        zeroSqrs = game.sqrs.filter(sqr => !sqr.mineCount),
        minTime = 0, maxTime = 0
    
    this.postMessage({ val: .2 })

    for (const sqr of zeroSqrs) {
        if (!sqr.opened) {
            game.openSqr(sqr.row, sqr.col)
            minTime++
        }
    }

    this.postMessage({ val: .4 })

    game.sqrs.forEach(sqr => {
        if (!sqr.opened && !sqr.rigged) {
            minTime++
        }
    })

    this.postMessage({ val: .6 })

    game.sqrs.forEach(sqr => {
        if (sqr.mineCount > 0) {
            maxTime++
        } else {
            sqr.opened = false
        }
    })

    this.postMessage({ val: .8 })

    zeroSqrs.forEach(sqr => {
        if (!sqr.opened) {
            game.openSqr(sqr.row, sqr.col)
            maxTime++
        }
    })

    this.postMessage({ minTime, maxTime })
}
