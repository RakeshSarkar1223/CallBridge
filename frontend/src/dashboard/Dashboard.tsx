import React from "react";
import { Button } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/Gemini_Generated_Image_xvqhgoxvqhgoxvqh.png";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";


function Dashboard() {
  const navigate = useNavigate();
    const user = useAuth();
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Optional Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Your Content */}
      <div className="relative z-10 min-h-screen flex justify-center items-center">
        <div className="flex items-center gap-30">
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <>
                <React.Fragment>
                  <Button
                    variant="contained"
                    size="large"
                    {...bindTrigger(popupState)}
                  >
                    Meeting
                  </Button>
                  <Menu {...bindMenu(popupState)} disableScrollLock>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        navigate("/host");
                      }}
                    >
                      Host a Meeting
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        navigate("/join");
                      }}
                    >
                      Join a Meeting
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              </>
            )}
          </PopupState>
          <Button variant="contained" size="large">
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
