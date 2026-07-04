import Message from "../model/message.model.ts";
import Room from "../model/room.model.ts";

export const getMessages = async (roomId: string) => {
  const room = await Room.findOne({
    roomId,
  });

  if (!room) {
    return null;
  }

  const messages = await Message.find({
    roomId: room._id,
  })
    .sort({
      createdAt: 1,
    })
    .limit(50)
    .lean();

  return messages;
};