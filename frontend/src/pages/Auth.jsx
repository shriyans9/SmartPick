import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import "../App.css";


function Auth() {

    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    function handleChange(event) {

        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            if (isLogin) {

                const result = await loginUser({
                    email: formData.email,
                    password: formData.password
                });

                localStorage.setItem(
                    "smartpick_token",
                    result.access_token
                );

                localStorage.setItem(
                    "smartpick_user",
                    JSON.stringify(result.user)
                );

                localStorage.setItem(
    "smartpick_token",
    result.access_token
);

localStorage.setItem(
    "smartpick_user",
    JSON.stringify(result.user)
);

navigate("/dashboard");

            } else {

                const result = await registerUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });

                setSuccess(
                    "Account created successfully. You can now sign in."
                );

                setIsLogin(true);

                setFormData({
                    name: "",
                    email: formData.email,
                    password: ""
                });
            }

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    }


    return (
        <div className="auth-page">

            <div className="auth-background-glow glow-one"></div>
            <div className="auth-background-glow glow-two"></div>


            <div className="auth-container">


                {/* LEFT SIDE */}

                <section className="auth-brand">

                    <div className="brand-logo">
                        <div className="brand-symbol">
                            S
                        </div>

                        <span>
                            SmartPick
                        </span>
                    </div>


                    <div className="brand-content">

                        <span className="eyebrow">
                            SMARTER PRODUCT DECISIONS
                        </span>

                        <h1>
                            Don't just find a product.
                            <span>
                                Find the right one.
                            </span>
                        </h1>

                        <p>
                            SmartPick helps you discover,
                            compare and understand products
                            before you make a buying decision.
                        </p>

                    </div>


                    <div className="brand-features">

                        <div>
                            <strong>Compare</strong>
                            <span>
                                Look beyond price.
                            </span>
                        </div>

                        <div>
                            <strong>Understand</strong>
                            <span>
                                See the important differences.
                            </span>
                        </div>

                        <div>
                            <strong>Decide</strong>
                            <span>
                                Choose based on your needs.
                            </span>
                        </div>

                    </div>

                </section>


                {/* RIGHT SIDE */}

                <section className="auth-card">

                    <div className="auth-card-header">

                        <span className="mobile-logo">
                            SmartPick
                        </span>

                        <h2>
                            {isLogin
                                ? "Welcome back"
                                : "Create your account"}
                        </h2>

                        <p>
                            {isLogin
                                ? "Sign in to continue your SmartPick journey."
                                : "Start making smarter product decisions."}
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        {!isLogin && (

                            <div className="input-group">

                                <label>
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        )}


                        <div className="input-group">

                            <label>
                                Email address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="input-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="8"
                                required
                            />

                        </div>


                        {error && (
                            <div className="auth-message error">
                                {error}
                            </div>
                        )}


                        {success && (
                            <div className="auth-message success">
                                {success}
                            </div>
                        )}


                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Please wait..."
                                : isLogin
                                    ? "Sign in to SmartPick"
                                    : "Create SmartPick account"}

                        </button>

                    </form>


                    <div className="auth-divider">
                        <span>OR</span>
                    </div>


                    <div className="auth-switch">

                        <span>
                            {isLogin
                                ? "Don't have a SmartPick account?"
                                : "Already have a SmartPick account?"}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                setSuccess("");
                            }}
                        >
                            {isLogin
                                ? "Create account"
                                : "Sign in"}
                        </button>

                    </div>


                    <div className="auth-security">
                        🔒 Your password is securely protected.
                    </div>

                </section>

            </div>

        </div>
    );
}


export default Auth;