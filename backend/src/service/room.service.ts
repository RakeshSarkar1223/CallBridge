import Room from '../model/room.model.ts'

export const allRooms = async (email : string) => {
    const rooms = await Room.find({ participants: email });
    // console.log(rooms)
    return rooms;
} 

export const getRoom = async (roomId: string) => {
  try {
    const room = await Room.findOne({roomId});
    // console.log(room);
    return room;
  } catch (error) {
    console.error("Error fetching room:", error);
    throw error; // Or return null depending on your app's needs
  }
}
