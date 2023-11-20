import {Component, createSignal, Show} from "solid-js";

interface Options {
    redirects: Array<string>
    onArrayUpdate: (redirects: Array<string>) => void
}

const RedirectLinkInput: Component<Options> = (opt) => {
    const [error, setError] = createSignal<string | null>(null)

    function onTextUpdate(text: String) {
        const lines = text.split("\n")
        if (lines.length == 0) {
            setError("At least 1 redirect url required")
            return
        }
        opt.onArrayUpdate(lines)

    }

    return (
        // TODO: Tooltip for each line showing a sample of where each link redirects to
        <div>
            <div class="field textarea label border large">
                <textarea onInput={e => onTextUpdate(e.target.value)} value={ opt.redirects.join("\n") }></textarea>
                <label>Redirect to...</label>
                <Show when={ error() }>
                    <span class="error">{ error() }</span>
                </Show>
            </div>
        </div>
    )
}

export default RedirectLinkInput