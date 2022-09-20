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

export function createRoot({ Component, body, attributes, children, rootElement }) {
    function objectToElement(object) {
        console.log("objectToElement", object);

        if (object instanceof HtmlObject) {
            let newElement = document.createElement(object.type);
            
            newElement.innerText = object.body;

            for (let [attribute, value] of Object.entries(object.attributes)) {
                if (attribute.startsWith("$")) {
                    // FIXME: Deal with special attributes.
                } else {
                    newElement.setAttribute(attribute, value);
                }
            }

            for (let childObject of object.children) {
                let newChildElement = objectToElement(childObject);
                newElement.appendChild(newChildElement);
            }

            return newElement;
        } else if (object instanceof ComponentObject) {
            // FIXME
            let state = {
                useState(id, defaultValue) {
                    return [null, null];
                },
            };

            let newObject = object.Component(state, object.attributes, object.children);
            let newElement = objectToElement(newObject);

            newElement.setAttribute("data-component", object.Component.name);

            return newElement;
        }
    }

    function render() {
        let newRootObject = new ComponentObject({
            Component,
            body: body,
            attributes: attributes,
            children: children,
        });

        let newRootElement = objectToElement(newRootObject);

        rootElement.replaceWith(newRootElement);
        rootElement = newRootElement;
    }

    render();
}
