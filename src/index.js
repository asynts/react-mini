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
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
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
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
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

    function createInnerNode(item, index) {
        /*
        <div #1 key={item}>
            <text #2 key="1">{item}</text>
            <button #3 key="2" $click={() => removeItem(index)}>
                <text #4 key="1">X</text>
            </button>
        </div>
        */
        let node_4 = new TextNode({
            text: "X",
            properties: {
                key: "1",
            },
        });
        let node_3 = new HtmlNode({
            elementType: "button",
            properties: {
                key: "2",
                $click: () => removeItem(index),
            },
            children: [
                node_4,
            ],
        });
        let node_2 = new TextNode({
            text: item,
            properties: {
                key: "1",
            },
        });
        let node_1 = new HtmlNode({
            elementType: "div",
            properties: {
                key: item,
            },
            children: [
                node_2,
                node_3,
            ],
        });

        return node_1;
    }

    /*
    <div #1 key="root" class="component">
        <div #2 key="1">
            {...createInnerNode(0)}
        </div>

        <button #3 key="2" $click={() => appendNewItem()}>
            <text #4 key="1">Append New</text>
        </button>
    </div>
    */
    let node_4 = new TextNode({
        text: "Append New",
        properties: {
            key: "1",
        },
    });
    let node_3 = new HtmlNode({
        elementType: "button",
        properties: {
            key: "2",
            $click: () => appendNewItem(),
        },
        children: [
            node_4,
        ],
    });
    let node_2 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "1",
        },
        children: [
            ...items.map(createInnerNode),
        ],
    });
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            node_2,
            node_3,
        ],
    });

    return node_1;
}

function ConditionComponent({ properties, useState }) {
    let [visible, setVisible] = useState("visible", true);

    /*
    <div #1 key="root" class="component">
        {visible &&
            <p #2 key="1">
                <text #3 key="1">This is not always visible!</text>
            </p>}
        <button #4 key="2" $click={() => setVisible(!visible)}>
            <text #5 key="1">Toggle Visibility</text>
        </button>
    </div>
    */
    let node_5 = new TextNode({
        text: "Toggle Visiblity",
        properties: {
            key: "1",
        },
    });
    let node_4 = new HtmlNode({
        elementType: "button",
        properties: {
            key: "2",
            $click: () => setVisible(!visible),
        },
        children: [
            node_5,
        ],
    });
    let node_3 = new TextNode({
        text: "This is not always visible",
        properties: {
            key: "1",
        },
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
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            ...(visible ? [node_2] : []),
            node_4,
        ],
    });

    console.log(node_1);
    return node_1;
}

function PropertyComponent({ properties, useState }) {
    /*
    <div #1 key="root" class="component">
        <text #2 key="1">Was called with exampleProperty='{properties.exampleProperty}'</text>
    </div>
    */

    let node_2 = new TextNode({
        text: `Was called with exampleProperty='${properties.exampleProperty}'`,
        properties: {
            key: "1",
        },
    });
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            node_2,
        ],
    });

    return node_1;
}

function MainComponent({ properties, useState }) {
    /*
    <div #1 key="root" class="component">
        <CalculatorComponent #2 key="1" />
        <IncrementComponent #3 key="2" />
        <CalculatorComponent #4 key="3" />
        <ListComponent #5 key="4" />
        <ConditionComponent #6 key="5" />
        <PropertyComponent #7 key="6" exampleProperty="foo" />
    </div>
    */

    let node_7 = new ComponentNode({
        componentFunction: PropertyComponent,
        properties: {
            key: "6",
            exampleProperty: "foo",
        },
    });
    let node_6 = new ComponentNode({
        componentFunction: ConditionComponent,
        properties: {
            key: "5",
        },
    });
    let node_5 = new ComponentNode({
        componentFunction: ListComponent,
        properties: {
            key: "4",
        },
    });
    let node_4 = new ComponentNode({
        componentFunction: CalculatorComponent,
        properties: {
            key: "3",
        },
    });
    let node_3 = new ComponentNode({
        componentFunction: IncrementComponent,
        properties: {
            key: "2",
        },
    });
    let node_2 = new ComponentNode({
        componentFunction: CalculatorComponent,
        properties: {
            key: "1",
        },
    });
    let node_1 = new HtmlNode({
        elementType: "div",
        properties: {
            key: "root",
            class: "component",
        },
        children: [
            node_2,
            node_3,
            node_4,
            node_5,
            node_6,
            node_7,
        ],
    });

    return node_1;
}

let component = new ComponentNode({
    componentFunction: MainComponent,
    properties: {
        key: "root",
    },
});

new Instance()
    .mount(
        document.getElementById("root-container"),
        component,
    );
