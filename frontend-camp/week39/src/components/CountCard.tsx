import {useCounterStore} from "../store/counterStore.ts";

export default function CountCard() {
    const count = useCounterStore((state) => state.count);

    return (
        <p>
            {count}
        </p>
    );
}