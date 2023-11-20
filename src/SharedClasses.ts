import {RedirectRule} from "./backend/Redirects";
import {unwrap} from "solid-js/store";
import {runtime, storage} from "webextension-polyfill";

// Stolen from jsxt
function stringf(str: string, ...args: any[]) {
    return str.replace(/\{(\d+)}/g, function($0, $1) {
        return args[$1] !== void 0 ? args[$1] : $0;
    });
}

interface RuleData extends JsonObject {
    name: string
    regex: string
    redirectUrls: string[]
}

function emptyRuleData(): RuleData {
    return <RuleData>{
        name: "NAME ME",
        regex: "",
        redirectUrls: []
    }
}

async function saveRules(rules: RuleData[]) {
    // console.log(`saving ${JSON.stringify(rules)}`)
    await storage.local.set({"rules": unwrap(rules)})
    runtime.sendMessage(<RuleUpdateEvent>{name: "update"})
}

async function loadRules(): Promise<RedirectRule[]> {
    // console.log(`stored: ${await chrome.storage.local.get("rules")}`)
    const loaded: RuleData[] | undefined = (await storage.local.get("rules"))["rules"] as RuleData[]
    if (loaded == null) return [new RedirectRule()]
    console.log(`Loaded config: ${JSON.stringify(loaded)}`)
    return loaded.map(d => {
        const rule = new RedirectRule()
        rule.load(d)
        return rule
    })
}
interface BaseEvent extends JsonObject {
    name: string
}

interface UrlSelectionEvent extends BaseEvent {
    name: "select"
    url: string
    newTab: boolean
    opened: boolean
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

function copy<T extends JsonObject>(object: T, properties: Partial<T>): T {
    const copy: T = Object.assign({}, object)
    return Object.assign(copy, properties)

}

export {
    copy,
    stringf,
    saveRules, loadRules,
    emptyRuleData
};
export type {
    UrlSelectionEvent,
    RuleUpdateEvent,
    JsonObject,
    Serializable,
    BaseEvent,
    RuleData
};