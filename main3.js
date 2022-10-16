function ASSERT_NOT_REACHED() {
    debugger;
    throw new Error("ASSERT_NOT_REACHED");
}

function ASSERT(condition) {
    if (!conditoin) {
        debugger;
        throw new Error("ASSERT");
    }
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

    // FIXME
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

    queueRenderAsync(): void

    render({ oldElement: window.Element, oldNode: ComponentNode }): void
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

    render({ oldElement, oldNode }) {
        // FIXME
    }
}

/*
TextNode {
    text: string

    createElement(): window.Element
    updateElement(window.Element): void

    render({ oldElement: window.Element, oldNode: TextNode }): void
}
*/
class TextNode extends Node {
    constructor({ nextSibling, text }) {
        super({ nextSibling });

        this.text = text;
    }

    createElement() {
        return document.createTextNode(this.text);
    }

    updateElement(element) {
        ASSERT(element.nodeName === "#text");

        element.nodeValue = this.text;
    }

    render({ oldElement, oldNode }) {
        // This node does not have any children to worry about.
    }
}

/*
HtmlNode : Node {
    elementType: string
    properties: map[string, object]
    children: list[Node]

    createElement(): window.Element
    updateElement(window.Element): void

    render({ oldElement: window.Element, oldNode: HtmlNode }): void
}
*/
class HtmlNode extends Node {
    constructor({ nextSibling, elementType, properties, children }) {
        super({ nextSibling });

        // This is important because this is what 'Element.nodeName' reports.
        this.elementType = elementType.toUpperCase();
 
        this.properties = properties;
        this.children = children;
    }
    
    createElement() {
        let element = document.createElement(this.elementType);
        
        // Set all the attributes.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            element.setAttribute(propertyName, propertyValue);
        }

        return element;
    }

    updateElement(element) {
        ASSERT(element.nodeName === this.elementType);

        // Remove attributes that do not appear in this node.
        for (let propertyName of Object.keys(element.attributes)) {
            if (false === propertyName in this.properties) {
                element.removeAttribute(propertyName);
            }
        }

        // Update all attributes to match.
        for (let [propertyName, propertyValue] of Object.entries(this.properties)) {
            element.setAttribute(propertyName, propertyValue);
        }
    }

    render({ oldElement, oldNode }) {
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

        function handle_DIRECT_MATCH() {
            newNode.updateElement(oldElement);

            for (let child of newNode.children) {
                // FIXME: Honestly, I got no clue what I need to do here.
                //        I should get out a piece of paper and figure it out.

                // FIXME: Recursion.
            }

            oldElement = oldElement.nextSibling;
            oldNode = oldNode.nextSibling;
        }

        function handle_SKIP_MATCH() {
            // FIXME: Remove elements, advancing 'oldElement' and 'oldNode'.

            handle_DIRECT_MATCH();
        }

        function handle_NO_MATCH() {
            oldElement.insertBefore(newNode.createElement());

            for (let child of newNode.children) {
                // FIXME: Recursion.
            }

            oldElement = oldElement;
            oldNode = oldNode;
        }

        if (oldNode.isEqual(newNode)) {
            handle_DIRECT_MATCH();
        } else {
            // Search following siblings for match.
            let oldSiblingNode = oldNode.nextSibling;
            while (oldSiblingNode !== null) {
                if (oldSiblingNode.isEqual(newNode)) {
                    handle_SKIP_MATCH();
                    break;
                }
            }

            if (oldSiblingNode === null) {
                handle_NO_MATCH();
            }
        }

        // FIXME
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

        // FIXME: At some point, we need to construct the nodes that are used by the next render.

        newNode.render({ oldElement, oldNode });
    }
}
