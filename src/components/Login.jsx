import React, { useState, useEffect } from 'react';
import "../App.css";
import videoFile from "../assets/video.mp4";
import logo from "../assets/logo-color.png";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  // Hämta CSRF-token 
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {


        const response = await fetch('https://chatify-api.up.railway.app/csrf', { method: 'PATCH' });
        if (!response.ok) {
          throw new Error('Kunde inte hämta CSRF-token');
        }
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Fel vid hämtning av CSRF-token:', error);
        setError('Kunde inte hämta CSRF-token');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = {
      username,
      password,
      csrfToken, // Skickar CSRF-token med payload
    };

    try {
      const response = await fetch('https://chatify-api.up.railway.app/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid credentials');
      }

      const data = await response.json();


      // Spara token och användardata
      localStorage.setItem('token', data.token);

      /*
        sebbe: finns dessa tillgängliga verkligen? du behöver decoda JWTn.
      */
      // localStorage.setItem('userId', data.userId);
      // localStorage.setItem('username', username);
      const decodedJwt = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('decodedToken', JSON.stringify(decodedJwt));

      navigate('/chat'); // Navigera till chatten efter inloggning
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="loginPage flex">
      <div className="container flex">
        <div className="videoDiv">
          <video src={videoFile} autoPlay muted loop></video>

          <div className="textDiv">
            <p className="title">Connect, converse, create</p>
          </div>

          <div className="footerDiv flex">
            <span className="text">Don't have an account?</span>
            <Link to="/register">
              <button className="btn">Sign up</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo image" />
            <h3>Välkommen tillbaka!</h3>
          </div>

          <form onSubmit={handleLogin} className="form grid">
            {error && <span className="showMessage">{error}</span>}

            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <FaUser className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Password</label>
              <div className="input flex">
                <RiLockPasswordFill className="icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn flex">
              <span>Login</span>
              <CiLogin className="icon" />
            </button>

            <span className="forgotPassword">
              Forgot your password? <a href="">Click Here</a>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;





