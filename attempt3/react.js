export class HtmlObject {
    constructor({ type, attributes, children }) {
        this.type = type;
        this.attributes = attributes;
        this.children = children;
    }
}

export class ComponentObject {
    constructor({ Component, attributes, children }) {
        this.Component = Component;
        this.attributes = attributes;
        this.children = children;
    }
}

export class TextObject {
    constructor(text) {
        this.text = text;
    }
}
