import Tab from './tab.js'
import { get } from '../utils.js'

class ConfirmTab extends Tab {
    app

    textElem = get('#confirm-body')
    okBtn = get('#ct-ok-btn')
    cancelBtn = get('#ct-cancel-btn')

    constructor() {
        super(get('#confirm-tab'))
    }

    open(text, good = true) {
        super.open()
        this.textElem.innerHTML = text

        if (good) this.okBtn.focus()
        else this.cancelBtn.focus()

        return new Promise(resolve => {
            let func = bool => {
                resolve(bool)
                this.close()
            }

            this.okBtn.onclick = () => func(true)
            this.cancelBtn.onclick = () => func(false)
        })
    }
}

const confirmTab = new ConfirmTab

export default confirmTab
