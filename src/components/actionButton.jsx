import { Link } from "react-router-dom";
import "./actionButton.css";

function ActionButton({ text, icon, onClick, variant }) {
  return (
    <button className={`btn ${variant}`} onClick={onClick}>
      {text}
      {icon}
    </button>
  );
}

export default ActionButton;
