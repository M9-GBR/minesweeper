import { setData, getData } from "./utils.js"

export default class Statistics {
    gamesPlayed = []

    get won() {
        return this.gamesPlayed.filter(g => g.won)
    }

    get lost() {
        return this.gamesPlayed.filter(g => !g.won)
    }

    add(...args) {
        this.gamesPlayed.push(new GameStat(...args))
        this.save()
    }

    load() {
        this.gamesPlayed = getData('stats') || []
    }

    save() {
        setData('stats', this.gamesPlayed)
    }

    clear() {
        this.gamesPlayed = []
        this.save()
    }

    getPointsFromGame(game) {
        let points = 0,
            baseDiff = game.mines / (game.rows * game.cols),
            accDiff = baseDiff * game.mines

        if (game.won) {
            let min = game.timeRange.minTime, max = game.timeRange.maxTime,
                factor = game.time <= min ? 2 : game.time > min && game.time <= max ? 1 : 0

            points += accDiff + (accDiff * factor)
        } else points -= accDiff * (1 - baseDiff)

        return Number(points.toFixed(3))
    }

    getMasteryPoints() {
        let points = 0

        this.gamesPlayed.forEach(g => {
            points += this.getPointsFromGame(g)
        })

        return Number(points.toFixed(3))
    }
}

export class GameStat {
    constructor(date, r, c, m, s, won, time, timeRange) {
        this.rows = r
        this.cols = c
        this.mines = m
        this.seed = s
        this.date = date
        this.won = won
        this.time = time
        this.timeRange = timeRange
    }
}