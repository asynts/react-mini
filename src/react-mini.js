export function ASSERT_NOT_REACHED() {
    debugger;
    throw new Error("ASSERT_NOT_REACHED");
}

export function ASSERT(condition) {
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
    render(oldNode: Node, parentElement: window.Element): Node
}
*/
export class Node {
    constructor({ nextSibling, children }) {
        if (nextSibling !== undefined) {
            this.nextSibling = nextSibling;
        } else {
            this.nextSibling = null;
        }

        if (children !== undefined) {
            this.children = children;
        } else {
            this.children = null;
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

        switch(this.constructor) {
            case HtmlNode:
                return this.properties.key === otherNode.properties.key
                    && this.elementType === otherNode.elementType;
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
    render({ oldNode, parentElement }) {
        // There are four types of matches that can occur:
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
        //
        // -   NO_MATCH_NEW occurs when we were unable to find a matching node and we don't even have a candidate.
        //     We append a new DOM node to the parent and recursively handle child nodes.
        //
        //     This happens if a node is rendered for the first time.
        //     It doesn't happen for the root node because we create a fake element for that.

        let handle_DIRECT_MATCH = () => {
            console.log("handle_DIRECT_MATCH");

            this.updateElement({ oldRenderedElement: oldNode.renderedElement });

            let oldFirstChild;
            if (oldNode.children.length >= 1) {
                oldFirstChild = oldNode.children[0];
            } else {
                oldFirstChild = null;
            }

            this.renderChildren({ oldFirstChild });

            return oldNode.nextSibling;
        };

        let handle_SKIP_MATCH = () => {
            console.log("handle_SKIP_MATCH");

            // Remove all the skipped elements.
            while (!this.isEqual(oldNode)) {
                oldNode.removeElement();
                oldNode = oldNode.nextSibling;
            }

            return handle_DIRECT_MATCH();
        };

        let handle_NO_MATCH = () => {
            console.log("handle_NO_MATCH");

            oldNode.renderedElement.parentElement.insertBefore(this.createElement(), oldNode.renderedElement);

            let oldFirstChild;
            if (oldNode !== null && oldNode.children.length >= 1) {
                oldFirstChild = oldNode.children[0];
            } else {
                oldFirstChild = null;
            }

            this.renderChildren({ oldFirstChild });

            return oldNode;
        };

        let handle_NO_MATCH_NEW = () => {
            console.log("handle_NO_MATCH_NEW");

            // We do not have an 'oldNode' that we can use as an insertion point.
            // This only happens if the 'parentNode' was newly created.
            //
            // FIXME: Verify that this is the only case where this can happen.

            parentElement.appendChild(this.createElement());

            this.renderChildren({ oldFirstChild: null });

            return oldNode;
        };

        if (oldNode === null) {
            return handle_NO_MATCH_NEW();
        } else if (this.isEqual(oldNode)) {
            return handle_DIRECT_MATCH();
        } else {
            // Search following siblings for match.
            let oldSiblingNode = oldNode.nextSibling;
            while (oldSiblingNode !== null) {
                if (this.isEqual(oldSiblingNode)) {
                    return handle_SKIP_MATCH();
                }

                oldSiblingNode = oldSiblingNode.nextSibling;
            }

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
export class SentinelNode extends Node {
    constructor({ nextSibling }) {
        super({ nextSibling, children: [] });
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
export class TextNode extends Node {
    constructor({ nextSibling, text, renderedElement }) {
        super({ nextSibling, children: [] });

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
export class HtmlNode extends Node {
    constructor({ nextSibling, elementType, properties, children, renderedElement }) {
        super({ nextSibling, children });

        // This is important because this is what 'Element.nodeName' reports.
        this.elementType = elementType.toUpperCase();

        this.properties = properties;

        if (renderedElement !== undefined) {
            this.renderedElement = renderedElement;
        } else {
            this.renderedElement = null;
        }

        this.eventHandlers = {};
    }

    createElement() {
        this.renderedElement = document.createElement(this.elementType);

        // Set all the attributes.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            if (propertyName === "$onClick") {
                this.renderedElement.addEventListener("click", propertyValue);
                
                ASSERT(false == "$onClick" in this.eventHandlers);
                this.eventHandlers["$onClick"] = propertyValue;
            } else {
                ASSERT(!propertyName.startsWith("$"));
                ASSERT(typeof propertyValue === "string" || propertyValue instanceof String);
                this.renderedElement.setAttribute(propertyName, propertyValue);    
            }
        }

        return this.renderedElement;
    }

    updateElement({ oldRenderedElement }) {
        this.renderedElement = oldRenderedElement;

        ASSERT(this.renderedElement.nodeName === this.elementType);

        // Remove all event listeners.
        for (let [eventName, handler] in this.eventHandlers) {
            if (eventName === "$onClick") {
                this.renderedElement.removeEventListener(eventName, handler);
            } else {
                ASSERT_NOT_REACHED();
            }
        }
        this.eventHandlers = {};

        // Remove attributes that do not appear in this node.
        for (let propertyName of Object.keys(this.renderedElement.attributes)) {
            if (false === propertyName in this.properties) {
                this.renderedElement.removeAttribute(propertyName);
            }
        }

        // Update all attributes to match.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            // FIXME: Redundant code.
            if (propertyName === "$onClick") {
                this.renderedElement.addEventListener("click", propertyValue);
                this.eventHandlers["$onClick"] = propertyValue;
            } else {
                ASSERT(!propertyName.startsWith("$"));
                this.renderedElement.setAttribute(propertyName, propertyValue);
            }
        }

        return this.renderedElement;
    }

    removeElement() {
        this.renderedElement.parentNode.removeChild(this.renderedElement);
        this.renderedElement = null;
    }

    renderChildren({ oldFirstChild }) {
        console.log("HtmlNode.renderChilden", oldFirstChild);

        let oldNextChild = oldFirstChild

        // Render the children.
        for (let child of this.children) {
            console.log("-> render", child, oldNextChild);
            oldNextChild = child.render({
                oldNode: oldNextChild,
                parentElement: this.renderedElement,
            });
        }

        // Remove trailing elements
        while (oldNextChild !== null) {
            console.log("-> remove", oldNextChild);
            oldNextChild.removeElement();
            oldNextChild = oldNextChild.nextSibling;
        }
    }
}

/*
Instance {
    mount(targetElement: window.Element, node: Node): Node
}
*/
export class Instance {
    mount(markerTargetElement, newNode) {
        // We want the root element to be in a well defined state.
        let oldElement = document.createElement("div");
        oldElement.setAttribute("key", "root");
        markerTargetElement.replaceWith(oldElement);

        // Create the corresponding node.
        let oldNode = new HtmlNode({
            elementType: "div",
            properties: {
                key: "root",
            },
            children: [],
            renderedElement: oldElement,
        });

        // Render.
        console.log("initial render:");
        newNode.render({
            oldNode,
            parentElement: null,
        });

        return newNode;
    }
}
