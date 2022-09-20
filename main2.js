function Hello(component, props) {
    /*
    <h1>Hello, {props.name}</h1>
    */
    return component.createHtmlObject("h1", "Hello, " + props.name, {}, []);
}

function Counter(component, props) {
    let [counter, setCounter] = component.getState("counter", 0);

    function onClick(event) {
        setCounter(counter + 1);
    }

    /*
    <div>
        <p>Counter: {counter}</p>
        <button onClick={onClick}>Increment</button>
    </div>
    */
    return component.createHtmlObject({
        type: "div",
        body: "",
        props: {},
        children: [
            component.createHtmlObject({
                type: "p",
                body: `Counter: ${counter}`,
                props: {},
                children: [],
            }),
            component.createHtmlObject({
                type: "button",
                body: "Increment",
                props: {
                    onClick,
                },
                children: [],
            }),
        ],
    });
}

function Conditional(component, props) {
    let [isVisible, setIsVisible] = component.getState("isVisible", true);

    function onClick(event) {
        setIsVisible(!isVisible);
    }

    /*
    <div>
        {isVisible ? {props.children} : null}
        <button onClick={onClick}>Toggle Visibility</button>
    </div>
    */
    return component.createHtmlObject({
        type: "div",
        body: "",
        props: {},
        children: [
            ...(isVisible ? props.children.map(child => component.createPreparedComponentObject(child)) : []),
            component.createHtmlObject({
                type: "button",
                body: "Toggle Visibility",
                props: {
                    onClick,
                },
                children: [],
            }),
        ],
    });
}

function Root(component, props) {
    /*
    <div>
        <Hello name="Tom" />
        <Counter />
        <Conditional>
            <Counter />
        </Conditional>
    </div>
    */
    return component.createHtmlObject({
        type: "div",
        body: "",
        props: {},
        children: [
            component.createComponentObject({
                type: Hello,
                body: "",
                props: {
                    name: "Tom",
                },
                children: [],
            }),
            component.createComponentObject({
                type: Counter,
                body: "",
                props: {},
                children: [],
            }),
            component.createComponentObject({
                type: Conditional,
                body: "",
                props: {},
                children: [
                    component.prepareComponentObject({
                        type: Counter,
                        body: "",
                        props: {},
                        children: [],
                    }),
                ],
            })
        ],
    });
}

React.createRoot({
    type: Root,
    props: {},
    mountPointElement: document.getElementById("root"),
});
