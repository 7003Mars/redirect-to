import {Component} from "solid-js";
import {copy, RuleData} from "../SharedClasses";
import RegexInput from "./RegexInput";
import RedirectLinkInput from "./RedirectLinkInput";

interface Options {
    viewing: RuleData
    onUpdate: (rule: RuleData) => void
}

const RuleConfiguration: Component<Options> = (opt) => {
    function nameUpdated(name: string) {
        if (name.trim().length == 0) return
        opt.onUpdate(copy(opt.viewing, {
            name: name
        }))
    }

    return (<>
        <div class="field label medium">
            <input type="text" onInput={e => nameUpdated(e.target.value) } value={opt.viewing.name}/>
            <label>Name</label>
        </div>
        <RegexInput
            text={opt.viewing.regex}
            onRegexUpdate={ regex => opt.onUpdate(copy(opt.viewing, {
                regex: regex.source
            })) }
        ></RegexInput>
        <RedirectLinkInput
            redirects={ opt.viewing.redirectUrls }
            onArrayUpdate={ array => opt.onUpdate(copy(opt.viewing, {
                redirectUrls: array
            })) }
        ></RedirectLinkInput>
    </>)
}

export default RuleConfiguration