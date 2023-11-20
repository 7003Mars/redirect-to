import {Component, createEffect, createSignal, Show} from "solid-js";

interface Options {
    text: string,
    onRegexUpdate: (regex: RegExp) => void
}
const RegexInput: Component<Options> = (opt: Options) => {
    const [error, setError] = createSignal<String | null>()
    const [text, setText] = createSignal<string>("")

    createEffect(() => {
        setText(opt.text)
        setError(null)
    })

    function textUpdated(val: string): void {
        try {
            if (val.length == 0) return
            const exp = new RegExp(val)
            setError(null)
            setText(val)
            opt.onRegexUpdate(exp)
        } catch (e) {
            if (e instanceof SyntaxError) {
                setError(e.message)
                return;
            }
            console.error("Something went horribly wrong!")
            console.error(e)
            setError((e as Error).message)

        }
    }

    return (
        <div class="field label medium">
            <input type="text" onInput={e => textUpdated(e.target.value)} value={ text() }/>
            <label>Regex expression</label>
            <Show when={ error() }><span class="error">{ error() as string }</span></Show>
        </div>
    )
}
export default RegexInput