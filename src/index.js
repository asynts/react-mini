import {
    Instance,
    TextNode,
    HtmlNode,
} from "./react-mini.js";

function CalculatorComponent({ updateNode }) {
    let state = {
        a: "",
        b: "",
    };

    function createNode() {
        function onChange(name) {
            return event => {
                state[name] = event.target.value;
                updateNode();
            };
        }

        /*
        <div key="root" #1>
            <input key="1" type="text" value={state.a} $change={onChange("a")} #2 />
            <input key="2" type="text" value={state.b} $change={onChange("b")} #3 />
            <p key="3" #4>
                <text #5>{parseInt(state.a) + parseInt(state.b)}</text>
            </p>
        </div>
        */
        let node_5 = new TextNode({
            text: (parseInt(state.a) + parseInt(state.b)).toString(),
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
            nextSibling: node_4,
            elementType: "input",
            properties: {
                key: "2",
                type: "text",
                value: state.b,
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
                value: state.a,
                $input: onChange("a"),
            },
            children: [],
        });
        let node_1 = new HtmlNode({
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

    return createNode;
}

function IncrementComponent({ updateNode }) {
    let pressCount = 0;

    function createNode() {
        /*
        <div key="root" #1>
            <p key="1" #2>
                <text #3>{pressCount}</text>
            </p>
            <button key="2" onClick={() => { pressCount += 1; updateNode(); }} #4>
                <text #5>Increment</text>
            </button>
        </div>
        */
        let node_5 = new TextNode({
            text: "Increment",
        })
        let node_4 = new HtmlNode({
            elementType: "button",
            properties: {
                key: "2",
                $click: () => {
                    pressCount += 1;
                    updateNode();
                },
            },
            children: [
                node_5,
            ],
        });
        let node_3 = new TextNode({
            text: pressCount.toString(),
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

    return createNode;
}

let component = CalculatorComponent({ updateNode: update });

let rootNode = new Instance().mount(
    document.getElementById("root"),
    component(),
);

function update() {
    let newRootNode = component();
    newRootNode.render({
        oldNode: rootNode,
        parentElement: null,
    });
    rootNode = newRootNode;
}
