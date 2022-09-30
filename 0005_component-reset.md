If we have nested components, the reconciliation fails and we create a new component every time.

### Notes

-   I've tried only rendering the counter component directly.
    I am tracing the important function calls.

    I would expect the following output:

    ```none
    new ReactInstance()
    new Component()
    Component.queueRender()
    Component.render()
    Component._toElement()
    Counter()
    HtmlObject.toElement()
    ...
    HtmlObject.toElement()
    ```

    Actual output:

    ```none
    react.js:157 new ReactInstance()
    react.js:80 new Component()
    react.js:134 Component.queueRender()
    react.js:140 Component.render()
    react.js:111 Component._toElement()
    index.js:8 Counter()
    react.js:23 HtmlObject.toElement()
    react.js:23 HtmlObject.toElement()
    react.js:23 HtmlObject.toElement()
    ```

    This works as expected.

### Ideas

-   I should distinguish input and output objects.

### Theories

-   It's not clear what part of the application should do what, especially the `toElement()` logic.
    I suspect, that I got confused while implementing it.
