import {BaseEvent, loadRules, RuleUpdateEvent, stringf, UrlSelectionEvent} from "./SharedClasses";
import {RedirectRule} from "./Redirects";

var newTab: boolean = false
let rules: RedirectRule[] = []

loadRules().then(loaded => {
    rules.forEach(r => r.rebuildContextMenu("", false))
    rules = loaded
})

chrome.runtime.onMessage.addListener((message: UrlSelectionEvent) => {
    // Check name to ensure the message is actually a UrlSelectionEvent
    if (message.name != "select") return;
    newTab = message.newTab
    rules.forEach((r) => r.rebuildContextMenu(message.url, false))
})

chrome.runtime.onMessage.addListener(async (message: RuleUpdateEvent) => {
    if (message.name != "update") return
    rules.forEach(r => r.rebuildContextMenu("", false))
    rules = await loadRules()
})


chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(`Clicked id: ${info.menuItemId}`)
    if (!(typeof info.menuItemId === "string")) return;
    const menuId = info.menuItemId as String
    const index = menuId.indexOf("-")
    if (index == -1) return;
    const id: number = parseInt(menuId.substring(0, menuId.indexOf("-")))
    const pageId: number = parseInt(menuId.substring(index+1, menuId.length))
    const redirect: RedirectRule = rules[id]
    console.log(`redirect is ${redirect}, id is ${id}, pageig is ${pageId} menudi is ${menuId}`)
    let redirectUrl: string = redirect.redirectUrls[pageId]
    if (!redirectUrl.startsWith("https://") && !redirectUrl.startsWith("http://")) {
        redirectUrl = "https://" + redirectUrl
    }
    redirectUrl = stringf(redirectUrl, redirect.capturedGroups)
    console.log(`new url is ${redirectUrl}`)
    // console.log("something fishy!")
    if (newTab) {
        // console.log("oii")
        chrome.tabs.create({
            windowId: tab!.windowId,
            index: tab!.index,
            url: redirectUrl
        })
    } else {
        chrome.tabs.update(tab!.id!, {
            url: redirectUrl
        })
    }

})

// const red = new RedirectRule("Among", /https:\/\/(.*)/)
// rules.push(red)
// red.redirectUrls = ["http://google.com/search?q={0}", "{0}"]
// red.rebuildContextMenu("https://hi.com/wow", false)


export {
    // RedirectRule
}
