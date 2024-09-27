import React, { useState, useEffect } from "react";
import "../App.css";
import videoFile from "../assets/video.mp4";
import logo from "../assets/logo-color.png";
import { FaUserShield } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoPersonOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/100");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const avatarOptions = [
    "https://i.pravatar.cc/100?img=1",
    "https://i.pravatar.cc/100?img=2",
    "https://i.pravatar.cc/100?img=3",
    "https://i.pravatar.cc/100?img=4",
    "https://i.pravatar.cc/100?img=5",
    "https://i.pravatar.cc/100?img=6",
    "https://i.pravatar.cc/100?img=7",
    "https://i.pravatar.cc/100?img=8",
    "https://i.pravatar.cc/100?img=9",
    "https://i.pravatar.cc/100?img=10",
  ];

  // Hämta CSRF-token vid komponentens första rendering
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf", { method: "PATCH" });
        if (!response.ok) {
          throw new Error("Kunde inte hämta CSRF-token");
        }
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Fel vid hämtning av CSRF-token:", error);
        setError("Kunde inte hämta CSRF-token");
      }
    };
    fetchCsrfToken();
  }, []);

  // Hantera registrering
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !email.trim()) {
      setError("Användarnamn, lösenord och e-post krävs");
      return;
    }

    const payload = {
      username,
      password,
      email,
      avatar,
      csrfToken,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const data = await response.json();
        setError(data.error || "Registrering misslyckades");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes("exists")) {
          throw new Error("Användarnamn eller e-post finns redan.");
        } else {
          throw new Error("Registrering misslyckades");
        }
      }

      // Spara användardata i localStorage
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("avatar", avatar);

      // Om registreringen lyckas, skicka användaren till inloggningssidan
      navigate("/login", { state: { message: "Registrering lyckades" } });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="registerPage flex">
      <div className="container flex">
        <div className="videoDiv">
          <video src={videoFile} autoPlay muted loop></video>

          <div className="textDiv">
            <p className="title">Connect, converse, create</p>
          </div>

          <div className="footerDiv flex">
            <span className="text">Har du redan ett konto?</span>
            <Link to="/">
              <button className="btn">Logga in</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logotyp" />
            <h3>Kom igång!</h3>
          </div>

          <form onSubmit={handleRegister} className="form grid">
            {error && <span className="showMessage">{error}</span>}

            <div className="inputDiv">
              <label htmlFor="username">Användarnamn</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Ange användarnamn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Lösenord</label>
              <div className="input flex">
                <RiLockPasswordFill className="icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Ange lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="email">E-post</label>
              <div className="input flex">
                <input
                  type="email"
                  id="email"
                  placeholder="Ange e-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Avatar Section */}
            <div className="avatar-container">
              <div className="select-avatar-container">
                <label className="select-avatar" htmlFor="avatar">
                  Välj en Avatar
                </label>
                <select
                  onChange={(e) => setAvatar(e.target.value)}
                  value={avatar}
                >
                  <option value="">Välj en Avatar</option>
                  {avatarOptions.map((avatarUrl, index) => (
                    <option key={index} value={avatarUrl}>
                      Avatar {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="avatar-preview">
                <h5>Vald Avatar:</h5>
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Selected Avatar"
                    className="avatar-img"
                  />
                ) : (
                  <p style={{ color: "red" }}>Ingen avatar vald ännu.</p>
                )}
              </div>
            </div>

            <button type="submit" className="btn flex">
              <span>Registrera</span>
              <IoPersonOutline className="icon" />
            </button>

            <span className="forgotPassword">
              Glömt ditt lösenord? <a href="">Klicka här</a>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

