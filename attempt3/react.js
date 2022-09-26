function ASSERT_NOT_REACHED() {
    throw new Error("ASSERT_NOT_REACHED");
}

function ASSERT(condition) {
    if (!condition) {
        throw new Error("ASSERT");
    }
}

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

    toElement(parentComponent) {
        let newElement = document.createElement(this.type);

        newElement.innerText = this.body;

        for (let [attribute, value] of Object.entries(this.attributes)) {
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

        for (let childObject of this.children) {
            // We do not create a new component here.
            // It is not required for HTML children and the components will create it themselves.
            newElement.appendChild(childObject.toElement(parentComponent));
        }

        return newElement;
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

    toElement(parentComponent) {
        let key = this.attributes.key;
        ASSERT(key !== undefined);

        if (parentComponent.childComponents.get(key) === undefined) {
            parentComponent.childComponents.set(key, new Component(this));
        }

        return parentComponent.childComponents.get(key).toElement();
    }
}

export class Component {
    constructor(object) {
        this.object = object;

        // Reference to rendered element if exists.
        this.element = null;

        // If this component was accessed during the current render cycle.
        this.touched = true;

        // Used to keep track of nested component, indexed by 'key' attribute.
        this.childComponents = new Map;

        // Used to keep track of state for 'useState' hook.
        this.state = new Map;
    }

    useState(key, defaultValue) {
        if (this.state.get(key) === undefined) {
            this.state.set(key, defaultValue);
        }

        function setValue(newValue) {
            this.state.set(key, newValue);
            this.queueRender();
        }

        return [this.state.get(key), setValue.bind(this)];
    }

    toElement() {
        let newObject = this.object.Component(this, this.object.attributes, this.object.children);
        let newElement = newObject.toElement(this);

        this.element = newElement;

        return newElement;
    }

    resetChildrenTouched() {
        for (let childComponent of Object.values(this.childComponents)) {
            childComponent.touched = false;
        }
    }

    cleanupUntouchedChildren() {
        for (let [key, childComponent] of Object.entries(this.childComponents)) {
            if (!childComponent.touched) {
                this.childComponents.delete(key);
            }
        }
    }

    queueRender() {
        setTimeout(() => this.render(), 0);
    }

    render() {
        // This component was accessed.
        this.touched = true;

        this.resetChildrenTouched();
        let newElement = this.object.toElement(this);
        this.cleanupUntouchedChildren();

        this.element.replaceWith(newElement);
        this.element = newElement;
    }
}

export class ReactInstance {
    constructor(object) {
        this.object = object;

        this.rootComponent = null;
    }

    mount(rootElement) {
        ASSERT(this.rootComponent === null);

        this.rootComponent = new Component(this.object);
        this.rootComponent.element = rootElement;

        this.rootComponent.queueRender();
    }
}
