import {
    Instance,
    TextNode,
    HtmlNode,
} from "./react-mini.js";

let pressCount = 0;

function createNode() {
    /*
    <div key="root" #1>
        <p key="1" #2>
            <text #3>{pressCount}</text>
        </p>
        <button key="2" onClick={() => { pressCount += 1; update(); }} #4>
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
            $onClick: () => {
                pressCount += 1;
                update();
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

let rootNode = new Instance().mount(
    document.getElementById("root"),
    createNode()
);

function update() {
    let newRootNode = createNode();
    newRootNode.render({
        oldNode: rootNode,
        parentElement: null,
    });
    rootNode = newRootNode;
}
