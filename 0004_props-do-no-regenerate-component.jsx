/*
It appears that if 'props' is changed, the component is not re-initialized.
In other words, the state remains persistent.
*/

import { useState } from "react";

function Counter(props) {
    let [counter, setCounter] = useState(props.initialValue);

    function onClick(event) {
        setCounter(counter + 1);
    }

    return (
        <div>
            <span>Counter: {counter}</span>
            <button onClick={onClick}>Increment</button>
        </div>
    );
}

function App() {
    let [toggle, setToggle] = useState(false);

    function onClick(event) {
        setToggle(!toggle);
    }

    return (
        <div>
            <Counter initialValue={toggle ? 3 : 5} />
            {toggle && <p>Toggle!</p>}
            <button onClick={onClick}>Toggle</button>
        </div>
    )
}

export default App;
