export const DEBUG_RENDER_MATCHING = false;
export const DEBUG_RENDER_CHILDREN = false;
export const DEBUG_ELEMENT_CREATION = false;

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

export class Node {
    constructor() {
        // This will be updated by the constructor of the parent node.
        this.nextSibling = null;
    }

    isEqual(otherNode) {
        // The type must match.
        if (this.constructor !== otherNode.constructor) {
            return false;
        }

        switch(this.constructor) {
            case HtmlNode:
                return this.properties.key === otherNode.properties.key
                    && this.elementType === otherNode.elementType;

            case ComponentNode:
                return this.properties.key === otherNode.properties.key
                    && this.componentFunction === otherNode.componentFunction;

            case TextNode:
                return this.properties.key === otherNode.properties.key;

            default:
                ASSERT_NOT_REACHED();
        }
    }

    // Abstract.
    createElement() {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    updateElement({ oldNode }) {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    removeElement() {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
    getChildren() {
        ASSERT_NOT_REACHED();
    }

    // Abstract.
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
            if (DEBUG_RENDER_MATCHING) {
                console.log("handle_DIRECT_MATCH");
            }

            this.updateElement({ oldNode });

            let oldFirstChild;
            if (oldNode.getChildren().length >= 1) {
                oldFirstChild = oldNode.getChildren()[0];
            } else {
                oldFirstChild = null;
            }

            this.renderChildren({ oldFirstChild });

            return oldNode.nextSibling;
        };

        let handle_SKIP_MATCH = () => {
            if (DEBUG_RENDER_MATCHING) {
                console.log("handle_SKIP_MATCH");
            }

            // Remove all the skipped elements.
            while (!this.isEqual(oldNode)) {
                oldNode.removeElement();
                oldNode = oldNode.nextSibling;
            }

            return handle_DIRECT_MATCH();
        };

        let handle_NO_MATCH = () => {
            if (DEBUG_RENDER_MATCHING) {
                console.log("handle_NO_MATCH");
            }

            oldNode.renderedElement.parentElement.insertBefore(this.createElement(), oldNode.renderedElement);

            this.renderChildren({
                oldFirstChild: null,
            });

            return oldNode;
        };

        let handle_NO_MATCH_NEW = () => {
            if (DEBUG_RENDER_MATCHING) {
                console.log("handle_NO_MATCH_NEW");
            }

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

export class ComponentNode extends Node {
    constructor({ componentFunction, properties }) {
        super()

        this.componentFunction = componentFunction;

        ASSERT("key" in properties);
        this.properties = properties;

        this.state = null;
        this.innerNode = null;
    }

    useState(key, defaultValue) {
        if (false === key in this.state) {
            this.state[key] = defaultValue;
        }

        let value = this.state[key];

        function setValue(newValue) {
            this.state[key] = newValue;

            // Render this component with new state.
            let newNode = new ComponentNode({
                componentFunction: this.componentFunction,
                properties: this.properties,
            });

            // Manually set the 'nextSibling' since the parent node constructor won't run.
            newNode.nextSibling = this.nextSibling;

            newNode.render({
                oldNode: this,
                parentElement: null,
            });
        }

        return [value, setValue.bind(this)];
    }

    createElement() {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("ComponentNode.createElement");
        }

        ASSERT(this.state === null);
        this.state = {};

        this._computeInnerNode();

        return this.innerNode.createElement();
    }

    updateElement({ oldNode }) {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("ComponentNode.updateElement");
        }

        // Copy the state from the old version.
        ASSERT(this.state === null);
        ASSERT(oldNode.state !== null);
        this.state = oldNode.state;

        this._computeInnerNode();

        ASSERT(oldNode.innerNode !== null);
        return this.innerNode.updateElement({ oldNode: oldNode.innerNode });
    }

    removeElement() {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("ComponentNode.removeElement");
        }

        ASSERT(this.innerNode !== null);
        return this.innerNode.removeElement();
    }

    getChildren() {
        ASSERT(this.innerNode !== null);
        return this.innerNode.getChildren();
    }

    renderChildren({ oldFirstChild }) {
        ASSERT(this.innerNode !== null);
        return this.innerNode.renderChildren({ oldFirstChild });
    }

    _computeInnerNode() {
        // Run the component function.
        ASSERT(this.innerNode === null);
        this.innerNode = this.componentFunction({
            useState: this.useState.bind(this),
        });
    }
}

export class TextNode extends Node {
    constructor({ text, properties, renderedElement }) {
        super();

        this.text = text;

        ASSERT("key" in properties);
        this.properties = properties;

        if (renderedElement !== undefined) {
            this.renderedElement = renderedElement;
        } else {
            this.renderedElement = null;
        }
    }

    createElement() {
        this.renderedElement = document.createTextNode(this.text);
        return this.renderedElement;
    }

    updateElement({ oldNode }) {
        this.renderedElement = oldNode.renderedElement;

        ASSERT(this.renderedElement.nodeName === "#text");
        this.renderedElement.nodeValue = this.text;

        return this.renderedElement;
    }

    removeElement() {
        this.renderedElement.parentNode.removeChild(this.renderedElement);
        this.renderedElement = null;
    }

    getChildren() {
        return [];
    }

    renderChildren({ oldFirstChild }) {
        // Has no children.
    }
}

export class HtmlNode extends Node {
    constructor({ elementType, properties, children, renderedElement }) {
        super();

        // This is important because this is what 'Element.nodeName' reports.
        this.elementType = elementType.toUpperCase();

        // Update the 'nextSibling' of all child nodes.
        for (let childIndex = 0; childIndex < children.length; ++childIndex) {
            if (childIndex + 1 < children.length) {
                children[childIndex].nextSibling = children[childIndex + 1];
            } else {
                children[childIndex].nextSibling = null;
            }
        }
        this.children = children;

        ASSERT("key" in properties);
        this.properties = properties;

        if (renderedElement !== undefined) {
            this.renderedElement = renderedElement;
        } else {
            this.renderedElement = null;
        }
    }

    createElement() {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("HtmlNode.createElement", this);
        }

        this.renderedElement = document.createElement(this.elementType);

        this._setPropertiesOnRenderedElement();

        return this.renderedElement;
    }

    updateElement({ oldNode }) {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("HtmlNode.updateElement", this);
        }

        this.renderedElement = oldNode.renderedElement;

        ASSERT(this.renderedElement.nodeName === this.elementType);

        // Remove all previous event listeners.
        // Notice that we are iterating through the old node.
        for (let [propertyName, propertyValue] of Object.entries(oldNode.properties)) {
            if (propertyName.startsWith("$")) {
                let eventName = propertyName.replace("$", "");
                oldNode.renderedElement.removeEventListener(eventName, propertyValue);
            }
        }

        // Remove attributes that do not appear in this node.
        for (let propertyName of Object.keys(this.renderedElement.attributes)) {
            if (false === propertyName in this.properties) {
                this.renderedElement.removeAttribute(propertyName);
            }
        }

        // Update all the attributes.
        this._setPropertiesOnRenderedElement();

        return this.renderedElement;
    }

    removeElement() {
        if (DEBUG_ELEMENT_CREATION) {
            console.log("HtmlNode.removeElement", this);
        }

        this.renderedElement.parentNode.removeChild(this.renderedElement);
        this.renderedElement = null;
    }

    getChildren() {
        return this.children;
    }

    renderChildren({ oldFirstChild }) {
        if (DEBUG_RENDER_CHILDREN) {
            console.log("HtmlNode.renderChilden", oldFirstChild);
        }

        let oldNextChild = oldFirstChild

        // Render the children.
        for (let child of this.children) {
            if (DEBUG_RENDER_CHILDREN) {
                console.log("-> render", child, oldNextChild);
            }
            oldNextChild = child.render({
                oldNode: oldNextChild,
                parentElement: this.renderedElement,
            });
        }

        // Remove trailing elements
        while (oldNextChild !== null) {
            if (DEBUG_RENDER_CHILDREN) {
                console.log("-> remove", oldNextChild);
            }
            oldNextChild.removeElement();
            oldNextChild = oldNextChild.nextSibling;
        }
    }

    _setPropertiesOnRenderedElement() {
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            if (propertyName.startsWith("$")) {
                // Event handlers.
                let eventName = propertyName.replace("$", "");
                this.renderedElement.addEventListener(eventName, propertyValue);
            } else {
                // Regular attributes.
                ASSERT(typeof propertyValue === "string" || propertyValue instanceof String);
                this.renderedElement.setAttribute(propertyName, propertyValue);
            }
        }
    }
}

export class Instance {
    mount(rootContainerElement, newNode) {
        newNode.render({
            oldNode: null,
            parentElement: rootContainerElement,
        });
    }
}
