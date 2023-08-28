import {JsonObject, Serializable, stringf} from "./SharedClasses";

class RedirectRule implements Serializable<RuleData>{
    private static gid: number = 0;
    public name: string = "NAME ME";
    public regex: RegExp = new RegExp("");
    public id: number = RedirectRule.gid++;
    public redirectUrls: string[] = [];

    // Temp stuff
    public capturedGroups: string[] = []
    public shown: boolean = false

    /**
     * Should be called from service worker
     */
    rebuildContextMenu(url: string, createParent: boolean) {
        const result = this.regex.exec(url)
        console.log(`Matching ${this.regex.source}: ${result}`)
        if (result == null || result.length <= 1) {
            this.clearMenu()
            return
        }
        const groups: string[] = result.splice(1, result.length)
        console.log(`Groups are ${groups}`)
        this.capturedGroups = groups

        if (!this.shown) {
            chrome.contextMenus.create({
                title: this.name,
                id: this.id.toString(),
                contexts: ["link", "page"]
            })
        }
        console.log(`redirects for ${this.name}: ${this.redirectUrls.length}`)
        for (let i = 0; i < this.redirectUrls.length; i++) {
            const replaced = stringf(this.redirectUrls[i], groups)
            if (this.shown) {
                // console.log(`update ${this.id}-${i}`)
                chrome.contextMenus.update(this.id + "-" + i, {
                    title: replaced,
                })
            } else {
                // console.log(`create ${this.id}-${i}`)
                chrome.contextMenus.create({
                    id: this.id + "-" + i,
                    parentId: this.id.toString(),
                    title: replaced,
                    contexts: ["link", "page"]
                })
            }
        }
        this.shown = true
    }

    public clearMenu(): boolean {
        console.log(`Clearing: ${this.shown}`)
        if (this.shown) {
            chrome.contextMenus.remove(this.id.toString())
            for (let i = 0; i < this.redirectUrls.length; i++) {
                chrome.contextMenus.remove(this.id + "-" + i)
            }
            this.shown = false
            return true
        }
        return false
    }

    load(object: RuleData): boolean {
        this.name = object.name
        this.regex = new RegExp(object.regex)
        this.redirectUrls = object.redirectUrls
        return true
    }

    save(): RuleData {
        return {
            name: this.name,
            regex: this.regex.source,
            redirectUrls: this.redirectUrls
        }
    }
}

interface RuleData extends JsonObject {
    name: string
    regex: string
    redirectUrls: string[]
}

function emptyRuleData(): RuleData {
    return <RuleData> {
        name: "NAME ME",
        regex: "",
        redirectUrls: []
    }
}

export {
    RedirectRule,
    emptyRuleData
};
export type { RuleData };
