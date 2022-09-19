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

let counterState = {};

// Retrieves the state of the currently executing component.
function getState() {
    // FIXME: How does React keep track of the state.

    return counterState;
}

function useState(id, defaultValue) {
    // FIXME: How does React void using an 'id' here?

    let state = getState();

    function setValue(newValue) {
        state[id] = newValue;

        // FIXME: How is React able to only update this component?
        updateRoot();
    }

    if (id in state) {
        return [
            state[id],
            setValue,
        ];
    } else {
        return [
            defaultValue,
            setValue,
        ];
    }
}

function HelloWorld(props) {
    /*
    <h1>Hello, world!</h1>
    */
    return {
        type: "h1",
        body: `Hello, ${props.name}!`,
        attributes: {},
        children: [],
    };
}

function Counter(props) {
    let [counter, setCounter] = useState("counter", 0);

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
            HelloWorld({
                name: "Fritz",
            }),
            Counter(),
        ],
    };
}

let rootElement = document.getElementById("root");

function updateRoot() {
    let newRootObject = Root();

    let newRootElement = htmlFromObject(newRootObject);
    rootElement.replaceWith(newRootElement);
    rootElement = newRootElement;
}

updateRoot();
