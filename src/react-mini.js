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

function isString(value) {
    return typeof value === "string" || value instanceof String;
}

function isArray(value) {
    return Array.isArray(value);
}

// This is very similar to React, but we simplify a few things:
//
// -   We clearly distinguish between 'HtmlNode', 'TextNode' and 'ComponentNode'.
//
// -   Component nodes can not have children.
//
// -   Every 'HtmlNode' and 'ComponentNode' must have a 'key' property that is unique in the parent node.
//     In React this can be provided but isn't mandatory.
//
// -   Many of the helper functions like 'useReducer' are missing.

export class Node {
    constructor() {
        // This will be updated by the constructor of the parent node.
        this.nextSibling = null;
    }

    // This logic decides if we reconcile this node with the other node.
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
                // The text nodes do not have keys, because it doesn't matter if we reconcile them incorrectly.
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

    // This will update the DOM to match what 'this' describes.
    // We are provided with an 'oldNode' that describes how things used to be.
    //
    // Note: The caller can either be 'Instance.mount' the 'setValue' function in 'ComponentNode.useState'.
    //
    // Note: The 'oldNode' can be 'null' if this element is rendered for the first time.
    //       Then 'parentElement' must not be 'null', otherwise, 'parentElement' is not needed.
    //
    // Returns the node that should be passed as 'oldNode' to the render function of the next sibling if it exists.
    render({ oldNode, parentElement }) {
        // There are four types of matches that can occur:
        //
        // -   DIRECT_MATCH means that the node we encounter matches what we expect.
        //     We update the DOM node and then recursively handle child nodes.
        //
        //     This happens if the node is where it used to be.
        //
        // -   SKIP_MATCH means that the node we encounter doesn't match what we expect.
        //     However, we were able to fast-forward and found a matching sibling.
        //
        //     We remove the skipped DOM nodes.
        //     We update the DOM node and then recursively handle child nodes.
        //
        //     This happens if a list of elements is rendered and items are removed or inserted.
        //     This happens if a conditional element disappears but another element after it matches.
        //
        // -   NO_MATCH means that we were unable to find a matching node.
        //     We insert a new DOM node and then recursively handle child nodes.
        //
        //     This happens if something is added to a list and thus didn't exist in the previous render.
        //     This happens if a conditional element reappears.
        //
        // -   NO_MATCH_NEW occurs when we were unable to find a matching node and we don't even have a candidate.
        //     We append a new DOM node to the parent and recursively handle child nodes.
        //
        //     This happens if a node is rendered for the first time.

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

// Component nodes can store state.
// The state is indexed by the call order of 'useState', same as React.
//
// The state can be modified in-place without copying the node.
// However, for the next render a new node must be created and the state must be copied over.
export class ComponentNode extends Node {
    constructor({ componentFunction, properties }) {
        super()

        this.componentFunction = componentFunction;

        ASSERT("key" in properties);
        this.properties = properties;

        this.nextStateIndex = null;
        this.state = null;

        this.innerNode = null;
    }

    useState(defaultValue) {
        // We use the call order to distinguish the data we are referring to.
        ASSERT(this.nextStateIndex !== null)
        let stateIndex = this.nextStateIndex++;

        let value = defaultValue;
        if (this.state[stateIndex] !== undefined) {
            value = this.state[stateIndex];
        }

        function setValue(newValue) {
            this.state[stateIndex] = newValue;

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
        this.state = [];

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
        this.nextStateIndex = 0;
        this.innerNode = this.componentFunction({
            properties: this.properties,
            useState: this.useState.bind(this),
        });
    }
}

export class TextNode extends Node {
    constructor({ text, renderedElement }) {
        super();

        this.text = text;

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

        // Remove attributes that do not appear in this node anymore.
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
                ASSERT(isString(propertyValue));
                this.renderedElement.setAttribute(propertyName, propertyValue);
            }
        }
    }
}

// We use esbuild to automatically compile JSX into calls to this function:
//
//     cat foo.jsx | esbuild --loader=jsx --jsx-factory=jsx_createComponent > foo.js
//
// For this to work we need to accept the same syntax that 'React.createElement' uses.
// By setting this on 'window' it will be accessible without impot (if the module has been loaded.)
//
// Note: You can look at the output of the esbuild command for more details.
window.jsx_createComponent = (type, properties, ...children) => {
    // The key property is mandatory.
    ASSERT("key" in properties);

    let processedChildren = [];
    function processChild(child) {
        // Skip placeholder values created by use of '&&' or '||'.
        if (child === null || child === false || child === true) {
            return;
        }

        if (isString(child)) {
            processedChildren.push(new TextNode({ text: child }));
        } else if (isArray(child)) {
            for (let innerChild of child) {
                processChild(innerChild);
            }
        } else {
            processedChildren.push(child);
        }
    }
    processChild(children);

    // Detect if this is an HTML node.
    if (isString(type)) {
        return new HtmlNode({
            elementType: type,
            properties,
            children: processedChildren,
        });
    }

    // FIXME: We do not support children for component elements.
    ASSERT(processedChildren.length === 0);

    // Otherwise, we have a component node.
    return new ComponentNode({
        componentFunction: type,
        properties,
    });
};

export function mount(rootContainerElement, newNode) {
    newNode.render({
        oldNode: null,
        parentElement: rootContainerElement,
    });
}
