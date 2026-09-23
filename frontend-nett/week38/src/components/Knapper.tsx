import { useCounterStore } from "../store/useCounterStore.ts";

export default function Knapper() {
  const increase = useCounterStore((state) => state.increment);
  const decrease = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div className="">
      <button onClick={increase}>+1</button>
      <button onClick={decrease}>-1</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}
