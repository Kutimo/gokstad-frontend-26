import {useCounterStore} from "../stores/counterStore.ts";

export default function Home() {
    const { count, increment, decrement} = useCounterStore();

    return (
        <>
            <p>Home</p>
            <p>{count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </>
    );
}
