## React Mini

React is truely amazing.

At first, it's a bit weird.
Then you develop an intuition and everything works the way you expect it to.
At some point you start asking questions.
Then it's really weird.

-   Why is it possible to use `useState` multiple times?

    Turns out that the call order is used to distinguish calls, this is why they must appear on the top level.

-   How does an `<input />` element retain focus on it if you continiously use the `onChange` event to update the `value` attribute?

    Shouldn't it be swapped out for a new element?

    Then how does the browser know in which input field the focus should go?

    Turns out that it guesses which elements from the previous render match to the elements in the current render.
    Then it doesn't swap them out with new ones, but only updates them by setting the attributes on them.

-   ...

All of these questions can be answered online easily.
However, I wanted to implement it myself and it turns out that this is much harder than expected.

The internals of React are outlined in serveral articles.
However, I found it very hard to structure the code properly.
There are also a lot of details to deal with.

If you are interested, try implementing React for yourself.

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
