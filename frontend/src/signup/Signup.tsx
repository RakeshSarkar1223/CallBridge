import React, { useState } from "react";
import landing from "../assets/Gemini_Generated_Image_xvqhgoxvqhgoxvqh.png";
import { Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [toggleSignup, setToggleSignup] = useState<boolean>(true);

  const { register, login } = useAuth();

  const handleChange = (e: { target: { value: string } }) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);

    if (value.length > 0 && value.length < 10) {
      setError("Phone number must be 10 digits");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (toggleSignup) {
        await register(name, email, phone, pass);
      } else {
        await login(email, pass);
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err);
      navigate('/signup')
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left Side */}
      <div className="relative h-screen overflow-hidden">
        <img
          src={landing}
          alt="landingPic"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Fade the right side */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-white"></div>
      </div>

      {/* Right Side */}
      <div className="bg-white py-10 px-15 font-mono flex justify-center">
        {toggleSignup ? (
          <div className="w-8/12">
            <h3 className="text-3xl font-semibold">Signup Now</h3>
            <p className="text-md py-3">
              Create your account and start connecting instantly.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div className="h-21">
                <label
                  htmlFor="number"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="number"
                  type="text"
                  value={phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className={`w-full h-12 px-4 rounded-lg border transition duration-200
        ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        }
        outline-none focus:ring-2`}
                />

                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              <div>
                <label
                  htmlFor="pass"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="pass"
                  type="password"
                  placeholder="Enter your password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  height: 48,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                fullWidth
              >
                Create Account
              </Button>
              <div className="text-center">
                <p>
                  Already have an account?
                  <button
                    onClick={() => setToggleSignup(!toggleSignup)}
                    className="mx-2 text-blue-600 font-semibold cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-8/12">
            <h3 className="text-3xl font-semibold">Login</h3>
            <p className="text-md py-3 pr-10">
              Welcome back! Sign in to continue where you left off.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="h-21">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}/>

              </div>

              <div>
                <label
                  htmlFor="pass"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="pass"
                  type="password"
                  placeholder="Enter your password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  height: 48,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                fullWidth
              >
                Login
              </Button>

              <div className="text-center">
                <p>
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => setToggleSignup(!toggleSignup)}
                    className="mx-2 text-blue-600 font-semibold cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
