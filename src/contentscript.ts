import {UrlSelectionEvent} from "./SharedClasses";

// console.log(`Doc is ${document}, window is ${window}, chrome is ${chrome}`)

// var lastSelected: Element | null
var wasBody: boolean = false
var timerId: number = -1

document.addEventListener("mouseover", (e) => {
    const elements: Element[] = document.elementsFromPoint(e.x, e.y)
    if (elements.length == 0) return;
    let current: Element
    let depth: number = 0
    do {
        current = elements[depth]
        if (current instanceof HTMLAnchorElement) {
            wasBody = false
            // console.log(`found in the depths of ${depth}`)
            scheduleSend(current.href, true)
            return;
        }
        depth++
    } while (depth < elements.length && !(current instanceof HTMLBodyElement))
    if (!wasBody) {
        scheduleSend(window.location.href, false)
        wasBody = true
    }
})

function scheduleSend(url: string, newTab: boolean) {
    if (timerId != -1) {
        clearTimeout(timerId)
        // console.log("cleared prev")
    }
    timerId = setTimeout(() => {
        chrome.runtime.sendMessage(<UrlSelectionEvent>{
            name: "select",
            url: url,
            newTab: newTab
        })
        // console.log(`Sent: ${url}`)
        timerId = -1
    }, 250)
}