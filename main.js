let react = {
    // The component state is stored in a tree structure.
    _componentStateTree: {
        hookState: [],
        currentHookIndex: 0,
        Component: null,
        renderedObject: null,

        parent: null,
        children: [],
    },

    _currentComponentState: null,

    resetForNextRender() {
        this._currentComponentState = this._componentStateTree;
    },

    incrementHookCallIndex() {
        this.getCurrentComponentState().currentHookIndex++;
    },

    getCurrentComponentState() {
        return this._currentComponentState;
    },

    getCurrentHookState() {
        let componentState = this.getCurrentComponentState();
        let hookState = componentState.hookState[componentState.currentHookIndex];
        if (hookState === undefined) {
            return null;
        } else {
            return hookState;
        }
    },

    resetCurrentComponentRetainingState() {
        this._currentComponentState.currentHookIndex = 0;
        this._currentComponentState.Component = null;
        this._currentComponentState.renderedObject = null;
    },

    resetComponentDiscardingState() {
        this._currentComponentState.hookState = [];
        this._currentComponentState.currentHookIndex = 0;
        this._currentComponentState.Component = null;
        this._currentComponentState.renderedObject = null;
    },

    renderComponent(Component, props) {
        let object = Component(props);
        this.getCurrentComponentState().object = object;
        react.incrementComponentIndex();
        return object;
    },
};

// Converts out simplified object representation into an actual HTML element.
function htmlFromObject(object) {
    let element = document.createElement(object.Component);
    element.innerText = object.body;

    for (let [attribute, value] of Object.entries(object.attributes)) {
        if (attribute === "key")
            continue;

        element.setAttribute(attribute, value);
    }

    for (let childObject of object.children) {
        element.appendChild(htmlFromObject(childObject));
    }

    if (object.onClick !== undefined) {
        element.addEventListener("click", object.onClick);
    }

    return element;
}

function createComponent(Component, props) {
    // Use heuristic to figure out if this is the same component or not.
    let previousComponentState = react.getCurrentComponentState();
    console.log(previousComponentState);
    if (previousComponentState !== null) {
        let bSameType = previousComponentState.Component === Component;
        let bSameKey = previousComponentState.object.attributes["key"] === props.key;

        if (bSameType && bSameKey) {
            // This is the same component, retain state.
            react.resetCurrentComponentRetainingState();

            return react.renderComponent(Component, props);
        }
    }

    // This is not the same component or the key changed, discard state.
    react.resetComponentDiscardingState();

    return react.renderComponent(Component, props);
}

function useState(defaultValue) {
    let state = react.getCurrentHookState();
    react.incrementHookCallIndex();

    function setValue(newValue) {
        state.value = newValue;
        updateRoot();
    }

    if (state.value === undefined) {
        return [
            defaultValue,
            setValue,
        ];
    } else {
        return [
            state.value,
            setValue,
        ];
    }
}

function Hello(props) {
    /*
    <h1>Hello, {props.name}!</h1>
    */
    return {
        type: "h1",
        body: `Hello, ${props.name}!`,
        attributes: {},
        children: [],
    };
}

function Counter(props) {
    let [counter, setCounter] = useState(0);

    /*
    <div>
        <p>counter: {counter}</p>
        <button onClick={() => setCounter(counter + 1)}>Increment</button>
    </div>
    */
    return {
        type: "div",
        body: null,
        attributes: {},
        children: [
            {
                type: "p",
                body: `counter: ${counter}`,
                attributes: {},
                children: [],
            },
            {
                type: "button",
                body: "Increment",
                attributes: {},
                children: [],
                onClick: () => setCounter(counter + 1),
            },
        ],
    };
}

function Root(props) {
    /*
    <div>
        <Hello name="Fritz" />
        <Counter />
        <Counter />
    </div>
    */

    return {
        type: "div",
        body: null,
        attributes: {},
        children: [
            createComponent(Hello, { name: "Fritz" }),
            createComponent(Counter, {}),
            createComponent(Counter, {}),
        ],
    };
}

let rootElement = document.getElementById("root");

function updateRoot() {
    react.resetForNextRender();
    
    let newRootObject = createComponent(Root, {});

    let newRootElement = htmlFromObject(newRootObject);
    rootElement.replaceWith(newRootElement);
    rootElement = newRootElement;
}

updateRoot();
