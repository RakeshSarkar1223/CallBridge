import React, { useState , useEffect} from "react";
import logo from "./assets/Gemini_Generated_Image_mj10n9mj10n9mj102 (1).png";
import avater from "./assets/images.jpg";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { toast } from "react-toastify";
import { useAuth } from "./context/AuthContext";


function Navbar() {
  //   const name = "John Doe";
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const name = user?.name as string;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    }
    else {
        setIsLoggedIn(false)
    }
  }, [user]);
  const handleProfile = () => {
    console.log("profile clicked");
    toast.success("Profile clicked");
    navigate("/profile");
  };

  const handleHistory = () => {
    console.log("history");
    navigate("/history");
  };

  const handleLogout =async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-19 grid grid-cols-[40%_60%] bg-amber-400 shadow-lg shadow-amber-300/40 px-2">
      <div className="flex items-center pl-30 py-2">
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto object-contain drop-shadow-lg"
          />
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="flex justify-end px-25 items-center">
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <>
                <Button
                  {...bindTrigger(popupState)}
                  className="rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                >
                  <Avatar
                    alt="Remy Sharp"
                    src={avater}
                    sx={{
                      width: 50,
                      height: 50,
                      border: "2px solid white",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    }}
                  />

                  <h4 className="pl-5 text-xl font-semibold text-gray-800 drop-shadow-sm">
                    {name ? name.toUpperCase() : "GUEST"}
                  </h4>
                </Button>

                <Menu
                  {...bindMenu(popupState)}
                  slotProps={{
                    paper: {
                      elevation: 12,
                      sx: {
                        mt: 1,
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                      },
                    },
                  }}
                >
                  <MenuItem
                    className="transition-all duration-200 hover:bg-amber-100 hover:pl-6"
                    onClick={() => {
                      popupState.close();
                      handleProfile();
                    }}
                  >
                    Go to Profile
                  </MenuItem>

                  <MenuItem
                    className="transition-all duration-200 hover:bg-amber-100 hover:pl-6"
                    onClick={() => {
                      popupState.close();
                      handleHistory();
                    }}
                  >
                    Meeting History
                  </MenuItem>

                  <MenuItem
                    className="transition-all duration-200 hover:bg-red-100 hover:pl-6 text-red-600"
                    onClick={() => {
                      popupState.close();
                      handleLogout();
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </PopupState>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Navbar;
