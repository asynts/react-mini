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
    let counter = 0;

    function setCounter(newCounter) {
        // FIXME
    }

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
