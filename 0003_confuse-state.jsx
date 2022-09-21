// The following is a relatively simple example that demonstrates how the heuristic that
// React uses is sometimes wrong.
//
// If the Toggle button is hidden, this should hide the second component.
// However, React never sees this condition since it is not part of the return value.
//
// From the perspective of React there were two 'Counter' objects and then there is one.
// It simply guesses that the first one it encounters is the first one from the previous render.
// In this case this is wrong and thus the second counter disappears even though the first one was hidden.
//
// Actually, I was wrong about this, it it is not rendered the value will be 'false' and React sees that in the return value.
// However, the fundamental issue exists anc can be reproduced with 'App2'.

const { useState } = require("react");

function Counter(props) {
    let [counter, setCounter] = useState(0);

    function onClick(event) {
        setCounter(counter + 1);
    }

    return (
        <div>
            <p>Counter: {counter}</p>
            <button onClick={onClick}>Increment</button>
        </div>
    );
}

function App(props) {
    let [enabled, setEnabled] = useState(true);

    function onClick(event) {
        setEnabled(!enabled);
    }

    return (
        <div>
            {enabled && <Counter />}
            <Counter />
            <button onClick={onClick}>Toggle</button>
        </div>
    );
}

function App2(props) {
    let [enabled, setEnabled] = useState(true);

    function onClick(event) {
        setEnabled(!enabled);
    }

    if (enabled) {
        return (
            <div>
                <Counter />
                <Counter />
                <button onClick={onClick}>Toggle</button>
            </div>
        );
    } else {
        return (
            <div>
                <Counter />
                <button onClick={onClick}>Toggle</button>
            </div>
        );
    }
}

export default App;
