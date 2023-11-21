import {Component, createEffect, createMemo, createSignal, For, Show} from "solid-js";
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
    const [dragging, setDragging] = createSignal<boolean>(false)


    function chipDragStart(event: DragEvent, index: number){
        if (opt.rules.length <= 1) return
        event.dataTransfer!.setData("delete", index.toString())
        setDragging(true)
    }

    function chipDragEnd() {
        setDragging(false)
    }

    function chipEnter(event: DragEvent) {
        const data: string = event.dataTransfer!.getData("delete")
        if (data.length != 0) event.preventDefault()
    }

    function chipDrop(event: DragEvent) {
        const data: string = event.dataTransfer!.getData("delete")
        console.log(`data is ${data}`)
        opt.onRuleDelete(parseInt(data))
        event.preventDefault()
    }

    return (
        <>
            <div class="row">
                <nav class="scroll max">
                    <For each={ opt.rules }>{(rule, i) =>
                        <a class="chip" draggable={true} classList={ {fill: !(i() == opt.index)} }
                           onclick={ () => opt.onRuleSelect(i()) }
                           onDragStart={ e => chipDragStart(e, i()) }
                           onDragEnd={ e => chipDragEnd() }
                        >
                            {rule.name}
                        </a>
                    }</For>
                </nav>
                <Show when={!dragging()}
                      fallback={
                    <button onDragEnter={chipEnter} onDragOver={chipEnter}
                            onDrop={chipDrop}
                    >
                        <i>Delete</i>
                        <span>Delete</span>
                    </button>
                }>
                    <button class="small round" onClick={ () => {setShowDialog(true)} }>
                        <i>Add</i>
                        <span>Add new</span>
                    </button>
                </Show>

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
        // console.log(`Open is ${opt.open}`)
        if (opt.open) {
            self!.showModal()
            input!.focus()
            setName("")
        } else {
            self!.close()
        }
    })

    function submit() {
        opt.onSubmit(name().trim())
        setName("")
    }

    return (
        <dialog ref={self!}>
            <div class="field border" classList={ {invalid: nameEmpty()} }>
                <input type="text" ref={input!}
                       placeholder="Name" value={name()}
                       onInput={e => setName(e.target.value)}
                       onkeydown={e => {
                           if (!nameEmpty() && e.key == "Enter") {
                               e.preventDefault()
                               submit()
                           }
                       }}
                />
            </div>
            <div class="row right-align">
                <button class="small" onclick={ () => opt.onCancel() }>
                    <i>Cancel</i>
                    <span>Cancel</span>
                </button>
                <button class="small" disabled={nameEmpty()} onclick={ submit }>
                    <i>Add</i>
                    <span>Add</span>
                </button>
            </div>
        </dialog>
    )
}

export default RuleSelector