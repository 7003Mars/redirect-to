import type {Component} from 'solid-js';
import {createEffect, createMemo, createSignal, For, onMount, Show} from "solid-js";
import {emptyRuleData, RedirectRule, RuleData} from "./Redirects";
import {saveRules} from "./SharedClasses";
import {createStore} from "solid-js/store";

const [rules, setRules] = createStore<RuleData[]>([emptyRuleData()])
const [index, setIndex] = createSignal<number>(0)

function selected(): RuleData {
    // console.log(`index is ${index()}`)
    const res = rules[index()]
    if (!res) throw new Error(`Accessing index ${index()} of list of size ${rules.length}`)
    // console.log(`Selected name: ${res.name}`)
    return res
}

const TabSelector: Component = () => {
    return (
        <div class="row">
            <div class="tabs scroll max">
                <For each={rules}>{(rule, i) =>
                    <a classList={{active: i() == index()}} onclick={() => setIndex(i())}>{rule.name}</a>}
                </For>
            </div>
            <button class="small round" onclick={() => {
                setRules([...rules, emptyRuleData()])}
                }>Add new</button>
        </div>

    )
}

const RedirectConfig: Component<{ rule: RuleData }> = (p) => {
    let inputElem: HTMLInputElement
    let textElem: HTMLTextAreaElement

    const [name, setName] = createSignal<string>("")
    const [regexp, setRegexp] = createSignal<string>("")
    createEffect(() => {
        const rule: RuleData = p.rule
        setName(rule.name)
        setRegexp(rule.regex)
        setRedirects_(rule.redirectUrls.join("\n"))

    })
    const regexErrors = createMemo<string | null>(() => {
        try {
            new RegExp(regexp())
            return null
        } catch (e) {
            if (e instanceof SyntaxError) {
                return e.message
            }
            console.error(e)
            return `Something went horribly wrong! Exception: ${(e as Error).message}`
        }
    })

    const [redirects_, setRedirects_] = createSignal("")
    const redirects = createMemo<string[]>(() => {
        const text: string = redirects_()
        if (text.length == 0) return []
        return redirects_().split("\n").filter(l => l.trim().length > 0)
    })

    function yieldWarnings(): string | null {
        // console.log(`redirects ${redirects()}, size is ${redirects().length}`)
        if (redirects().length == 0) return "No redirects set"
        return null
    }

    function saveRule() {
        // const rule: RedirectRule = currentRule()
        if (regexErrors() || regexp().trim().length == 0) {
            inputElem.focus()
            return;
        }
        if (redirects_().length == 0) {
            textElem.focus()
            return;
        }
        setRules(index(), {
            name: name(),
            regex: regexp(),
            redirectUrls: redirects()
        } as RuleData)
        saveRules(rules)
    }


    return (<>
        <div class="field label medium">
            <input type="text" onInput={e => setName(e.target.value)} value={name()}/>
            <label>Name</label>
        </div>
        <div class="field label medium">
            <input type="text" ref={inputElem!} onInput={e => setRegexp(e.target.value)} value={regexp()}/>
            <label>Regex expression</label>
            <Show when={regexErrors()}><span class="error">{regexErrors()}</span></Show>
        </div>
        <div class="field textarea label border large">
            <textarea ref={textElem!} onInput={e => setRedirects_(e.target.value)} value={redirects_()}></textarea>
            <label>Redirect to...</label>
            <Show when={yieldWarnings()}><span class="error">{yieldWarnings()}</span></Show>
        </div>
        <div class="right-align">
            <button class="border" disabled={rules.length == 1} onclick={() => {
                const rule: RuleData = p.rule
                setIndex(Math.max(rules.indexOf(rule)-1, 0))
                setRules(rules.filter(r => r != rule))
            }}>Delete</button>
            <button class="border" onclick={saveRule}>Save</button>
        </div>
    </>)
}

const App: Component = () => {

    onMount(async () => setRules((await chrome.storage.local.get("rules"))["rules"] as RuleData[]))

    return (
        <>
            <TabSelector></TabSelector>
            <RedirectConfig rule={selected()}></RedirectConfig>
        </>
    );
};

export default App;
