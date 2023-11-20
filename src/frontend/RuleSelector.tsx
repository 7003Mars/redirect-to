import {Component, createEffect, createMemo, createSignal, For} from "solid-js";
import {RedirectRule} from "../backend/Redirects";
import {RuleData} from "../SharedClasses";

interface Options {
    rules: Array<RuleData>
    index: number,
    onRuleSelect: (index: number) => void,
    onRuleDelete: (index: number) => void,
    onRuleCreate: (name: string) => void
}

const RuleSelector: Component<Options> = (opt) => {
    const [showDialog, setShowDialog] = createSignal<boolean>(false)

    return (
        <>
            <div class="row">
                <div class="tabs scroll max">
                    <For each={ opt.rules }>{(rule, i) =>
                        <a classList={ {active: i() == opt.index} } onclick={ () => opt.onRuleSelect(i()) }>{ rule.name }</a>
                    }</For>
                </div>
                <button class="small round" onClick={ () => {setShowDialog(true);console.log("Button clicked")} }>
                    Add new
                </button>
            </div>
            <NamePrompt
                open={showDialog()}
                onSubmit={name => {
                    opt.onRuleCreate(name)
                    setShowDialog(false)
                }}
                onCancel={() => setShowDialog(false)}
            ></NamePrompt>
        </>

    )
}

interface NamePromptOpt {
    open: boolean
    onSubmit: (name: string) => void
    onCancel: () => void
}

const NamePrompt: Component<NamePromptOpt> = (opt) => {
    let self: HTMLDialogElement, input: HTMLInputElement
    const [name, setName] = createSignal<string>("")
    const nameEmpty = createMemo<boolean>(() => name().trim().length == 0)

    createEffect(() => {
        console.log(`Open is ${opt.open}`)
        if (opt.open) {
            self!.showModal()
            input!.focus()
            setName("")
        } else {
            self!.close()
        }
    })

    return (
        <dialog ref={self!}>
            <div class="field border" classList={ {invalid: nameEmpty()} }>
                <input type="text" ref={input!}
                       placeholder="Name" value={name()}
                       onInput={e => setName(e.target.value)}
                       onkeydown={e => { if (!nameEmpty() && e.key == "Enter") opt.onSubmit(name().trim()) }}
                />
            </div>
            <div class="row right-align">
                <button class="small" onclick={ () => opt.onCancel() }>Cancel</button>
                <button class="small" disabled={nameEmpty()} onclick={ () => opt.onSubmit(name().trim()) }>Add</button>
            </div>
        </dialog>
    )
}

export default RuleSelector