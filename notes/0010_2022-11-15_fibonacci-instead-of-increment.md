### Notes

-   I got the following code:

    ```js
    import {
        Instance,
        TextNode,
        HtmlNode,
    } from "./react.js";

    let pressCount = 0;

    function createNode() {
        /*
        <div key="root" #1>
            <p key="1" #2>
                <text #3>{pressCount}</text>
            </p>
            <button key="2" onClick={() => { pressCount += 1; update(); }} #4>
                <text #5>Increment</text>
            </button>
        </div>
        */
        let node_5 = new TextNode({
            text: "Increment",
        })
        let node_4 = new HtmlNode({
            elementType: "button",
            properties: {
                key: "2",
                $onClick: () => {
                    pressCount += 1;
                    update();
                },
            },
            children: [
                node_5,
            ],
        });
        let node_3 = new TextNode({
            text: pressCount.toString(),
        });
        let node_2 = new HtmlNode({
            nextSibling: node_4,
            elementType: "p",
            properties: {
                key: "1",
            },
            children: [
                node_3,
            ],
        });
        let node_1 = new HtmlNode({
            elementType: "div",
            properties: {
                key: "root",
            },
            children: [
                node_2,
                node_4,
            ],
        });

        return node_1;
    }

    let rootNode = new Instance().mount(
        document.getElementById("root"),
        createNode()
    );

    function update() {
        let newRootNode = createNode();
        newRootNode.render({
            oldNode: rootNode,
            parentElement: null,
        });
        rootNode = newRootNode;
    }
    ```

-   I would expect that clicking the button would increment the count value.
    Instead, the counter value is set to the next fibonacci number.

-   If I run the same code from an interval, it works as expected:

    ```js
    setInterval(() => {
        pressCount += 1;
        update();
    }, 500);
    ```

    This confirms that this got something to do with event handling.

-   Somehow, `HtmlElement.updateElement` is called very frequently.

-   Somehow, `HtmlElement.eventHandlers` is always empty in `HtmlElement.updateElement`.

-   My understanding is, that this is exponential, because all the previous event handlers fire.
    Each then adds a new event handler which fire again...

    The problem is, that they are never removed because I am looking at the `HtmlElement.eventHandlers`
    of the previous event handler.

### Ideas

-   Look where the fibonacci numbers appear naturally.

-   Try incrementing in an interval.

### Theories

-   I suspect that the event continues to bubble after we modified the DOM.

-   I suspect, that the old event handlers are still attached?
    Maybe I am going through the wrong list?

-   Maybe I am setting them again as regular attribute?

### Result

-   I am not actually sure what the underlying problem was but I solved it by getting rid of `HtmlElement.eventHandlers`.
