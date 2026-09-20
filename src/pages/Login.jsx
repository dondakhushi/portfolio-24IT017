import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      setLoading(true);

      if (isRegister) {
        await registerUser(email, password);

        setMessage("Registration successful. You can now login.");
        setIsRegister(false);
        setPassword("");
      } else {
        await loginUser(email, password);

        navigate("/Tasks");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-container">
      <h1>{isRegister ? "Create Account" : "Login"}</h1>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
            ? "Register"
            : "Login"}
        </button>
      </form>

      {error && <div className="task-error">{error}</div>}

      {message && (
        <div className="task-success">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setIsRegister(!isRegister);
          setError("");
          setMessage("");
        }}
      >
        {isRegister
          ? "Already have an account? Login"
          : "Create a new account"}
      </button>
    </div>
  );
}

export default Login;