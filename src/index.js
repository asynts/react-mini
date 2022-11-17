import {
    Instance,
    TextNode,
    HtmlNode,
    ComponentNode,
} from "./react-mini.js";

function IncrementComponent({ useState }) {
    let [counter, setCounter] = useState("counter", 0);

    /*
    <div #1 key="root" class="component">
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
            class: "component",
        },
        children: [
            node_2,
            node_4,
        ],
    });

    return node_1;
}

function CalculatorComponent({ useState }) {
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

function ListComponent({ useState }) {
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

    function createInnerNode(index) {
        if (index >= items.length) {
            return [];
        }
        let item = items[index];

        // Recursively construct the following nodes.
        // We need to construct them first to be able to set 'nextSibling'.
        let followingItemNodes = createInnerNode(index + 1);

        let nextSibling;
        if (followingItemNodes.length >= 1) {
            nextSibling = followingItemNodes[0];
        } else {
            nextSibling = null;
        }

        /*
        <div #1 key={item}>
            <text #2>{item}</text>
            <button #3 key="2" $click={() => removeItem(index)}>
                <text #4>X</text>
            </button>
        </div>
        */
        let node_4 = new TextNode({
            nextSibling: null,
            text: "X",
        });
        let node_3 = new HtmlNode({
            nextSibling: null,
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
            nextSibling: node_3,
            text: item,
        });
        let node_1 = new HtmlNode({
            nextSibling: nextSibling,

            elementType: "div",
            properties: {
                key: item,
            },
            children: [
                node_2,
                node_3,
            ],
        });

        return [node_1, ...followingItemNodes];
    }

    /*
    <div #1 key="root" class="component">
        <div #2 key="1">
            {...createInnerNode(0)}
        </div>

        <button #3 key="2" $click={() => appendNewItem()}>
            <text #4>Append New</text>
        </button>
    </div>
    */
    let node_4 = new TextNode({
        nextSibling: null,
        text: "Append New",
    });
    let node_3 = new HtmlNode({
        nextSibling: null,
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
        nextSibling: node_3,
        elementType: "div",
        properties: {
            key: "1",
        },
        children: [
            ...createInnerNode(0),
        ],
    });
    let node_1 = new HtmlNode({
        nextSibling: null,
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

    console.log(items, node_2);

    return node_1;
}

function MainComponent({ useState }) {
    /*
    <div #1 key="root" class="component">
        <CalculatorComponent #2 key="1" />
        <IncrementComponent #3 key="2" />
        <CalculatorComponent #4 key="3" />
        <ListComponent #4 key="4" />
    </div>
    */

    let node_5 = new ComponentNode({
        nextSibling: null,
        componentFunction: ListComponent,
        properties: {
            key: "3",
        },
    });
    let node_4 = new ComponentNode({
        nextSibling: node_5,
        componentFunction: CalculatorComponent,
        properties: {
            key: "3",
        },
    });
    let node_3 = new ComponentNode({
        nextSibling: node_4,
        componentFunction: IncrementComponent,
        properties: {
            key: "2",
        },
    });
    let node_2 = new ComponentNode({
        nextSibling: node_3,
        componentFunction: CalculatorComponent,
        properties: {
            key: "1",
        },
    });
    let node_1 = new HtmlNode({
        nextSibling: null,
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
        ],
    });

    return node_1;
}

let component = new ComponentNode({
    nextSibling: null,
    componentFunction: MainComponent,
    properties: {
        key: "root",
    },
});

new Instance()
    .mount(
        document.getElementById("root"),
        component,
    );
