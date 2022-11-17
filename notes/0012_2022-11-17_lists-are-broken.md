### Notes

-   If I render lists, we don't appear to removing the previously rendered elements properly.

-   I tried debugging this and it seems that it works correctly if I use the append button, only the rendering is broken.

-   After clicking around a bit, it seems that the `removeItem` function doesn't do what it should.
    My understanding is, that I am referencing old state somehow and thus everything is messy.

    This is how I was able to debug this:

    ```js
    console.log(createInnerNode(0));
    ```

-   It seems, that the `nextSibling` is always null.

    This is the code that caused that issue:

    ```js
    nextSibling = followingItemNodes[followingItemNodes - 1];
    ```

    That should have been the following:

    ```js
    nextSibling = followingItemNodes[followingItemNodes.length - 1];
    ```

-   Now I encounter a new crash if I remove an element in the middle.
    My understanding is, that this should work, but it doesn't do what I want it to do.

### Theories
