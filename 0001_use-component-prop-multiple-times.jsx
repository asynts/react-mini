// Do we create one instance of '<Foo />' and then render it twice, or
// are we creating a single instance?

function Foo(props) {
    return (
        <div>Foo</div>
    );
}

function Bar(props) {
    return (
        <div>
            {props.Component}
            {props.Component}
        </div>
    );
}

function Root(props) {
    return (
        <Bar Component={<Foo />} />
    );
}