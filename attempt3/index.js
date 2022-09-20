import { HtmlObject, ComponentObject, TextObject } from "./react.js"

function Counter(component, props) {
    let [counter, setCounter] = component.useState("counter", 0);

    function onClick(event) {
        setCounter(counter + 1);
    }

    /*
    <div>
        <p>Counter: {counter}</p>
        <button onClick={onClick}>Increment</button>
    </div>
    */
    return HtmlObject({
        type: "div",
        attributes: {},
        children: [
            HtmlObject({
                type: "p",
                attributes: {},
                children: [
                    TextObject(`Counter: ${counter}`),
                ],
            }),
            HtmlObject({
                type: "button",
                attributes: {
                    onClick,
                },
                children: [
                    TextObject("Increment"),
                ],
            }),
        ],
    });
}

function Conditional(component, props) {
    let [isVisible, setIsVisible] = component.useState("isVisible", true);

    function onClick(event) {
        setIsVisible(!isVisible);
    }

    /*
    <div>
        {isVisible ? props.children : []}
        <button onClick={onClick}>Toggle Visibility</button>
    </div>
    */
    return HtmlObject({
        type: "div",
        attributes: {},
        children: [
            ...(isVisible ? props.children : []),
            HtmlObject({
                type: "button",
                attributes: {
                    onClick,
                },
                children: [
                    TextObject("Toggle Visiblity"),
                ],
            }),
        ],
    });
}

function Root(component, props) {
    /*
    <div>
        <Conditional>
            <Counter />
            <Counter />
        </Conditional>
    </div>
    */
    return HtmlObject({
        type: "div",
        attributes: {},
        children: [
            ComponentObject({
                Component: Conditional,
                attributes: {},
                children: [
                    ComponentObject({
                        Component: Counter,
                        attributes: {},
                        children: [],
                    }),
                    ComponentObject({
                        Component: Counter,
                        attributes: {},
                        children: [],
                    }),
                ],
            }),
        ],
    });
}
