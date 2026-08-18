import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const Login = () => {
    localStorage.setItem("token", "demo-token");
    navigate("/profile");
  };
  return (
    <div className="center">
      <h1>Login</h1>
      <button onClick={Login}>Login</button>
    </div>
  );
}
export default Login;
