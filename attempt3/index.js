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

function Root(state, attributes, children) {
    /*
    <div>
        <Conditional>
            <Counter />
            <Counter />
        </Conditional>
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
                attributes: {},
                children: [
                    new ComponentObject({
                        Component: Counter,
                        body: "",
                        attributes: {},
                        children: [],
                    }),
                    new ComponentObject({
                        Component: Counter,
                        body: "",
                        attributes: {},
                        children: [],
                    }),
                ],
            }),
        ],
    });
}

let instance = new ReactInstance({
    RootComponent: Root,
    attributes: {},
    children: [],
});

instance.mount(document.getElementById("root"));
