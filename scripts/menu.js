import {get, touchHoldEvent} from './utils.js'
import newGameTab from './tabs/new-game.js'
import statsTab from './tabs/stats.js'
import settingsTab from './tabs/settings.js'
import infoTab from './tabs/info.js'
       
class Menu {
    menuElem = get('#menu')
    aboutGameWrap = get("#about-game-wrap")
    app
    
    constructor() {
        this.configBtn()
        
        document.addEventListener('pointerdown', ev => {
            if (!this.menuElem.contains(ev.target) && !this.menuBtn.contains(ev.target)) {
                this.close()
            }
        })
       
        let lastPos = 0, menuBar = get('#header')
        document.addEventListener('scroll', () => {
            if (window.scrollY > lastPos) {
                menuBar.classList.add('hide-up')
            } else {
                menuBar.classList.remove('hide-up')
            }
        
            lastPos = window.scrollY
        })
    
        this.newGameBtn = this.addItem('New Game', "plus")
        this.statsBtn = this.addItem('Statistics', "stats")
        this.settingsBtn = this.addItem('Settings', "settings")
        this.aboutBtn = this.addItem('About', "info")

        this.newGameBtn.wrap.classList.add('ctx-elem')
        
        this.newGameBtn.wrap.addEventListener('click', () => {
            newGameTab.open()
        })
       
        touchHoldEvent(this.newGameBtn.wrap, () => {
            this.app.audio.play("click")
            newGameTab.open(true)
            this.close()
        })

        this.statsBtn.wrap.addEventListener('click', () => statsTab.open())

        this.settingsBtn.wrap.addEventListener("click", () => {
            settingsTab.open()
        })

        this.aboutBtn.wrap.addEventListener("click", () => {
            infoTab.open(this.aboutGameWrap)

            let li = index => {
                let elem = get(`#link-list div:nth-of-type(${index}) a`)
                elem.textContent = ""
                return elem
            }

            li(1).append(this.app.svgs.envelope)
            li(2).append(this.app.svgs.reddit)
            li(3).append(this.app.svgs["facebook-f"])
        })

        this.aboutGameWrap.remove()
    }

    configBtn() {
        this.menuBtn = get('#menu-btn')
        this.btnInput = get('#menu-btn input')
        
        this.btnInput.oninput = () => {
            this.btnInput.checked ? this.open() : this.close()
        }
    }
    
    items = []
    addItem(text, imgSrc) {
        let item = new MenuItem(this, text, imgSrc)
        
        this.menuElem.appendChild(item.wrap)

        this.items.push(item)
        
        return item
    }
    
    open() {
        get("#menu-btn input").checked = true
        this.menuElem.classList.remove('hide-2')
    }
    
    close() {
        get("#menu-btn input").checked = false
        this.menuElem.classList.add('hide-2')
        this.btnInput.checked = false
    }
} 

class MenuItem {
    constructor(menu, text, svgName) {
        this.menu = menu
        
        this.textElem = null
        this.svg = null
        this.text = text
        this.svgName = svgName
        
        this.wrap = document.createElement('button')
        this.wrap.classList.add('menu-item')

        this.wrap.addEventListener('click', () => this.menu.close())
    }

    update() {
        this.wrap.textContent = ""

        this.textElem = document.createElement("div")
        this.textElem.textContent = this.text
        this.svg = this.menu.app.svgs[this.svgName]

        this.wrap.appendChild(this.svg)
        this.wrap.appendChild(this.textElem)
    }
}

const menu = new Menu

export default menu