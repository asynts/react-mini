### Notes

-   The symptom is, that the trucation doesn't work.
    After updating, the trailing nodes are not removed properly.

-   It appears that the `nextSibling` of the `oldNode` tree is broken:

    ```none
    index.js:401 initial render:
    index.js:123 handle_DIRECT_MATCH
    index.js:356 HtmlNode.renderChilden null
    index.js:362 -> render HtmlNode {nextSibling: null, children: Array(2), elementType: 'P', properties: {…}, renderedElement: null} null
    index.js:169 handle_NO_MATCH_NEW
    index.js:356 HtmlNode.renderChilden null
    index.js:362 -> render TextNode {nextSibling: null, children: Array(0), text: 'Hello, world!', renderedElement: undefined} null
    index.js:169 handle_NO_MATCH_NEW
    index.js:362 -> render HtmlNode {nextSibling: null, children: Array(1), elementType: 'SPAN', properties: {…}, renderedElement: null} null
    index.js:169 handle_NO_MATCH_NEW
    index.js:356 HtmlNode.renderChilden null
    index.js:362 -> render TextNode {nextSibling: null, children: Array(0), text: 'This is bold!', renderedElement: undefined} null
    index.js:169 handle_NO_MATCH_NEW
    index.js:485 update render:
    index.js:123 handle_DIRECT_MATCH
    index.js:356 HtmlNode.renderChilden HtmlNode {nextSibling: null, children: Array(2), elementType: 'P', properties: {…}, renderedElement: p}
    index.js:362 -> render HtmlNode {nextSibling: null, children: Array(1), elementType: 'P', properties: {…}, renderedElement: null} HtmlNode {nextSibling: null, children: Array(2), elementType: 'P', properties: {…}, renderedElement: p}
    index.js:123 handle_DIRECT_MATCH
    index.js:356 HtmlNode.renderChilden TextNode {nextSibling: null, children: Array(0), text: 'Hello, world!', renderedElement: text}
    index.js:362 -> render TextNode {nextSibling: null, children: Array(0), text: 'This has been updated!', renderedElement: undefined} TextNode {nextSibling: null, children: Array(0), text: 'Hello, world!', renderedElement: text}
    index.js:123 handle_DIRECT_MATCH
    ```

    I would expect the following structure:

    ```none
    <div key="root" #1>
        <p key="1" #2>
            <text #3>Hello, world!</text>
            <span key="2" style="font-weight: bold;" #4>
                <text #5>This is bold!</text>
            </span>
        </p>
    </div>
    ```

    In other words, `#3` should have `#4` as `nextSibling`, however, this is `null` instead.

### Theories

-   I don't ever set the `nextSibling` when constructing the trees, am I?

### Result

-   I moved the logic to create the trees into functions and set `nextSibling` properly.
