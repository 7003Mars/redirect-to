import {RuleData, Serializable, stringf} from "../SharedClasses";
import {contextMenus} from "webextension-polyfill";

class RedirectRule implements Serializable<RuleData> {
    private static gid: number = 0;
    public name: string = "";
    public regex: RegExp = new RegExp("");
    public id: number = RedirectRule.gid++;
    public redirectUrls: string[] = [];

    // Temp stuff
    public capturedGroups: string[] = []

    buildContextMenu(url: string, createParent: boolean) {
        const result = this.regex.exec(url)
        console.log(`Matching ${url} against ${this.regex.source}: \n${result}`)
        if (result == null || result.length <= 1) {
            return
        }
        const groups: string[] = result.splice(1, result.length)
        // console.log(`Groups are ${groups}`)
        this.capturedGroups = groups
        contextMenus.create({
            title: this.name,
            id: this.id.toString(),
            contexts: ["link", "page"]
        })
        // console.log(`redirects for ${this.name}: ${this.redirectUrls.length}`)
        for (let i = 0; i < this.redirectUrls.length; i++) {
            const replaced = stringf(this.redirectUrls[i], groups)
            contextMenus.create({
                id: this.id + "-" + i,
                parentId: this.id.toString(),
                title: replaced,
                contexts: ["link", "page"]
            })
        }
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

export {
    RedirectRule
};
