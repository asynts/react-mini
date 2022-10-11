-   Conceptually, we need to think about HTML elements as state.

    -   Maybe I can reference them by key as well?

        This should only be necessary for elements with state.

-   Conceptually, we need to think of a call tree instead of a call stack.
    Not sure if this makes a difference in practice.

-   How to keep the focus on element when we change it's position in the DOM?

    I think just `removeChild` and `appendChild` should work?
