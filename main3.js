function ASSERT_NOT_REACHED() {
    throw new Error("ASSERT_NOT_REACHED");
}

/*
// Keeps the state that can be accessed with 'useState'.
// This instance is shared between the renders.
// The data inside is mutable.
//
// The index of 'useState' chooses, which data element is returned.
Store {
    componentNode: ComponentNode
    data: list[object]
    nextIndex: integer

    resetIndex(): void
    nextData(): [value, setValue]
}
*/
class Store {
    constructor({ componentNode }) {
        this.componentNode = componentNode;

        this.data = [];
        this.nextIndex = 0;
    }

    resetIndex() {
        this.nextIndex = 0;
    }

    nextData(defaultValue) {
        let index = this.nextIndex++;

        function setState(newValue) {
            this.data[index] = newValue;
            this.componentNode.queueRenderAsync();
        }

        if (index in this.data) {
            return [this.data[index], setState];
        } else {
            this.data[index] = defaultValue;
            return [this.data[index], setState];
        }
    }
}

/*
// Each render reconciles with a tree of the previous render.
// It also generates a new new tree that will be used by the next render.
Node {
    nextSibling: Node?

    isEqual(otherNode: Node): boolean
}
*/
class Node {
    constructor({ nextSibling }) {
        this.nextSibling = nextSibling;
    }

    isEqual(otherNode) {
        // Sentinel values indicate conditionally rendered elements.
        if (otherNode instanceof SentinelNode) {
            return true;
        }

        // The type must match.
        if (this.constructor !== otherNode.constructor) {
            return false;
        }

        // The key attribute must match.
        if (this.properties.key !== otherNode.properties.key) {
            return false;
        }

        switch(this.constructor) {
            case ComponentNode:
                return this.componentFunction === otherNode.componentFunction;
            case HtmlNode:
                return this.elementType === otherNode.elementType;
            case TextNode:
                return true;
            
            default:
                ASSERT_NOT_REACHED();
        }
    }
}

/*
// Sentinel nodes indicate the absence of a value, used for conditional rendering.
// This differs from React where 'null', 'false' or 'true' are sentinel values.
SentinelNode : Node {

}
*/
class SentinelNode extends Node {
    constructor({ nextSibling }) {
        this.nextSibling = nextSibling;
    }
}

/*
// Components are essentially wrappers for other nodes and eventually for HTML elements.
// They keep state that can be used by component functions.
ComponentNode : Node {
    // We assume that the component function doesn't change, it must not be computed dynamically.
    componentFunction: function

    properties: map[string, object]
    children: list[Node]

    store: Store

    queueRender(): void
}
*/
class ComponentNode extends Node {
    constructor({ nextSibling, componentFunction, properties, children }) {
        super({ nextSibling });

        this.componentFunction = componentFunction;
        this.properties = properties;
        this.children = children;

        this.store = new Store({
            componentNode: this,
        });
    }

    async queueRenderAsync() {
        // FIXME
    }
}

/*
TextNode {
    text: string
}
*/
class TextNode extends Node {
    constructor({ nextSibling, text }) {
        super({ nextSibling });

        this.text = text;
    }
}

/*
HtmlNode : Node {
    elementType: string
    properties: map[string, object]
    children: list[Node]
}
*/
class HtmlNode extends Node {
    constructor({ nextSibling, elementType, properties, children }) {
        super({ nextSibling });

        this.elementType = elementType;
        this.properties = properties;
        this.children = children;
    }
}

/*
Instance {
    currentRootNode: Node?

    mount(targetElement: window.Element, node: Node): void
}
*/
class Instance {
    constructor() {

    }

    mount(markerTargetElement, newNode) {
        // We want the root element to be in a well defined state.
        let oldElement = document.createElement("div");
        markerTargetElement.replaceWith(oldElement);

        let oldNode = new HtmlNode({
            elementType: "div",
            properties: {},
            children: [],
        });

        // FIXME: I am trying to phrase this in such a way that this can be easily generatlized.
        //        This logic should be extracted out of the 'mount' method.

        // There are three types of matches that can occur:
        //
        // -   DIRECT_MATCH means that the node we encounter matches what we expect.
        //     We update the DOM node and then recursively handle child nodes.
        //
        // -   SKIP_MATCH means that the node we encounter doesn't match what we expect.
        //     However, we were able to fast-forward and found a matching sibling.
        //
        //     We remove the skipped DOM nodes.
        //     We update the DOM node and then recursively handle child nodes.
        //
        // -   NO_MATCH means that we were unable to find a matching node.
        //     We insert a new DOM node and then recursively handle child nodes.

        if (oldNode.isEqual(newNode)) {
            // DIRECT_MATCH
        } else {
            let oldSiblingNode = oldNode.nextSibling;
            while (oldSiblingNode !== null) {
                if (oldSiblingNode.isEqual(newNode)) {
                    // SKIP_MATCH
                }
            }

            // NO_MATCH
        }
    }
}
