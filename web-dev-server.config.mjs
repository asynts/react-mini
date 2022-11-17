// FIXME: Create custom plugin?
// FIXME: Look at '@web/dev-server-esbuild' package
// FIXME: Example: https://github.com/modernweb-dev/example-projects/blob/a5962ae84165e06b290dfbac5efb3e471a121e55/react-jsx/web-dev-server.config.mjs

// FIXME: Maybe I can use '@babel/parser' to parse the JSX?
// FIXME: Maybe I can use esbuild if I can inject custom generation for JSX?

export default {
    rootDir: "./src/",
    open: true,
    appIndex: "./src/index.html",
    watch: true,
    plugins: [
        // FIXME: JSX plugin
    ],
};
