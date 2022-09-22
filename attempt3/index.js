import {
    HtmlObject,
    ComponentObject,
    ReactInstance,
} from "./react.js"

function Counter(state, attributes, children) {
    let [counter, setCounter] = state.useState("counter", 0);

    function onClick(event) {
        setCounter(counter + 1);
    }

    /*
    <div>
        <p>Counter: {counter}</p>
        <button onClick={onClick}>Increment</button>
    </div>
    */
    return new HtmlObject({
        type: "div",
        body: "",
        attributes: {},
        children: [
            new HtmlObject({
                type: "p",
                body: `Counter: ${counter}`,
                attributes: {},
                children: [],
            }),
            new HtmlObject({
                type: "button",
                body: "Increment",
                attributes: {
                    $onClick: onClick,
                },
                children: [],
            }),
        ],
    });
}

function Conditional(state, attributes, children) {
    let [isVisible, setIsVisible] = state.useState("isVisible", true);

    function onClick(event) {
        setIsVisible(!isVisible);
    }

    /*
    <div>
        {isVisible ? props.children : []}
        <button onClick={onClick}>Toggle Visibility</button>
    </div>
    */
    return new HtmlObject({
        type: "div",
        body: "",
        attributes: {},
        children: [
            ...(isVisible ? children : []),
            new HtmlObject({
                type: "button",
                body: "Toggle Visibility",
                attributes: {
                    $onClick: onClick,
                },
                children: [],
            }),
        ],
    });
}

function TextBox(state, attributes, children) {
    let [name, setName] = state.useState("text", "");

    function onChange(event) {
        setName(event.target.value);
    }

    /*
    <div>
        <div>
            <span>Name:</span>
            <input value={name} onChange={onChange} />
        </div>
        <div>
            Your name is {name}.
        </div>
    </div>
    */
    return new HtmlObject({
        type: "div",
        body: "",
        attributes: {},
        children: [
            new HtmlObject({
                type: "div",
                body: "",
                attributes: {},
                children: [
                    new HtmlObject({
                        type: "span",
                        body: "Name:",
                        attributes: {},
                        children: [],
                    }),
                    new HtmlObject({
                        type: "input",
                        body: "",
                        attributes: {
                            value: name,
                            $onChange: onChange,
                        },
                        children: [],
                    }),
                ],
            }),
            new HtmlObject({
                type: "div",
                body: `Your name is ${name}.`,
                attributes: {},
                children: [],
            }),
        ],
    });
}

function Root(state, attributes, children) {
    /*
    <div>
        <Conditional key="1">
            <Counter key="1" />
            <Counter key="2" />
        </Conditional>
        <TextBox />
    </div>
    */
    return new HtmlObject({
        type: "div",
        body: "",
        attributes: {},
        children: [
            new ComponentObject({
                Component: Conditional,
                body: "",
                attributes: {
                    key: "1",
                },
                children: [
                    new ComponentObject({
                        Component: Counter,
                        body: "",
                        attributes: {
                            key: "1",
                        },
                        children: [],
                    }),
                    new ComponentObject({
                        Component: Counter,
                        body: "",
                        attributes: {
                            key: "2",
                        },
                        children: [],
                    }),        
                ],
            }),
            new ComponentObject({
                Component: TextBox,
                body: "",
                attributes: {},
                children: [],
            }),
        ],
    });
}

/*
<Root key="1" />
*/
let instance = new ReactInstance({
    RootComponent: Root,
    attributes: {
        key: "1",
    },
    children: [],
});

instance.mount(document.getElementById("root"));
