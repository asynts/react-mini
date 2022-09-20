// We need to defer the evaluation of sub-components.
// If they are rendered conditionally or in a loop, we can't know that until
// the function returns.
//
// In other words, the 'React.createElement' function must not call the actual component, that
// must happen later.

function Foo(props) {
    return (
        <div>Foo</div>
    );
}

function Example_1(props) {
    let [isVisible, setIsVisible] = useState(true);

    // At this point, we can't evaluate 'Foo(props)' because we don't know if it will be rendered or not.
    let x = <Foo />

    return (
        <div>
            {isVisible && x}
        </div>
    );
}

function Example_2(props) {
    // At this point, we can't evaluate 'Foo(props)' because it needs to run multiple times with different values of hooks.
    let x = <Foo />;

    return (
        <div>
            {x}
            {x}
        </div>
    );
}
