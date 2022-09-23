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
        let newElement = document.createElement(newObject.type);

        newElement.innerText = newObject.body;

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
            // FIXME: I need to extract this logic to be able to call it recursively.
            //        The logic should go into 'HtmlObject' and 'ComponentObject' respectively.
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

        if (parentComponent.childComponents[key] === undefined) {
            parentComponent.childComponents[key] = new Component(this);
        }

        return parentComponent.childComponents[key].toElement();
    }
}

export class Component {
    constructor(object) {
        this.object = object;

        // Reference to rendered element if exists.
        this.element = null;

        // If this component was accessed during the current render cycle.
        this.touched = false;

        // Used to keep track of nested component, indexed by 'key' attribute.
        this.childComponents = new Map;

        // Used to keep track of state for 'useState' hook.
        this.state = new Map;
    }

    useState(key, defaultValue) {
        if (this.state[key] === undefined) {
            this.state[key] = defaultValue;
        }

        function setValue(newValue) {
            this.state[key] = newValue;
            this.queueRender();
        }

        return [this.state[key], setValue.bind(this)];
    }

    // FIXME: Remove
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

    toElement() {
        let newObject = this.Component(this, this.attributes, this.children);
        return newObject.toElement(this);
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
        this.cleanupUnusedChildren();

        this.element.replaceWith(newElement);
        this.element = newElement;
    }
}

export class ReactInstance {
    constructor(object) {
        this.object = object;

        this.rootElement = null;
        this.rootComponent = null;
    }

    mount(rootElement) {
        ASSERT(this.rootComponent === null);
        this.rootElement = rootElement;

        this.rootComponent = new Component(this.object);
        this.rootComponent.queueRender();
    }
}
