If we have nested components, the reconciliation fails and we create a new component every time.

### Notes

-   I've tried only rendering the counter component directly:

    ```none
    <Counter />
    ```

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

-   Now I am trying to wrap this in another component:

    ```none
    <Wrapper />

    function Wrapper() {
        return <Counter />;
    }
    ```

    Expected output:

    ```none
    new ReactInstance()
    new Component()
    Component.queueRender()
    Component.render()
    Component._toElement()
    Wrapper()
    new ComponentObject()
    ComponentObject.toElement()
    ```

    Actual output:

    ```none
    react.js:60 new ComponentObject()
    react.js:161 new ReactInstance()
    react.js:84 new Component()
    react.js:138 Component.queueRender()
    react.js:144 Component.render()
    react.js:115 Component._toElement()
    index.js:46 Wrapper()
    react.js:60 new ComponentObject()
    react.js:69 ComponentObject.toElement()
    react.js:84 new Component()
    react.js:78 Uncaught TypeError: parentComponent.childComponents.get(...).toElement is not a function
        at ComponentObject.toElement (react.js:78:57)
        at Component._toElement (react.js:118:36)
        at Component.render (react.js:150:31)
        at react.js:140:31
    ```

    Oops, I completely forgot about the `new Component()` call.
    On top of that, some error occurs.

### Ideas

-   I should distinguish input and output objects.

### Theories

-   It's not clear what part of the application should do what, especially the `toElement()` logic.
    I suspect, that I got confused while implementing it.
