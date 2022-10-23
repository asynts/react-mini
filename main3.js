function ASSERT_NOT_REACHED() {
    debugger;
    throw new Error("ASSERT_NOT_REACHED");
}

function ASSERT(condition) {
    if (!condition) {
        debugger;
        throw new Error("ASSERT");
    }
}

/*
// Each render reconciles with a tree of the previous render.
// It also generates a new new tree that will be used by the next render.
Node {
    nextSibling: Node?

    isEqual(otherNode: Node): boolean

    abstract createElement(): window.Element
    abstract updateElement(oldRenderedElement: window.Element): window.Element
    abstract removeElement(): void

    abstract renderChildren(oldFirstChild: Node): void
    render(oldNode: Node): Node
}
*/
class Node {
    constructor({ nextSibling }) {
        if (nextSibling !== undefined) {
            this.nextSibling = nextSibling;
        } else {
            this.nextSibling = null;
        }
    }

    isEqual(otherNode) {
        // Sentinel values indicate conditionally rendered elements.
        if (otherNode instanceof SentinelNode || this instanceof SentinelNode) {
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
            case HtmlNode:
                return this.elementType === otherNode.elementType;
            case TextNode:
                return true;
            
            default:
                ASSERT_NOT_REACHED();
        }
    }

    // Abstract.
    createElement() {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    updateElement({ oldRenderedElement }) {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    removeElement() {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    // Is provided with the value of 'Node.children[0]' of the previous render.
    renderChildren({ oldFirstChild }) {
        ASSERT_NOT_REACHED();
    }

    // When a change occurs, we provide the 'oldNode' that existed before the change.
    // We can use this to obtain the 'renderedElement' and assume that the element matches what the node describes.
    //
    // The caller can either be 'Instance.mount' the 'setValue' function in 'useState'.
    //
    // Returns the next node that should be passed to the next new sibling.
    render({ oldNode }) {
        // There are three types of matches that can occur:
        //
        // -   DIRECT_MATCH means that the node we encounter matches what we expect.
        //     We update the DOM node and then recursively handle child nodes.
        //
        //     This happens for everything that doesn't appear in a list.
        //     The 'SentinelNode' is used to ensure that conditionally rendered elements are a direct match.
        //
        // -   SKIP_MATCH means that the node we encounter doesn't match what we expect.
        //     However, we were able to fast-forward and found a matching sibling.
        //
        //     We remove the skipped DOM nodes.
        //     We update the DOM node and then recursively handle child nodes.
        //
        //     This happens if a list of elements is rendered and items are removed or inserted.
        //
        // -   NO_MATCH means that we were unable to find a matching node.
        //     We insert a new DOM node and then recursively handle child nodes.
        //
        //     This happens if something is added to a list and thus didn't exist in the previous render.

        let handle_DIRECT_MATCH = () => {
            this.updateElement({ oldRenderedElement: oldNode.renderedElement });

            let oldFirstChild;
            if (oldNode !== null && oldNode.children.length >= 1) {
                oldFirstChild = oldNode.children[0];
            } else {
                oldFirstChild = null;
            }

            this.renderChildren({ oldFirstChild });

            return oldNode.nextSibling;
        };

        let handle_SKIP_MATCH = () => {
            // Remove all the skipped elements.
            while (!this.isEqual(oldNode)) {
                oldNode.removeElement();
                oldNode = oldNode.nextSibling;
            }

            return handle_DIRECT_MATCH();
        };

        let handle_NO_MATCH = () => {
            oldNode.renderedElement.insertBefore(this.createElement());

            let oldFirstChild;
            if (oldNode !== null && oldNode.children.length >= 1) {
                oldFirstChild = oldNode.children[0];
            } else {
                oldFirstChild = null;
            }

            this.renderChildren({ oldFirstChild });

            return oldNode;
        };

        if (oldNode === null) {
            return handle_NO_MATCH();
        } else if (this.isEqual(oldNode)) {
            return handle_DIRECT_MATCH();
        } else {
            // Search following siblings for match.
            let oldSiblingNode = oldNode.nextSibling;
            while (oldSiblingNode !== null) {
                if (this.isEqual(oldSiblingNode)) {
                    return handle_SKIP_MATCH();
                }
            }

            ASSERT(oldSiblingNode !== null);
            return handle_NO_MATCH();
        }
    }
}

/*
SentinelNode {
    createElement(): window.Element
    updateElement(oldRenderedElement: window.Element): window.Element
    removeElement(): void

    renderChildren(oldFirstChild: Node): void
}
*/
class SentinelNode extends Node {
    constructor({ nextSibling }) {
        super({ nextSibling });
    }

    createElement() {
        // FIXME: How should we handle this?
        ASSERT_NOT_REACHED();
    }

    updateElement({ oldRenderedElement }) {
        // FIXME: How should we handle this?
        ASSERT_NOT_REACHED();
    }

    removeElement() {
        // FIXME: How should we handle this?
        ASSERT_NOT_REACHED();
    }

    renderChildren({ oldFirstChild }) {
        // Has no children.
    }
}

// FIXME: SentinelNode

// FIXME: ComponentNode

/*
TextNode {
    text: string
    renderedElement: window.Element?

    createElement(): window.Element
    updateElement(oldRenderedElement: window.Element): window.Element
    removeElement(): void

    renderChildren(oldFirstChild: Node): void
}
*/
class TextNode extends Node {
    constructor({ nextSibling, text, renderedElement }) {
        super({ nextSibling });

        this.text = text;

        if (renderedElement === undefined) {
            this.renderedElement = renderedElement;
        } else {
            this.renderedElement = null;
        }
    }

    createElement() {
        this.renderedElement = document.createTextNode(this.text);
        return this.renderedElement;
    }

    updateElement({ oldRenderedElement }) {
        this.renderedElement = oldRenderedElement;

        ASSERT(this.renderedElement.nodeName === "#text");
        this.renderedElement.nodeValue = this.text;

        return this.renderedElement;
    }

    removeElement() {
        this.renderedElement.parentNode.removeChild(this.renderedElement);
        this.renderedElement = null;
    }

    renderChildren() {
        // Has no children.
    }
}

/*
HtmlNode : Node {
    elementType: string
    properties: map[string, object]
    children: list[Node]
    renderedElement: window.Element?

    createElement(): window.Element
    updateElement(oldRenderedElement: window.Element): window.Element
    removeElement(): void

    renderChildren(oldFirstChild: Node): void
}
*/
class HtmlNode extends Node {
    constructor({ nextSibling, elementType, properties, children, renderedElement }) {
        super({ nextSibling });

        // This is important because this is what 'Element.nodeName' reports.
        this.elementType = elementType.toUpperCase();
 
        this.properties = properties;
        this.children = children;

        if (renderedElement !== undefined) {
            this.renderedElement = renderedElement;
        } else {
            this.renderedElement = null;
        }
    }

    createElement() {
        this.renderedElement = document.createElement(this.elementType);
        
        // Set all the attributes.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            ASSERT(typeof propertyValue === "string" || propertyValue instanceof String);
            renderedElement.setAttribute(propertyName, propertyValue);
        }

        return this.renderedElement;
    }

    updateElement({ oldRenderedElement }) {
        this.renderedElement = oldRenderedElement;

        ASSERT(this.renderedElement.nodeName === this.elementType);

        // Remove attributes that do not appear in this node.
        for (let propertyName of Object.keys(this.renderedElement.attributes)) {
            if (false === propertyName in this.properties) {
                this.renderedElement.removeAttribute(propertyName);
            }
        }

        // Update all attributes to match.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            this.renderedElement.setAttribute(propertyName, propertyValue);
        }

        return this.renderedElement;
    }

    removeElement() {
        this.renderedElement.parentNode.removeChild(this.renderedElement);
        this.renderedElement = null;
    }

    renderChildren({ oldFirstChild }) {
        // FIXME: This can pass 'oldNode=null' to 'render'.
        //        I don't think that method can handle it, because we use 'insertBefore'.

        // Update each child and advance which old child is referenced.
        for (let child of this.children) {
            oldFirstChild = child.render({ oldNode: oldFirstChild });
        }

        // Remove trailing nodes that no longer exist.
        while (oldFirstChild !== null) {
            oldFirstChild.removeElement();
            oldFirstChild = oldFirstChild.nextSibling;
        }
    }
}

/*
Instance {
    mount(targetElement: window.Element, node: Node): void
}
*/
class Instance {
    mount(markerTargetElement, newNode) {
        // We want the root element to be in a well defined state.
        let oldElement = document.createElement("div");
        markerTargetElement.replaceWith(oldElement);

        let oldNode = new HtmlNode({
            elementType: "div",
            properties: {},
            children: [],
            renderedElement: oldElement,
        });

        newNode.render({ oldNode });
    }
}

new Instance()
    .mount(
        document.getElementById("root"),
        new HtmlNode({
            elementType: "div",
            properties: {},
            children: [
                new HtmlNode({
                    elementType: "p",
                    properties: {},
                    children: [
                        new TextNode({
                            text: "Hello, world!",
                        }),
                    ],
                }),
            ],
        }));
