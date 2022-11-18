import { mount, ComponentNode, HtmlNode, TextNode } from "./react-mini.js";

function IncrementComponent({ properties, useState }) {
    let [counter, setCounter] = useState(0);

    return (
        <div key={properties.key} class="component">
            <h3 key="1">Increment Component</h3>
            <p key="2">{counter.toString()}</p>
            <button key="3" $click={() => setCounter(counter + 1)}>Increment</button>
        </div>
    );
}

function CalculatorComponent({ properties, useState }) {
    let [inputState, setInputState] = useState({
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

    return (
        <div key={properties.key} class="component">
            <h3 key="1">Calculator Component</h3>
            <input key="2" type="text" value={inputState.a} $input={onChange("a")} />
            <input key="3" type="text" value={inputState.b} $input={onChange("b")} />
            <p key="4">{(parseInt(inputState.a) + parseInt(inputState.b)).toString()}</p>
        </div>
    );
}

function ListComponent({ properties, useState }) {
    let [items, setItems] = useState([]);

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
            <h3 key="1">List Component</h3>
            <div key="2">
                {items.map((item, index) => (
                    <div key={item}>
                        {item}
                        <button key="1" $click={() => removeItem(index)}>X</button>
                    </div>
                ))}
            </div>
            <button key="3" $click={() => appendNewItem()}>Append New</button>
        </div>
    );
}

function ConditionComponent({ properties, useState }) {
    let [visible, setVisible] = useState(true);

    return (
        <div key={properties.key} class="component">
            <h3 key="1">Condition Component</h3>
            This is always visible.
            {visible && " This is not always visible."}
            <button key="2" $click={() => setVisible(!visible)}>Toggle Visibility</button>
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

function MultipleStateComponent({ properties, useState }) {
    let [a, setA] = useState(0);
    let [b, setB] = useState(1);

    return (
        <div key={properties.key} class="component">
            <h3 key="1">Multiple State Component</h3>
            <p key="2">{a.toString()}</p>
            <p key="3">{b.toString()}</p>
            <button key="4" $click={() => setA(b)}>Set A=B</button>
            <button key="5" $click={() => setB(b + 1)}>Set B=B+1</button>
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
            <MultipleStateComponent key="8" />
        </div>
    );
}

mount(
    document.getElementById("root-container"),
    <MainComponent key="root" />,
);
