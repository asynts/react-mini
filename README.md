## React Mini

React is truely amazing.

At first, it's a bit weird.
Then you develop an intuition and everything works the way you expect it to.
At some point you start asking questions.
Then it's really weird.

-   Why is it possible to use `useState` multiple times?

    Turns out that the call order is used to distinguish calls, this is why they must appear on the top level.

-   How does an `<input />` element retain focus on it if you use the `onChange` event to update the `value` attribute?

    Doesn't React swap it out for a new element?

    But if there are multiple input element, how does React know which one should be focused?

    Turns out that it matches the elements from the previous render with the elements of the current render.
    Then it simply updates the attributes of that element without re-creating it, that retains the focus.

-   ...

I am certainly not the first to ask these questions.
There are answers avaliable online.

However, it caught my interest and I spend some time coming up with my own implementation.
I did read a lot of articles about the internals of React, but I looked at the source very little.

*If you are looking for an accurate description of how React works, this probably isn't it.*

### Notes

-   Launch with `yarn start`, this should open a web-browser at `http://localhost:8001` by default.

-   The `mount` function is the entry point.

-   The project is setup with JSX, this is configured in `web-dev-server.config.mjs` and is explained at the `jsx_createComponent` function.
    You can also create trees of `HtmlNode`, `ComponentNode` and `TextNode` manually:

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
