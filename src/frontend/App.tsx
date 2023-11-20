import type {Component} from 'solid-js';
import {createEffect, createMemo, createSignal, For, onMount, Show} from "solid-js";
import {RedirectRule} from "../backend/Redirects";
import {copy, emptyRuleData, loadRules, RuleData, RuleUpdateEvent, saveRules} from "../SharedClasses";

import {storage} from "webextension-polyfill";
import RuleSelector from "./RuleSelector";
import RuleConfiguration from "./RuleConfiguration";

const App: Component = () => {
    const [rules, setRules] = createSignal<Array<RuleData>>([emptyRuleData()])
    const [viewIndex, setViewIndex] = createSignal<number>(0)
    const currentRule = createMemo<RuleData>(() => {
        const i = viewIndex()
        if (i < 0 || i > rules().length ) return emptyRuleData()
        return rules()[i]
    })

    onMount(async () => {
        let res = (await storage.local.get("rules"))["rules"] as RuleData[]
        if (res == null || res.length == 0) {
            res = Array.of(emptyRuleData())
        }
        setRules(res)
    })

    createEffect(() => {
        saveRules(rules())
    })

    function deleteRule(index: number) {
        setRules(rules().filter((v, i) => i  != index))
    }

    function createRule(name: string) {
        const newRule = copy(emptyRuleData(), {
            name: name
        })
        setRules(Array.of(...rules(), newRule))
    }

    function ruleUpdate(newRule: RuleData) {
        const newArr = Array.from(rules())
        newArr[viewIndex()] = newRule
        setRules(newArr)
    }

    return (
        <>
            <RuleSelector
                rules={ rules() } index={ viewIndex() }
                onRuleSelect={ i => setViewIndex(i) }
                onRuleDelete={ deleteRule }
                onRuleCreate={ createRule }
            ></RuleSelector>
            <RuleConfiguration
                viewing={ currentRule() }
                onUpdate={ ruleUpdate }
            ></RuleConfiguration>
        </>
    );
};

export default App;
