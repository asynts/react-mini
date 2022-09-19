let react = {
    // List of objects with following members:
    //
    //     hookState
    //     currentHookIndex
    //     Component
    //     object
    //
    _componentState: [],

    _currentComponentIndex: 0,

    resetForNextRender() {
        this._currentComponentIndex = 0;
    },

    incrementComponentIndex() {
        this._currentComponentIndex++;
    },

    incrementHookCallIndex() {
        this.getCurrentComponentState().currentHookIndex++;
    },

    getCurrentComponentState() {
        let componentState = this._componentState[this._currentComponentIndex];
        if (componentState === undefined) {
            return null;
        } else {
            return componentState;
        }
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
        let previousComponentState = this.getCurrentComponentState();

        this._componentState[this._currentComponentIndex] = {
            hookState: previousComponentState.hookState,
            currentHookIndex: 0,
            Component: null,
            object: null,
        }
    },

    resetComponentDiscardingState() {
        this._componentState[this._currentComponentIndex] = {
            hookState: [],
            currentHookIndex: 0,
            Component: null,
            object: null,
        };
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
