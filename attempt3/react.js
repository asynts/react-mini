export class HtmlObject {
    // The body is first assigned to 'innerText' and then the children are added.
    // If the body is 'null', that step is skipped.
    // Use 'body=""' or 'children=[]'.
    constructor({ type, body, attributes, children }) {
        this.type = type;
        this.body = body;
        this.attributes = attributes;
        this.children = children;
    }
}

export class ComponentObject {
    // The body is first assigned to 'innerText' and then the children are added.
    // If the body is 'null', that step is skipped.
    // Use 'body=""' or 'children=[]'.
    constructor({ Component, body, attributes, children }) {
        this.Component = Component;
        this.body = body;
        this.attributes = attributes;
        this.children = children;
    }
}

// FIXME: Get rid of nested component state if unused in render.
export class ComponentState {
    constructor(instance) {
        this.instance = instance;

        // Map 'key' to 'ComponentState'.
        this.childComponentState = {};

        // Used by 'useState' hook.
        this.state = {};
    }

    getNestedComponentState(key) {
        if (this.childComponentState[key] === undefined) {
            this.childComponentState[key] = new ComponentState(this.instance);
        }

        return this.childComponentState[key];
    }

    useState(id, defaultValue) {
        if (this.state[id] === undefined) {
            this.state[id] = defaultValue;
        }

        function setValue(newValue) {
            this.state[id] = newValue;
            this.instance.queueRender();
        }

        return [this.state[id], setValue.bind(this)];
    }
}

export class ReactInstance {
    constructor({ RootComponent, body, attributes, children }) {
        this.RootComponent = RootComponent;
        this.body = body;
        this.attributes = attributes;
        this.children = children;

        this.rootElement = null;
        this.rootComponentState = null;
    }

    objectToElement(object, componentState) {
        if (object instanceof HtmlObject) {
            let newElement = document.createElement(object.type);
            
            newElement.innerText = object.body;

            for (let [attribute, value] of Object.entries(object.attributes)) {
                if (attribute.startsWith("$")) {
                    if (attribute === "$onClick") {
                        newElement.addEventListener("click", value);
                    } else {
                        throw new Error("Assertion failed");
                    }
                } else {
                    newElement.setAttribute(attribute, value);
                }
            }

            for (let childObject of object.children) {
                let newChildElement = this.objectToElement(childObject, componentState);
                newElement.appendChild(newChildElement);
            }

            return newElement;
        } else if (object instanceof ComponentObject) {
            let newComponentState = componentState.getNestedComponentState(object.attributes.key);

            // FIXME
            let state = {
                useState(id, defaultValue) {
                    return [null, null];
                },
            };

            let newObject = object.Component(newComponentState, object.attributes, object.children);
            let newElement = this.objectToElement(newObject, newComponentState);

            newElement.setAttribute("data-component", object.Component.name);

            return newElement;
        }
    }

    mount(rootElement) {
        this.rootElement = rootElement;
        this.rootComponentState = new ComponentState(this);

        this.render();
    }

    render() {
        let newRootObject = new ComponentObject({
            Component: this.RootComponent,
            body: this.body,
            attributes: this.attributes,
            children: this.children,
        });

        let newRootElement = this.objectToElement(newRootObject, this.rootComponentState);

        this.rootElement.replaceWith(newRootElement);
        this.rootElement = newRootElement;
    }

    queueRender() {
        // Usually, renders are triggered from event handlers.
        // Let the event handlers run through.
        setTimeout(() => this.render(), 0);
    }
}
