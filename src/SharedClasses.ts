
// Stolen from jsxt
import {RedirectRule, RuleData} from "./Redirects";

function stringf(str: string, ...args: any[]) {
    return str.replace(/\{(\d+)\}/g, function($0, $1) {
        return args[$1] !== void 0 ? args[$1] : $0;
    });
}

async function saveRules(rules: RedirectRule[]) {
    await chrome.storage.local.set({"rules": rules.map(r => r.save())})
    chrome.runtime.sendMessage(<RuleUpdateEvent>{name: "update"})
}

async function loadRules(): Promise<RedirectRule[]> {
    // console.log(`stored: ${await chrome.storage.local.get("rules")}`)
    const loaded: RuleData[] | undefined = (await chrome.storage.local.get("rules"))["rules"] as RuleData[]
    if (loaded == null) return [new RedirectRule()]
    console.log(`loaded ${loaded}`)
    return loaded.map(d => {
        const rule = new RedirectRule()
        rule.load(d)
        return rule
    })
}

var a = 0

interface BaseEvent extends JsonObject {
    name: string
}

interface UrlSelectionEvent extends BaseEvent {
    name: "select"
    url: string
    newTab: boolean
}

interface RuleUpdateEvent extends BaseEvent {
    name: "update"
}

type JsonAbleTypes = null | boolean | number | string | Array<JsonAbleTypes> | JsonObject

type JsonObject = {
    [key: string]: JsonAbleTypes
}

interface Serializable<T extends JsonObject> {
    save(): T

    load(object: T): boolean
}

export {
    stringf,
    saveRules, loadRules
};
export type {
    UrlSelectionEvent,
    RuleUpdateEvent,
    JsonObject,
    Serializable,
    BaseEvent
};
