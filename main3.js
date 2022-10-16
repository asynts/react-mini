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

}
*/
class Node {
    constructor({ }) {

    }
}

/*
// Components are essentially wrappers for other nodes and eventually for HTML elements.
// They keep state that can be used by component functions.
ComponentNode : Node {
    componentFunction: function
    properties: map[string, object]
    children: list[Node]

    store: Store

    queueRender(): void
}
*/
class ComponentNode extends Node {
    constructor({ componentFunction, properties, children }) {
        super({});

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
    constructor({ text }) {
        super({});

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
    constructor({ elementType, properties, children }) {
        super({});

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
        this.currentRootNode = null;
    }

    mount(targetElement, node) {
        // FIXME
    }
}
