import Button from "../components/common/Button.tsx";

export default function Home() {
    return (
        <main>
            <h1>Welcome </h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
               Asperiores eos facilis hic odio sunt, vel!</p>
            <Button link="/login" buttonName="login"/>
        </main>
    );
}