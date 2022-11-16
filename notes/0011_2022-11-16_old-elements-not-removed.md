### Notes

-   After adding components, everything appears to be working, but instead of updating the old version we append a new version.

    This only seems to happen with the new `ComponentNode` code.

-   It seems that only the first element is a `DIRECT_MATCH` after that, we get `NO_MATCH_NEW` for everything.

-   The problem seems to occur here:

    ```js
    if (oldNode.children.length >= 1) {
    ```

    Obviously, the `ComponentNode` doesn't have any children.

### Ideas

-   Compare the code between `ComponentNode` and before.

### Theories

-   Maybe, we are not setting the `parentElement` correctly?

