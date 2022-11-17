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

### Ideas

-   Verify that the logic in `ConditionComponent` makes sense.

-   Walk through what should happen if all works as intended.
