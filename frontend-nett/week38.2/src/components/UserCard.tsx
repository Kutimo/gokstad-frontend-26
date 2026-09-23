interface UserCard {
    name: string;
    age: number;
}

export default function UserCard({name, age}:UserCard) {
    return (
        <>
            <p>{name}</p>
            <p>{age}</p>
        </>
    )
}