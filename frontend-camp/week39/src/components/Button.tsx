import { useCounterStore } from "../store/counterStore.ts";

export default function Button() {
  const increment = useCounterStore((state) => state.increment);
  const decrease = useCounterStore((state) => state.decrement);

  return (
    <div className="">
      <button onClick={increment}>+1</button>
      <button onClick={decrease}>-1</button>
    </div>
  );
}
