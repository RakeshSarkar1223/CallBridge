import React from "react";
import landing from "../assets/Gemini_Generated_Image_xvqhgoxvqhgoxvqh.png";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    const handleSingup = () => {
        navigate("/signup")
    }

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
      <div className="bg-white py-25 px-15 font-mono">
        <h1 className="text-5xl font-semibold py-5">Your Bridge to Better Conversations...</h1>
        <p className="text-2xl">Create, join, and manage meetings effortlessly with a smooth and secure experience.</p>
        <div className="py-8 px-5">
            <Button variant="contained" onClick={() => {handleSingup()}}>Signup now <span className="pl-1"><i className="fa-solid fa-arrow-right"></i></span></Button>
        </div>
      </div>
    </div>
  );
}

export default Landing;