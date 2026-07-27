"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Send, Share2, Users } from "lucide-react";

type AuthSwitchProps = {
  initialMode?: "login" | "signup";
};

export default function AuthSwitch({ initialMode = "login" }: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState<"login" | "signup" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for feedback messages (e.g., from auth callback)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      const urlMessage = params.get("message");

      if (urlError) {
        setErrorMessage(decodeURIComponent(urlError));
      } else if (urlMessage) {
        setSuccessMessage(decodeURIComponent(urlMessage));
      }
    }
  }, []);

  useEffect(() => {
    const container = document.querySelector(".auth-switch-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");

    // Clear alert states on mode change
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isSignUp]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading("login");

    try {
      const response = await fetch("/api/teacher-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password: loginPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.error ?? "Unable to sign in. Please check your credentials.");
        return;
      }

      window.location.replace("/teacher/dashboard");
    } catch {
      setErrorMessage("Network error: Teacher auth request failed. Please check your connection.");
    } finally {
      setLoading(null);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = signupEmail.trim();
    const name = signupName.trim();

    if (!email || !signupPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading("signup");

    try {
      const response = await fetch("/api/teacher-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email,
          password: signupPassword,
          name,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        authenticated?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.error ?? "Unable to create account.");
        return;
      }

      if (payload.authenticated) {
        window.location.replace("/teacher/dashboard");
        return;
      }

      setSuccessMessage(
        payload.message ??
          "Account created successfully! Please check your email to confirm your account."
      );
      setIsSignUp(false);
      setLoginEmail(email);
    } catch {
      setErrorMessage("Network error: Teacher auth request failed. Please check your connection.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <style>{`
        .auth-switch-root {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-switch-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          min-height: 580px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .auth-switch-forms {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .alert-box {
          max-width: 380px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          box-sizing: border-box;
        }

        .alert-box.error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .alert-box.success {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 8px 0;
          height: 52px;
          border-radius: 52px;
          display: flex;
          align-items: center;
          padding: 0 0.8rem;
          position: relative;
          transition: 0.3s;
          box-sizing: border-box;
        }

        .input-field:focus-within {
          background-color: #e8e8e8;
          box-shadow: 0 0 0 2px #667eea;
        }

        .input-field i {
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.95rem;
          color: #333;
          width: 100%;
        }

        .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
        }

        .toggle-password-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-password-btn:hover {
          color: #333;
        }

        .btn {
          width: 150px;
          background-color: #667eea;
          border: none;
          outline: none;
          height: 46px;
          border-radius: 46px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 12px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.85rem;
        }

        .btn:hover {
          background-color: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
        }

        .btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .btn.transparent:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-switch-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-switch-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-switch-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-switch-container.sign-up-mode .sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-switch-container.sign-up-mode .sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-switch-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-switch-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-switch-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .social-text {
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .social-icon {
          height: 42px;
          width: 42px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 50%;
          color: #667eea;
          font-size: 1.1rem;
          transition: 0.3s;
          cursor: pointer;
          background: #fff;
        }

        .social-icon:hover {
          border-color: #764ba2;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 870px) {
          .auth-switch-container {
            min-height: 800px;
            height: 100vh;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-switch-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .btn.transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
          }
          .auth-switch-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-switch-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-switch-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-switch-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-switch-container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className="auth-switch-root">
        <div className="auth-switch-container">
          <div className="auth-switch-forms">
            <div className="signin-signup">
              {/* Sign In Form */}
              <form className="auth-form sign-in-form" onSubmit={handleLogin}>
                <h2 className="title">Sign in</h2>

                {errorMessage && !isSignUp && (
                  <div className="alert-box error" role="alert">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && !isSignUp && (
                  <div className="alert-box success" role="status">
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="input-field">
                  <i>
                    <Users size={17} />
                  </i>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="input-field">
                  <i>
                    <CheckCircle2 size={17} />
                  </i>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <input
                  type="submit"
                  value={loading === "login" ? "Logging in..." : "Login"}
                  className="btn solid"
                  disabled={loading !== null}
                />
                <p className="social-text">Or sign in with social platforms</p>
                <div className="social-media">
                  <SocialIcons />
                </div>
              </form>

              {/* Sign Up Form */}
              <form className="auth-form sign-up-form" onSubmit={handleSignup}>
                <h2 className="title">Sign up</h2>

                {errorMessage && isSignUp && (
                  <div className="alert-box error" role="alert">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="input-field">
                  <i>
                    <Users size={17} />
                  </i>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="input-field">
                  <i>
                    <Share2 size={17} />
                  </i>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="input-field">
                  <i>
                    <Send size={17} />
                  </i>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password (min. 6 characters)"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <input
                  type="submit"
                  value={loading === "signup" ? "Signing up..." : "Sign up"}
                  className="btn"
                  disabled={loading !== null}
                />
                <p className="social-text">Or sign up with social platforms</p>
                <div className="social-media">
                  <SocialIcons />
                </div>
              </form>
            </div>
          </div>

          <div className="panels-container">
            <div className="panel left-panel">
              <div className="content">
                <h3>New here?</h3>
                <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
                <button type="button" className="btn transparent" onClick={() => setIsSignUp(true)}>
                  Sign up
                </button>
              </div>
            </div>

            <div className="panel right-panel">
              <div className="content">
                <h3>One of us?</h3>
                <p>Welcome back! Sign in to continue your journey with us.</p>
                <button type="button" className="btn transparent" onClick={() => setIsSignUp(false)}>
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SocialIcons() {
  return (
    <>
      <button type="button" className="social-icon" aria-label="Community">
        <Users size={18} />
      </button>
      <button type="button" className="social-icon" aria-label="Share">
        <Share2 size={18} />
      </button>
      <button type="button" className="social-icon" aria-label="Send">
        <Send size={18} />
      </button>
      <button type="button" className="social-icon" aria-label="Verified">
        <CheckCircle2 size={18} />
      </button>
    </>
  );
}