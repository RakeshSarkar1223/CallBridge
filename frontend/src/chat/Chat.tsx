import SideBar from "./SideBar";
import Message from "./Message";
import { useState } from "react";

function Chat() {
  const [openedRoom, setOpenedRoom] = useState<string>("");
  return (
    <div className="mx-20 py-15">
      <div className="grid grid-cols-[35%_65%] gap-6 h-[80vh]">
        <SideBar openedRoom={openedRoom} setOpenedRoom={setOpenedRoom} />
        <Message openedRoom={openedRoom}/>
      </div>
    </div>
  );
}

export default Chat;