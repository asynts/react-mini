// Converts out simplified object representation into an actual HTML element.
function htmlFromObject(object) {
    let element = document.createElement(object.type);
    element.innerText = object.body;

    for (let [attribute, value] of Object.entries(object.attributes)) {
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

// We assume that all hooks are called in the same order.
// Thus we can just keep the state in an array and use the index to find it again.
//
// FIXME: How does this work with conditionally rendered components and loops?
// FIXME: Currently, this is global, how can this work if we only re-render one component in the middle?
let componentState = {
    _states: [],
    _callIndex: 0,

    resetCallIndex() {
        this._callIndex = 0;
    },

    getNextState() {
        if (this._callIndex >= this._states.length) {
            this._states[this._callIndex] = {};
        }

        return this._states[this._callIndex++];
    }
};

function useState(defaultValue) {
    let state = componentState.getNextState();

    function setValue(newValue) {
        state.value = newValue;

        // FIXME: How is React able to only update this component?
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
    return {
        type: "div",
        body: null,
        attributes: {},
        children: [
            Hello({
                name: "Fritz",
            }),
            Counter(),
            Counter(),
        ],
    };
}

let rootElement = document.getElementById("root");

function updateRoot() {
    componentState.resetCallIndex();
    let newRootObject = Root();

    let newRootElement = htmlFromObject(newRootObject);
    rootElement.replaceWith(newRootElement);
    rootElement = newRootElement;
}

updateRoot();
