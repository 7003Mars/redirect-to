import type {Component} from 'solid-js';
import {createEffect, createMemo, createSignal, For, onMount, Show} from "solid-js";
import {RedirectRule} from "./Redirects";
import {loadRules, saveRules} from "./SharedClasses";
// import RedirectRule from "./sw";

const [rules, setRules] = createSignal<RedirectRule[]>([new RedirectRule()])
const [index, setIndex] = createSignal<number>(0)

function selected(): RedirectRule {
    console.log(`index is ${index()}`)
    const res = rules()[index()]
    if (!res) throw new Error(`Accessing index ${index()} of list of size ${rules().length}`)
    console.log(`Selected name: ${res.name}`)
    return res
}


const TabSelector: Component = () => {
    return (
        <div class="row">
            <div class="tabs scroll max">
                <For each={rules()}>{(rule, i) =>
                    <a classList={{active: i() == index()}} onclick={() => setIndex(i())}>{rule.name}</a>}
                </For>
            </div>
            <button class="small round" onclick={() => setRules([...rules(), new RedirectRule()])}>Add new</button>
        </div>

    )
}

const RedirectConfig: Component<{ rule: RedirectRule }> = (p) => {
    let inputElem: HTMLInputElement
    let textElem: HTMLTextAreaElement

    const [name, setName] = createSignal<string>("")
    const [regexp, setRegexp] = createSignal<string>("")
    createEffect(() => {
        const rule: RedirectRule = p.rule
        setName(rule.name)
        setRegexp(rule.regex.source)
        setRedirects_(rule.redirectUrls.join("\n"))

    })
    const regex = createMemo<RegExp | string>(() => {
        if (regexp() == "") return "Input regex here"
        try {
            return new RegExp(regexp())
        } catch (e) {
            if (e instanceof SyntaxError) {
                return e.message
            }
            console.error(e)
            return `Something went horribly wrong! Exception: ${(e as Error).message}`
        }
    })

    function regexValid(): boolean {
        return !(typeof regex() === "string")
    }

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
        const rule: RedirectRule = p.rule
        if (!regexValid()) {
            inputElem.focus()
            return;
        }
        if (redirects_().length == 0) {
            textElem.focus()
            return;
        }
        rule.name = name()
        rule.regex = regex() as RegExp
        rule.redirectUrls = redirects()
        saveRules(rules())
    }


    return (<>
        <div class="field label medium">
            <input type="text" onInput={e => setName(e.target.value)} value={name()}/>
            <label>Name</label>
        </div>
        <div class="field label medium">
            <input type="text" ref={inputElem!} onInput={e => setRegexp(e.target.value)} value={regexp()}/>
            <label>Regex expression</label>
            <Show when={!regexValid()}><span class="error">{regex() as string}</span></Show>
        </div>
        <div class="field textarea label border large">
            <textarea ref={textElem!} onInput={e => setRedirects_(e.target.value)} value={redirects_()}></textarea>
            <label>Redirect to...</label>
            <Show when={yieldWarnings()}><span class="error">{yieldWarnings()}</span></Show>
        </div>
        <div class="right-align">
            <button class="border" disabled={rules().length == 1} onclick={() => {
                const rule: RedirectRule = p.rule
                setIndex(Math.max(rules().indexOf(rule)-1, 0))
                setRules(rules().filter(r => r.id != rule.id))
            }}>Delete</button>
            <button class="border" onclick={saveRule}>Save</button>
        </div>
    </>)
}

const App: Component = () => {
    onMount(async () => setRules(await loadRules()))

    const mockcrap = []
    // setInterval(() => {
    //     setRules([...rules, new RedirectRule("verylong-"+rules.length, new RegExp(""))])
    // }, 1000)
    for (let i = 0; i < 1; i++) {
        const rule = new RedirectRule()
        rule.name = "verylongname-" + i
        mockcrap.push(rule)
    }
    // setRules(mockcrap)
    // setRules((rule) => rule.name == "", produce())


    return (
        <>
            <TabSelector></TabSelector>
            <RedirectConfig rule={selected()}></RedirectConfig>
        </>
    );
};

export default App;
