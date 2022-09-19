let react = {
    // FIXME
};

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

// Compare two objects without considering children.
function areObjectsShallowEqual(object1, object2) {
    // Notice that 'children' is missing from this list.
    let members = [
        "type",
        "body",
        "attributes",
        "onClick",
    ];

    for (let member of members) {
        if (object1[member] !== object2[member])
            return false;
    }

    return true;
}

function createComponent(Component, props) {
    // FIXME: This is where we need to compare the type of the component with before.
    //        If the type is the same, we assign the same state (but consider 'key' attribute).
    //        Otherwise, we discard the previous state and create new state.

    react.pushHookCallIndex();
    let object = Component(props);
    react.popHookCallIndex();

    react.incrementComponentIndex();

    return object;
}

function useState(defaultValue) {
    let state = react.getHookState();
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
    react.reset();
    
    let newRootObject = createComponent(Root, {});

    let newRootElement = htmlFromObject(newRootObject);
    rootElement.replaceWith(newRootElement);
    rootElement = newRootElement;
}

updateRoot();
