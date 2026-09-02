import { useEffect, useState } from "react";

export default function Counter() {
    const [count, setCount] = useState(1);

    useEffect(() => {
        document.title = `Count: ${count}`;
    }, []);

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>+1</button>
        </div>
    );
}