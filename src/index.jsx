import {
    Instance,
    TextNode,
    HtmlNode,
    ComponentNode,
} from "./react-mini.js";

function IncrementComponent({ properties, useState }) {
    let [counter, setCounter] = useState("counter", 0);

    /*
    <div #1 key="root" class="component">
        <h3 #1.1 key="0">
            <text #1.2 key="1">Increment Component</text>
        </h3>
        <p #2 key="1">
            <text #3 key="1">{counter}</text>
        </p>
        <button #4 key="2" onClick={() => setCounter(counter + 1)}>
            <text #5 key="1">Increment</text>
        </button>
    </div>
    */
    let node_5 = new TextNode({
        text: "Increment",
        properties: {
            key: "1",
        }
    });
    let node_4 = new HtmlNode({
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
        properties: {
            key: "1",
        }
    });
    let node_2 = new HtmlNode({
        elementType: "p",
        properties: {
            key: "1",
        },
        children: [
            node_3,
        ],
    });
    let node_1_2 = new TextNode({
        text: "Increment Component",
        properties: {
            key: "1",
        },
    });
    let node_1_1 = new HtmlNode({
        elementType: "h3",
        properties: {
            key: "0",
        },
        children: [
            node_1_2,
        ],
    });
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            node_1_1,
            node_2,
            node_4,
        ],
    });

    return node_1;
}

function CalculatorComponent({ properties, useState }) {
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
    <div #1 key="root" class="component">
        <h3 #1.1 key="0">
            <text #1.2 key="1">Calculator Component</text>
        </h3>
        <input #2 key="1" type="text" value={inputState.a} $change={onChange("a")} />
        <input #3 key="2" type="text" value={inputState.b} $change={onChange("b")} />
        <p #4 key="3">
            <text #5 key="1">{parseInt(inputState.a) + parseInt(inputState.b)}</text>
        </p>
    </div>
    */
    let node_5 = new TextNode({
        text: (parseInt(inputState.a) + parseInt(inputState.b)).toString(),
        properties: {
            key: "1",
        },
    });
    let node_4 = new HtmlNode({
        elementType: "p",
        properties: {
            key: "3",
        },
        children: [
            node_5,
        ],
    });
    let node_3 = new HtmlNode({
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
        elementType: "input",
        properties: {
            key: "1",
            type: "text",
            value: inputState.a,
            $input: onChange("a"),
        },
        children: [],
    });
    let node_1_2 = new TextNode({
        text: "Calculator Component",
        properties: {
            key: "1",
        },
    });
    let node_1_1 = new HtmlNode({
        elementType: "h3",
        properties: {
            key: "0",
        },
        children: [
            node_1_2,
        ],
    });
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            node_1_1,
            node_2,
            node_3,
            node_4,
        ],
    });

    return node_1;
}

function ListComponent({ properties, useState }) {
    let [items, setItems] = useState("items", []);

    function removeItem(index) {
        let newItems = [
            ...items.slice(0, index),
            ...items.slice(index + 1)
        ];
        setItems(newItems);
    }

    function appendNewItem() {
        let newItems = [
            ...items,
            Math.floor(Math.random() * 1000000).toString(),
        ];
        setItems(newItems);
    }

    return (
        <div key={properties.key} class="component">
            <h3 key="0">List Component</h3>
            <div key="1">
                {items.map((item, index) => (
                    <div key={item}>
                        {item}
                        <button key="1" $click={() => removeItem(index)}>X</button>
                    </div>
                ))}
            </div>
            <button key="2" $click={() => appendNewItem()}>Append New</button>
        </div>
    );
}

function ConditionComponent({ properties, useState }) {
    let [visible, setVisible] = useState("visible", true);

    return (
        <div key={properties.key} class="component">
            <h3 key="1">Condition Component</h3>
            {visible && <p key="2">This is not always visible</p>}
            <button key="3" $click={() => setVisible(!visible)}>Toggle Visibility</button>
        </div>
    );
}

function PropertyComponent({ properties, useState }) {
    return (
        <div key={properties.key} class="component">
            <h3 key="0">Property Component</h3>
            Was called with exampleProperty='{properties.exampleProperty}'
        </div>
    );
}

function MainComponent({ properties, useState }) {
    return (
        <div key={properties.key} class="component">
            <h3 key="1">Main Component</h3>

            <CalculatorComponent key="2" />
            <IncrementComponent key="3" />
            <CalculatorComponent key="4" />
            <ListComponent key="5" />
            <ConditionComponent key="6" />
            <PropertyComponent key="7" exampleProperty="foo" />
        </div>
    );
}

new Instance()
    .mount(
        document.getElementById("root-container"),
        <MainComponent key="root" />,
    );
