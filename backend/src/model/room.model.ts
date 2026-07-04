import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },

    roomName: {
        type: String,
        required: true,
    },

    createdBy: {
        type: String, // PostgreSQL user ID
        required: true,
    },

    participants: [{
        type: String // PostgreSQL user IDs
    }]
}, {
    timestamps: true
});

roomSchema.index({createdBy:1})

export default mongoose.model("Room", roomSchema);