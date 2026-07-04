import React from "react";
import Navbar from "./Navbar";
import { Routes, Route } from "react-router-dom";
import Profile from "./profile/Profile";
import Landing from "./landing/Landing";
import Dashboard from "./dashboard/Dashboard";
import History from "./history/History";
import Signup from "./signup/Signup";
import Chat from "./chat/Chat";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-19">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
