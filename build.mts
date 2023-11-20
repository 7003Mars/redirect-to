import { build, analyzeMetafile } from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import htmlPlugin from '@chialab/esbuild-plugin-html';
import {solidPlugin} from "esbuild-plugin-solid";
import * as fs from "fs";


const buildFf: boolean = true

if (fs.existsSync("./dist")) {
    fs.rmSync("./dist", {recursive: true})
}

const res = await build({
    entryPoints: [
        './src/frontend/options.html',
        './src/backend/sw.ts',
        './src/contentscript.ts'
    ],
    bundle: true,
    outdir: "./dist",
    sourcemap: "linked",
    // metafile: true,
    plugins: [
        copy({
            assets: [
                {
                    from: buildFf ? "./manifest-ff.json" : "",
                    to: "./manifest.json"
                },
                // {
                //     from: "./src/frontend/options.html",
                //     to: "options.html"
                // }
            ]
        }),
        htmlPlugin(), solidPlugin()
    ],
    loader: {
        ".woff2": "file"
    }
})

// console.log(await analyzeMetafile(res.metafile))