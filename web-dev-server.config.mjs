import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
    rootDir: "./src/",
    open: true,
    appIndex: "./src/index.html",
    watch: true,
    plugins: [
        esbuildPlugin({
            target: "esnext",

            jsx: true,
            jsxFactory: "jsx_createComponent",
        }),
    ],
};
