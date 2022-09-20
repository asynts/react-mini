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
    return createHtmlObject({
        type: "div",
        attributes: {},
        children: [
            createHtmlObject({
                type: "p",
                attributes: {},
                children: [
                    createTextObject(`Counter: ${counter}`),
                ],
            }),
            createHtmlObject({
                type: "button",
                attributes: {
                    onClick,
                },
                children: [
                    createTextObject("Increment"),
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
    return createHtmlObject({
        type: "div",
        attributes: {},
        children: [
            ...(isVisible ? props.children : []),
            createHtmlObject({
                type: "button",
                attributes: {
                    onClick,
                },
                children: [
                    createTextObject("Toggle Visiblity"),
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
    return createHtmlObject({
        type: "div",
        attributes: {},
        children: [
            createComponentObject({
                Component: Conditional,
                attributes: {},
                children: [
                    createComponentObject({
                        Component: Counter,
                        attributes: {},
                        children: [],
                    }),
                    createComponentObject({
                        Component: Counter,
                        attributes: {},
                        children: [],
                    }),
                ],
            }),
        ],
    });
}
