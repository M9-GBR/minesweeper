export default class Tab extends EventTarget {
    app

    constructor(elem, closeBtn) {
        super()

        this.elem = elem
        /**@type {HTMLDialogElement} */
        this.wrap = elem.parentElement

        if (closeBtn) {
            this.closeBtn = closeBtn
            this.closeBtn.addEventListener("click", () => this.close())
        }

    }

    #openEvent = new CustomEvent("open")
    open() {
        if (!this.wrap.open) {
            this.wrap.showModal()
            this.wrap.classList.remove('hide')
            this.dispatchEvent(this.#openEvent)
        }
    }

    #closeEvent = new CustomEvent("close")
    close() {
        this.wrap.classList.add("hide")

        let func = () => {
            this.wrap.close()
            this.dispatchEvent(this.#closeEvent)
        }

        if (getComputedStyle(this.wrap).opacity == 0) func()
        else {
            this.wrap.addEventListener('transitionend', () => func(), { once: true })
        }
    }
}