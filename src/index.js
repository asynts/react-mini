import {
    Instance,
    TextNode,
    HtmlNode,
    ComponentNode,
} from "./react-mini.js";

function IncrementComponent({ useState, state }) {
    let [counter, setCounter] = useState("counter", 0);

    /*
    <div #1 key="root">
        <p #2 key="1">
            <text #3>{counter}</text>
        </p>
        <button #4 key="2" onClick={() => setCounter(counter + 1)}>
            <text #5>Increment</text>
        </button>
    </div>
    */
    let node_5 = new TextNode({
        text: "Increment",
    });
    let node_4 = new HtmlNode({
        nextSibling: null,
        elementType: "button",
        properties: {
            key: "2",
            $click: () => setCounter(counter + 1),
        },
        children: [
            node_5,
        ],
    });
    let node_3 = new TextNode({
        text: `${counter}`,
    });
    let node_2 = new HtmlNode({
        nextSibling: node_4,
        elementType: "p",
        properties: {
            key: "1",
        },
        children: [
            node_3,
        ],
    });
    let node_1 = new HtmlNode({
        nextSibling: null,
        elementType: "div",
        properties: {
            key: "root",
        },
        children: [
            node_2,
            node_4,
        ],
    });

    return node_1;
}

function CalculatorComponent({ state, useState }) {
    let [inputState, setInputState] = useState("inputState", {
        a: "",
        b: "",
    });

    function onChange(name) {
        return event => {
            setInputState({
                ...inputState,
                [name]: event.target.value,
            });
        };
    }

    /*
    <div #1 key="root">
        <input #2 key="1" type="text" value={inputState.a} $change={onChange("a")} />
        <input #3 key="2" type="text" value={inputState.b} $change={onChange("b")} />
        <p #4 key="3">
            <text #5>{parseInt(inputState.a) + parseInt(inputState.b)}</text>
        </p>
    </div>
    */
    let node_5 = new TextNode({
        text: (parseInt(inputState.a) + parseInt(inputState.b)).toString(),
    });
    let node_4 = new HtmlNode({
        nextSibling: null,
        elementType: "p",
        properties: {
            key: "3",
        },
        children: [
            node_5,
        ],
    });
    let node_3 = new HtmlNode({
        nextSibling: node_4,
        elementType: "input",
        properties: {
            key: "2",
            type: "text",
            value: inputState.b,
            $input: onChange("b"),
        },
        children: [],
    });
    let node_2 = new HtmlNode({
        nextSibling: node_3,
        elementType: "input",
        properties: {
            key: "1",
            type: "text",
            value: inputState.a,
            $input: onChange("a"),
        },
        children: [],
    });
    let node_1 = new HtmlNode({
        nextSibling: null,
        elementType: "div",
        properties: {
            key: "root",
        },
        children: [
            node_2,
            node_3,
            node_4,
        ],
    });

    return node_1;
}

/*
let component = new ComponentNode({
    nextSibling: null,
    componentFunction: IncrementComponent,
    properties: {
        key: "root",
    },
});
*/

let component = new ComponentNode({
    nextSibling: null,
    componentFunction: CalculatorComponent,
    properties: {
        key: "root",
    },
});

new Instance()
    .mount(
        document.getElementById("root"),
        component,
    );
