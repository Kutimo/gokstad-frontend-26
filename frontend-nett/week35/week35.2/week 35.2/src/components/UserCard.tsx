interface Users {
    id: number;
    userName: string;
    age: number
}

const users: Users[] = [
    {id: 1, userName: "Oliver", age: 30},
    {id: 2, userName: "Ola", age: 36},
    {id: 3, userName: "Vegar", age: 30}
]


export default function UserCards() {
    return (
        <ul>
            {users.map((user) => (
                <li key={user.id}>
                    {user.userName} ({user.age})
                </li>
            ))}
        </ul>
    )
}