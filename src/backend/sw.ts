import {loadRules, RuleUpdateEvent, stringf, UrlSelectionEvent} from "../SharedClasses";
import {RedirectRule} from "./Redirects";
import {contextMenus, runtime, Tabs, tabs} from "webextension-polyfill";
import Tab = Tabs.Tab;

var newTab: boolean = false
let rules: RedirectRule[] = []

// TODO: Check if this even works
console.log("Service worker started!")
loadRules().then(async loaded => {
    rules = loaded
    const url = (await tabs.getCurrent())?.url ?? ""
    await rebuildMenus(url)
})

runtime.onMessage.addListener((message: UrlSelectionEvent) => {
    // Check name to ensure the message is actually a UrlSelectionEvent
    if (message.name != "select") return;
    newTab = message.newTab
    rebuildMenus(message.url)
})

runtime.onMessage.addListener(async (message: RuleUpdateEvent) => {
    if (message.name != "update") return
    rules = await loadRules()
})

tabs.onActivated.addListener(async (e) => {
    const tab: Tab = await tabs.get(e.tabId)
    rebuildMenus(tab.url!)
})

async function rebuildMenus(url: string) {
    await contextMenus.removeAll()
    // const obj: JsonObject = {}
    rules.forEach(r => {
        r.buildContextMenu(url, false)
        // obj[r.id.toString()] = <CacheData>{
        //     groups: r.capturedGroups
        // }
    })
    // chrome.storage.session.set(obj)
}

contextMenus.onClicked.addListener((info, tab) => {
    console.log(`Clicked id: ${info.menuItemId}`)
    if (!(typeof info.menuItemId === "string")) return;
    const menuId = info.menuItemId as String
    const index = menuId.indexOf("-")
    if (index == -1) return;
    const id: number = parseInt(menuId.substring(0, menuId.indexOf("-")))
    const pageId: number = parseInt(menuId.substring(index+1, menuId.length))
    const redirect: RedirectRule | undefined = rules.find(r => r.id == id)
    if (redirect == null) {
        console.error("Redirect is undefined!")
        return;
    }
    console.log(`redirect is ${redirect}, id is ${id}, pageig is ${pageId} menudi is ${menuId}`)
    let redirectUrl: string = redirect.redirectUrls[pageId]
    if (!redirectUrl.startsWith("https://") && !redirectUrl.startsWith("http://")) {
        redirectUrl = "https://" + redirectUrl
    }
    redirectUrl = stringf(redirectUrl, redirect.capturedGroups)
    console.log(`Redirecting to ${redirectUrl}`)
    if (newTab) {
        tabs.create({
            windowId: tab!.windowId,
            index: tab!.index+1,
            url: redirectUrl
        })
    } else {
        tabs.update(tab!.id!, {
            url: redirectUrl
        })
    }

})