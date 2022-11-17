### Notes

-   Somehow, conditional rendering is broken.

    I created a button that will toggle the visiblity of some text and that seems to work but the `TextNode` that is the child of the
    toggled `HtmlNode` does not re-appear if the node appears again.

-   I noticed, that if I set the `key` property on the `TextNode` to anything other than `"1"` it crashes in some location.
    Notice that the parent `HtmlNode` also has the same id, which should not matter because of nesting.

-   We assert here:

    ```js
    ASSERT(this.renderedElement.nodeName === "#text");
    ```

    because `this.renderedElement === null` because `oldNode.renderedElement === null`.

    This suggests that we are matching with some node that isn't even being rendered.
    This looks completely broken.

-   Somehow, we have a `NO_MATCH` when rendering the root component?
    This is because it's a `HtmlNode` and the other is a `ComponentNode`.

    This was resolved by adding a `root-container` element.

-   I tried to debug how we are matching.
    This is what I expected:

    ```none
    // initial render
    NO_MATCH_NEW #1
    NO_MATCH_NEW #2
    NO_MATCH_NEW #3
    NO_MATCH_NEW #4
    NO_MATCH_NEW #5

    // first click (hide)
    DIRECT_MATCH #1
    SKIP_MATCH #4
    DIRECT_MATCH #4 (implied by SKIP_MATCH)
    DIRECT_MATCH #5

    // second click (show)
    DIRECT_MATCH #1
    NO_MATCH #2
    NO_MATCH #3
    DIRECT_MATCH #4
    DIRECT_MATCH #5
    ```

    This is what I got:

    ```none
    react-mini.js:159 handle_NO_MATCH_NEW
    index.js:314 HtmlNode {nextSibling: null, elementType: 'DIV', children: Array(2), properties: {…}, renderedElement: null}
    react-mini.js:421 HtmlNode.renderChilden null
    react-mini.js:429 -> render HtmlNode {nextSibling: HtmlNode, elementType: 'P', children: Array(1), properties: {…}, renderedElement: null} null
    react-mini.js:159 handle_NO_MATCH_NEW
    react-mini.js:421 HtmlNode.renderChilden null
    react-mini.js:429 -> render TextNode {nextSibling: null, text: 'This is not always visible', properties: {…}, renderedElement: undefined} null
    react-mini.js:159 handle_NO_MATCH_NEW
    react-mini.js:429 -> render HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: null} null
    react-mini.js:159 handle_NO_MATCH_NEW
    react-mini.js:421 HtmlNode.renderChilden null
    react-mini.js:429 -> render TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: undefined} null
    react-mini.js:159 handle_NO_MATCH_NEW

    react-mini.js:107 handle_DIRECT_MATCH
    index.js:314 HtmlNode {nextSibling: null, elementType: 'DIV', children: Array(1), properties: {…}, renderedElement: null}
    react-mini.js:421 HtmlNode.renderChilden HtmlNode {nextSibling: HtmlNode, elementType: 'P', children: Array(1), properties: {…}, renderedElement: p}
    react-mini.js:429 -> render HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: null} HtmlNode {nextSibling: HtmlNode, elementType: 'P', children: Array(1), properties: {…}, renderedElement: p}
    react-mini.js:126 handle_SKIP_MATCH
    react-mini.js:107 handle_DIRECT_MATCH
    react-mini.js:421 HtmlNode.renderChilden TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:429 -> render TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: undefined} TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:107 handle_DIRECT_MATCH

    react-mini.js:107 handle_DIRECT_MATCH
    index.js:314 HtmlNode {nextSibling: null, elementType: 'DIV', children: Array(2), properties: {…}, renderedElement: null}
    react-mini.js:421 HtmlNode.renderChilden HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: button}
    react-mini.js:429 -> render HtmlNode {nextSibling: HtmlNode, elementType: 'P', children: Array(1), properties: {…}, renderedElement: null} HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: button}
    react-mini.js:140 handle_NO_MATCH
    react-mini.js:421 HtmlNode.renderChilden TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:429 -> render TextNode {nextSibling: null, text: 'This is not always visible', properties: {…}, renderedElement: undefined} TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:107 handle_DIRECT_MATCH
    react-mini.js:429 -> render HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: null} HtmlNode {nextSibling: null, elementType: 'BUTTON', children: Array(1), properties: {…}, renderedElement: button}
    react-mini.js:107 handle_DIRECT_MATCH
    react-mini.js:421 HtmlNode.renderChilden TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:429 -> render TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: undefined} TextNode {nextSibling: null, text: 'Toggle Visiblity', properties: {…}, renderedElement: text}
    react-mini.js:107 handle_DIRECT_MATCH
    ```

    From this it looks like we advance the `oldNode` in the first `NO_MATCH`.

-   I found an error that may be involved in this:

    ```js
    if (renderedElement === undefined) {
        this.renderedElement = renderedElement;
    } else {
        this.renderedElement = null;
    }
    ```

    should have been:

    ```js
    if (renderedElement !== undefined) {
        this.renderedElement = renderedElement;
    } else {
        this.renderedElement = null;
    }
    ```

    That issue seems to be unrelated though, this is simply why there is `renderedElement===undefined` in the logs.

-   For `OLD_MATCH` we can't compute the `oldFirstChild`, it doesn't exist!

### Ideas

-   Verify that the logic in `ConditionComponent` makes sense.

-   Walk through what should happen if all works as intended.

### Theories

-   I suspect, that `renderChildren` isn't always called when it should be.

-   I suspect, that the `render` in `renderChildren` matches with the completely wrong thing.

### Result

-   Add `root-container` div instead of replacing it.
    That resolves the issue where the root component is not equal to the placeholder element.

-   The problem was that in `OLD_MATCH` I was trying to compute the `oldFirstChild` which doesn't make any sense.
    Instead I am now passing `{ oldFirstChild: null }` to `renderChildren`.
