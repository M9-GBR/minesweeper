import Tab from "./tab.js"
import {get} from "../utils.js"

class InfoTab extends Tab {
    body = get("#info-tab-body")
    
    constructor() {
        super(get("#info-tab"), get("#info-tab-head button"))
    }
    
    open(text = "") {
        super.open()
        
        this.body.innerHTML = ""
        
        if (typeof text == "string") this.body.innerHTML = text
        else this.body.appendChild(text)
    }
}

const infoTab = new InfoTab
export default infoTab