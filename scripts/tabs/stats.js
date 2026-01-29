import Tab from './tab.js'
import { get, getTimeStr } from '../utils.js'
import confirmTab from './confirm.js'
import infoTab from './info.js'

class StatsTab extends Tab {
    _state = 0
    get state() {
        return this._state
    }
    set state(num) {
        this._state = num

        this.slFilterBtn.textContent = num == 0 ? 'All' : num == 1 ? 'Won' : num == 2 ? 'Lost' : 'All'

        this.openListElem()
    }

    get stats() {
        return this.app.stats
    }

    stateArr = [[true, true], [true, false], [false, true]]

    mainElem = get("#stats-main")
    playedBtn = get("#stats-gp")
    winBtn = get("#stats-gw")
    lostBtn = get("#stats-gl")
    clearBtn = get("#clear-stats-btn")
    masteryBtn = get("#stats-mastery")

    listElem = get("#stats-list")
    slBackBtn = get("#sl-back-btn")
    slFilterWrap = get("#sl-filter-wrap")
    slFilterBtn = get("#sl-filter-wrap > button")
    slFilterDropdown = get("#sl-filter-dropdown")

    tableBody = get("#sl-body tbody")

    masteryPointsInfo = get("#mastery-points-info-wrap")

    constructor() {
        super(get("#stats-tab"), get("#stats-head button"))

        this.clearBtn.addEventListener('click', async () => {
            let bool = await confirmTab.open("Clear all stats data?", false)

            if (bool) {
                this.app.stats.clear()
                this.updateElems()
            }
        })

        this.playedBtn.addEventListener("click", () => this.state = 0)
        this.winBtn.addEventListener("click", () => this.state = 1)
        this.lostBtn.addEventListener("click", () => this.state = 2)
        this.masteryBtn.addEventListener("click", () => {
            infoTab.open(this.masteryPointsInfo)
        })
        this.slBackBtn.addEventListener("click", () => this.backToMain())

        this.slFilterBtn.addEventListener('click', () => {
            let num = this.slFilterWrap.dataset.active
            this.slFilterWrap.dataset.active = num == '1' ? '0' : '1'
        })

        document.addEventListener('click', ev => {
            if (!this.slFilterBtn.contains(ev.target)) this.slFilterWrap.dataset.active = '0'
        });

        [...this.slFilterDropdown.children].forEach((c, i) => c.addEventListener('click', () => this.state = i))

        this.masteryPointsInfo.remove()
    }

    open() {
        super.open()
        this.updateElems()
        this.backToMain()
    }

    updateElems() {
        this.playedBtn.children[1].textContent = this.stats.gamesPlayed.length
        this.winBtn.children[1].textContent = this.stats.won.length
        this.lostBtn.children[1].textContent = this.stats.lost.length
        this.masteryBtn.children[1].textContent = this.stats.getMasteryPoints()
    }

    openListElem() {
        this.mainElem.classList.add("hide-2")
        this.clearBtn.classList.add('hide')
        this.listElem.classList.remove("hide-2")

        this.tableBody.innerHTML = ""

        let i = 0

        this.stats.gamesPlayed.forEach(g => {
            let tr = document.createElement('tr')

            if ((g.won && this.stateArr[this.state][0]) || (!g.won && this.stateArr[this.state][1])) {
                let tdDate = document.createElement('td'),
                    tdR = document.createElement('td'),
                    tdC = document.createElement('td'),
                    tdM = document.createElement('td'),
                    tdS = document.createElement('td'),
                    tdStatus = document.createElement('td'),
                    tdTime = document.createElement('td')

                tdDate.textContent = new Date(g.date).toLocaleString()
                tdR.textContent = g.rows
                tdC.textContent = g.cols
                tdM.textContent = g.mines
                tdS.textContent = g.seed
                tdStatus.textContent = g.won ? 'Won' : 'Lost'
                tdTime.textContent = g.won ? getTimeStr(g.time) : '--'

                if (g.won) {
                    tdTime.style.color = g.time <= g.timeRange.minTime ? "var(--green)" : g.time > g.timeRange.minTime && g.time <= g.timeRange.maxTime ? "var(--yellow)" : "var(--red)"
                }

                tr.append(tdDate, tdR, tdC, tdM, tdS, tdStatus, tdTime)

                this.tableBody.appendChild(tr)

                if (!(i % 2)) tr.style.backgroundColor = 'light-dark(#ddf, #333)'

                i++
            }
        })
    }

    backToMain() {
        this.mainElem.classList.remove("hide-2")
        this.clearBtn.classList.remove('hide')
        this.listElem.classList.add("hide-2")
    }
}

const statsTab = new StatsTab
export default statsTab