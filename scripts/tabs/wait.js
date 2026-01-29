import Tab from "./tab.js"
import {get} from "../utils.js"

class WaitTab extends Tab {
    textElem = get("#wait-text")
    bar = get("#load-bar")
    barMain = get("#load-bar div")
    
    constructor() {
        super(get("#wait-tab"))
    }
    
    open(text = "", loadBar = true) {
        super.open()
        
        this.updateBar(0)
        
        loadBar ? this.bar.classList.remove("hide-2") : this.bar.classList.add("hide-2")
        
        this.textElem.textContent = ""
        
        if (typeof text == "string") {
            this.textElem.innerHTML = text
        }
    }
    
    updateBar(num) {
        this.barMain.style.width = (num * 100) + "%"
    }
}

const waitTab = new WaitTab
export default waitTab