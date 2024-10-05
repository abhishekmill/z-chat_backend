import conversationModel from "../models/conversation.model.js";
import { Message } from "../models/message.models.js";
import { getReciverSocketId } from "../socket/socket.js";

const sendmessage = async (req, res) => {
  try {
    const senderId = req.id;
    const reciverId = req.params.id;
    const { message } = req.body;
    let gotconvarsation = await conversationModel.findOne({
      participants: { $all: [senderId, reciverId] },
    });

    if (!gotconvarsation) {
      gotconvarsation = await conversationModel.create({
        participants: [senderId, reciverId],
      });
    }
    const newMessage = await Message.create({
      senderId,
      reciverId,
      message,
    });
    if (newMessage) {
      gotconvarsation.messages.push(newMessage._id);
    }
    await Promise.all([gotconvarsation.save(), newMessage.save()]);

    // Socket.io

    const reciverSocketId = getReciverSocketId(reciverId);
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json(conversationModel?.messages);
  } catch (error) {
    console.log(error);
  }
};

const reciveMessage = async (req, res) => {
  try {
    const reciverId = req.params.id;
    const senderId = req.id;
    const conversation = await conversationModel
      .findOne({
        participants: { $all: [senderId, reciverId] },
      })
      .populate("messages");
    res.status(200).json(conversation?.messages);
  } catch (error) {
    console.log(error);
  }
};

export { sendmessage, reciveMessage };
