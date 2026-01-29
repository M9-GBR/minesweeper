function* seedRand(seed) {
    while (true) {
        let t = (seed += 1831565813)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        yield ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * @returns {HTMLElement}
 */
function get(str) {
    return document.querySelector(str)
}

function inRange(num, min, max) {
    return num >= min && num <= max
}

/*function hashCode(s) {
    let hash = 0
    
    for (const char of s) {
        hash = ((hash << 5) - hash) + char.charCodeAt(0)
        hash |= 0
    }
    
    return hash
}*/

function hashCode(str) {
    let hash = 0

    for (let i = 0; i < str.length; i++) {
        hash += Math.pow(str[i].charCodeAt(0) * 31, str.length - i);
        hash &= hash
    }

    return hash
}

let vec2 = (x, y) => ({ x, y })

const nbVecs = [
    vec2(-1, 0), vec2(1, 0),
    vec2(0, -1), vec2(0, 1),
    vec2(-1, -1), vec2(-1, 1),
    vec2(1, -1), vec2(1, 1)
]

function touchHoldEvent(elem, cb, delay = 500) {
    let timeout

    elem.addEventListener("touchstart", () => {
        timeout = setTimeout(() => {
            cb()
        }, delay)
    });

    ["touchmove", "touchend"].forEach(ev => {
        elem.addEventListener(ev, () => clearTimeout(timeout))
    })

    elem.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        cb()
    })
}

function randInt(bits, signed = true) {
    let max = Math.pow(2, bits - (signed ? 1 : 0)),
        min = signed ? -max : 0

    return Math.floor(Math.random() * (max - min)) + min
}

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

function getTimeObj(sec) {
    const day = 24 * 60 * 60,
        hr = 60 * 60

    let days = Math.floor(sec / day), rDays = sec % day,
        hrs = Math.floor(rDays / hr), rHrs = rDays % hr,
        mins = Math.floor(rHrs / 60), secs = rHrs % 60

    return { days, hrs, mins, secs }
}

function getTimeStr(sec) {
    let obj = getTimeObj(sec),
        strArr = ["d", "h", "m", "s"],
        i = 0,
        str = ""

    for (const p in obj) {
        str += (obj[p] ? obj[p] + strArr[i] + " " : "")
        i++
    }

    if (!sec) return "0s"

    return str.trim()
}

function getData(name, session = false) {
    return JSON.parse(session ? sessionStorage.getItem(name) : localStorage.getItem(name))
}

function setData(name, value, session = false) {
    session ? sessionStorage.setItem(name, JSON.stringify(value)) : localStorage.setItem(name, JSON.stringify(value))
}

export {
    seedRand,
    nbVecs,
    get,
    inRange,
    hashCode,
    touchHoldEvent,
    randInt,
    random,
    getTimeObj,
    getTimeStr,
    getData,
    setData
}