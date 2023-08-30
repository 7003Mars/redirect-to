import {JsonObject, loadRules, RuleUpdateEvent, stringf, UrlSelectionEvent} from "./SharedClasses";
import {RedirectRule, RuleData} from "./Redirects";
import Tab = chrome.tabs.Tab;

var newTab: boolean = false
let rules: RedirectRule[] = []

// Hacky patch for data persistence
function keepAlive() {
    setInterval(chrome.runtime.getPlatformInfo, 20e3)
}
chrome.runtime.onStartup.addListener(keepAlive)
keepAlive()


interface CacheData extends JsonObject {
    groups: string[]
}

// TODO: Check if this even works
console.log("Service worker started!")
loadRules().then(loaded => {
    chrome.contextMenus.removeAll()
    // loaded.forEach(async (r) => {
    //     const cache: CacheData | null = (await chrome.storage.session.get(r.name))[r.name] as CacheData
    //     if (cache == null) return
    //     console.log(`Cache load: ${r.name} (${JSON.stringify(cache)})`)
    //     r.capturedGroups = cache.groups
    // })
    rules = loaded
    //
    // chrome.storage.session.get((p) => {
    //     console.log("Session storage:")
    //     console.dir(p)
    //     console.log(`All rules: ${rules}`)
    // })
})

chrome.runtime.onMessage.addListener((message: UrlSelectionEvent) => {
    // Check name to ensure the message is actually a UrlSelectionEvent
    if (message.name != "select") return;
    newTab = message.newTab
    rebuildMenus(message.url)
})

chrome.runtime.onMessage.addListener(async (message: RuleUpdateEvent) => {
    if (message.name != "update") return
    rebuildMenus("")
    rules = await loadRules()
})

chrome.tabs.onActivated.addListener(async (e) => {
    const tab: Tab = await chrome.tabs.get(e.tabId)
    rebuildMenus(tab.url!)
})

function rebuildMenus(url: string) {
    chrome.contextMenus.removeAll(() => {
        // const obj: JsonObject = {}
        rules.forEach(r => {
            r.buildContextMenu(url, false)
            // obj[r.id.toString()] = <CacheData>{
            //     groups: r.capturedGroups
            // }
        })
        // chrome.storage.session.set(obj)
    })
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
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
        chrome.tabs.create({
            windowId: tab!.windowId,
            index: tab!.index+1,
            url: redirectUrl
        })
    } else {
        chrome.tabs.update(tab!.id!, {
            url: redirectUrl
        })
    }

})