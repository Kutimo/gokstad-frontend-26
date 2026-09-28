import { useNavigate} from "react-router";

interface ButtonProps {
    buttonName: string;
    link: string;
}

export default function Button({buttonName, link}: ButtonProps) {
    const navigate = useNavigate()

    return (
        <button onClick={()=> navigate(link)}>
            {buttonName}
        </button>
    );
}