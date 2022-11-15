### Notes

-   I need to be able to move components around without losing their state.
    The typical example would be `<input />` elements that lose focus.

    I created this example that moves an input element every 500ms.
    Currently, it loses focus every time:

    ```html
    <div id="a"></div>
    <div id="b"><input type="text" /></div>

    <button onclick="onClick()">Move</button>

    <script>
        let is_a = true;
        function render() {
            let a_elem = document.getElementById("a");
            let b_elem = document.getElementById("b");

            if (is_a) {
                a_elem.appendChild(b_elem.removeChild(b_elem.firstChild));
            } else {
                b_elem.appendChild(a_elem.removeChild(a_elem.firstChild));
            }
        }

        render();
        setInterval(() => {
            is_a = !is_a;
            render();
        }, 500);
    </script>
    ```

-   I tried using `Node.replaceChild` instead:

    ```html
    <div id="a"><div></div></div>
    <div id="b"><input type="text" /></div>

    <button onclick="onClick()">Move</button>

    <script>
        let is_a = true;
        function render() {
            let a_elem = document.getElementById("a");
            let b_elem = document.getElementById("b");

            if (is_a) {
                a_elem.replaceChild(b_elem.firstChild, a_elem.firstChild);
                b_elem.appendChild(document.createElement("div"));
            } else {
                b_elem.replaceChild(a_elem.firstChild, b_elem.firstChild);
                a_elem.appendChild(document.createElement("div"));
            }
        }

        render();
        setInterval(() => {
            is_a = !is_a;
            render();
        }, 500);
    </script>
    ```

    That did not work either.

-   I do not think that React handles that correctly either.

    My approach should be to reuse the elements if they are keyed.
    But losing focus is fine.

    Obviously, for my custom components it is very easy to maintain the state.

### Ideas

-   I should create a list of custom components in react and reorder them randomly to see if React actually behaves
    the way I imagine.
