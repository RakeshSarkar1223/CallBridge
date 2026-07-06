import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen flex w-full justify-center items-center">
      <div>
        <h2 className="text-3xl text-gray-400 py-10">404 Page Not Found</h2>
        <Button
              variant="contained"
              onClick={() => {
                navigate("/");
              }}
            >
              Landing Page{" "}
              <span className="pl-1">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </Button>
      </div>
    </div>
  )
}

export default NotFound
