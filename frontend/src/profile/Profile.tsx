
import { Avatar } from "@mui/material";
import avater from "../assets/images.jpg";
import { useAuth } from "../context/AuthContext";
function Profile() {
  const {user} = useAuth();
  return (
    <div className="grid grid-cols-[40%_60%] mx-40">
      <div className="flex justify-center my-10 py-10">
        <Avatar
          alt="Remy Sharp"
          src={avater}
          sx={{
            width: 300,
            height: 300,
            border: "2px solid white",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          }}
        />
      </div>
      <div className="my-10 py-15 px-10 font-mono ">
          <h1 className="text-5xl font-semibold py-10">Name : {user?.name}</h1>
          <h4 className="text-3xl py-5">Email : {user?.email}</h4>
          <h4 className="text-3xl py-5">Phone : {user?.phone}</h4>
      </div>
    </div>
  );
}

export default Profile;
