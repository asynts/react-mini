## React Mini

React is truely amazing.

At first, it's a bit weird.
Then you develop an intuition and everything works the way you expect it to.
At some point you start asking questions.
Then it's really weird.

-   Why is it possible to use `useState` multiple times?

    Turns out that the call order is used to distinguish calls, this is why they must appear on the top level.

-   How does an `<input />` element retain focus if `onChange` modifies the `value` attribute?

    The component should re-render and a new element should be created.
    If there are multiple, how does React know which one should be focused?

    Turns out that it matches the elements from the previous render with the elements of the current render.
    Then it simply updates the attributes of that element without re-creating it, that retains the focus.

-   ...

I am certainly not the first to ask these questions.
There many are answers avaliable online.

However, this caught my interest and I created my own simplified implementation of React.
This is based primarily on blog articles that discuss the internals of React.
I didn't look at the source code of React much.

*If you are looking for an accurate description of how React works, this probably isn't it.*

### Setup

Install dependencies with `yarn install` and run with `yarn start`.
This should open a web-browser at `http://localhost:8001` by default.

### Details

In [`index.jsx`](./src/index.jsx) there are some components defined that should look familiar to React developers.
But instead of using React, all the code has been implemented by myself.
The syntax is slightly different, because I require a `key` attribute to be always present.

There is a bit of magic going on behind the scenes.
I use `@web/dev-server-esbuild` to parse the JSX syntax and to generate matching JavaScript code.
This is configured in [`web-dev-server.config.mjs`](./web-dev-server.config.mjs) and is explained further in [`react-mini.js`](./src/react-mini.js) when
`jsx_createComponent` is defined.

If you are reading through the code, the `mount` function is the entry point, this is similar to `ReactDOM.createRoot(/* ... */).render(/* ... */)` in React.

It is also possible to use the library without JSX which may be more intuitive:


```js
import {
    mount,
    ComponentNode,
    HtmlNode,
    TextNode
} from "./react-mini.js";

/*
function IncrementComponent(properties, useState) {
    let [counter, setCounter] = useState(0);
    return (
        <div key={properties.key}>
            <p key="1">Counter: {counter}</p>
            <button key="2" $click={() => setCounter(counter + 1)}>
                Increment
            </button>
        </div>
    );
}

mount(
    document.getElementById("root-container"),
    <IncrementComponent key="root" />,
);
*/
mount(
    document.getElementById("root-container"),
    new ComponentNode({
        componentFunction: ({ properties, useState}) => {
            let [counter, setCounter] = useState(0);

            return new HtmlNode({
                elementType: "div",
                properties: {
                    key: properties.key,
                },
                children: [
                    new HtmlNode({
                        elementType: "p",
                        properties: {
                            key: "1",
                        },
                        children: [
                            new TextNode({
                                text: `Counter: ${counter}`,
                            }),
                        ],
                    }),
                    new HtmlNode({
                        elementType: "button",
                        properties: {
                            key: "2",
                            $click: () => setCounter(counter + 1),
                        },
                        children: [
                            new TextNode({
                                text: "Increment",
                            }),
                        ],
                    }),
                ],
            });
        },
        properties: {
            key: "root",
        },
    }),
);
```
