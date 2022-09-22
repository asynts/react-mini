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

export class ComponentState {
    constructor(instance) {
        this.instance = instance;

        this.name = null;

        // If this state was accessed during the current render.
        this.touched = false;

        // Map 'key' to 'ComponentState'.
        this.childComponentState = new Map;

        // Used by 'useState' hook.
        this.state = {};
    }

    resetTouched() {
        this.touched = false;
        for (let [key, state] of Object.entries(this.childComponentState)) {
            state.resetTouched();
        }
    }

    cleanupUnusedChildren() {
        for (let [key, state] of Object.entries(this.childComponentState)) {
            if (!state.touched) {
                console.log(`deleting state: '${key}'`);
                delete this.childComponentState[key];
            } else {
                state.cleanupUnusedChildren();
            }
        }
    }

    getNestedComponentState(key) {
        if (this.childComponentState[key] === undefined) {
            this.childComponentState[key] = new ComponentState(this.instance);
        }

        this.childComponentState[key].touched = true;
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
        this.componentState = null;
    }

    objectToElement(object, componentState) {
        if (object instanceof HtmlObject) {
            let newElement = document.createElement(object.type);
            
            newElement.innerText = object.body;

            for (let [attribute, value] of Object.entries(object.attributes)) {
                if (attribute.startsWith("$")) {
                    if (attribute === "$onClick") {
                        newElement.addEventListener("click", value);
                    } else if (attribute === "$onChange") {
                        newElement.addEventListener("input", value);
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
            newComponentState.name = object.Component.name;

            let newObject = object.Component(newComponentState, object.attributes, object.children);
            let newElement = this.objectToElement(newObject, newComponentState);

            newElement.setAttribute("data-component", object.Component.name);

            return newElement;
        }
    }

    mount(rootElement) {
        this.rootElement = rootElement;

        this.componentState = new ComponentState(this);

        this.render();
    }

    render() {
        let newRootObject = new ComponentObject({
            Component: this.RootComponent,
            body: this.body,
            attributes: this.attributes,
            children: this.children,
        });

        this.componentState.resetTouched();
        let newRootElement = this.objectToElement(newRootObject, this.componentState);
        this.componentState.cleanupUnusedChildren();

        console.log(this.componentState);

        this.rootElement.replaceWith(newRootElement);
        this.rootElement = newRootElement;
    }

    queueRender() {
        // Usually, renders are triggered from event handlers.
        // Let the event handlers run through.
        setTimeout(() => this.render(), 0);
    }
}
