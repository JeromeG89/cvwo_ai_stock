import GetPrediction from "./GetPrediction";
import { useNavigate } from "react-router-dom"; 
function Logs(){
    const navigate = useNavigate();
    return <>
    <button
        onClick={() => navigate("/")} // Redirect to homepage
        style={{
        padding: "10px 20px",
        backgroundColor: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginBottom: "20px",
        }}
    >
        Back to Homepage
    </button>
    <GetPrediction/>
    </>
}
export default Logs;