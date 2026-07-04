import mongoose, { Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    roomId: {
      type: Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    sender: {
      type: String,
      required: true,
    },

    msg: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;