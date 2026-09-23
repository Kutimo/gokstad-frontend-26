import {useCounterStore} from "../store/useCounterStore.ts";

export default function Visning() {
  const count = useCounterStore((state) => state.count);

  return <p>{count}</p>;
}
