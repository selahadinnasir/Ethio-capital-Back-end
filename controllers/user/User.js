import User from "../../models/User.js";
import UserProfile from "../../models/UserProfile.js";
import fs from "fs";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
export const getUsers = async (req, res) => {
  try {
    console.log("the dispatch is working");

    // const { userId } = req.user;
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving users." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the user." });
  }
};

export const getUserByChat = async (req, res) => {
  try {
    const { userId } = req.user; // Get the current user's ID from authentication
    console.log("userID:", userId);

    // Fetch all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).lean();

    if (!conversations.length) {
      return res.status(200).json([]); // No conversations found
    }
    console.log("Conversations found:", conversations);

    // Get conversation IDs
    const conversationIds = conversations.map((c) => c._id);
    console.log("Conversation IDs:", conversationIds);
    // Find messages in those conversations
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
    }).lean(); // Use .lean() for performance

    if (!messages.length) {
      return res.status(200).json([]); // No messages, return empty list
    }
    console.log("Messages found:", messages);

    // Get unique user IDs who have messages
    const usersWithMessages = [
      ...new Set(
        messages
          .map((msg) => {
            const conversation = conversations.find(
              (c) => c._id.toString() === msg.conversationId.toString()
            );

            if (!conversation) return null;

            // Find the other participant in the conversation
            const otherParticipant = conversation.participants.find(
              (id) => id.toString() !== userId
            );

            return otherParticipant ? otherParticipant.toString() : null;
          })
          .filter(Boolean) // Remove null values
      ),
    ];

    // console.log("Users with messages:", usersWithMessages);
    // Verify messages exist between userId and each user in usersWithMessages
    const verifiedUsers = [];

    for (const otherUserId of usersWithMessages) {
      const userMessages = await Message.find({
        conversationId: {
          $in: conversations.map((c) => c._id),
        },
        sender: { $in: [userId, otherUserId] }, // Either one is the sender
      });

      if (userMessages.length > 0) {
        verifiedUsers.push(otherUserId); // Only keep users with actual messages
      }
    }

    // console.log("Verified users with messages:", verifiedUsers);

    // Fetch user details only for those who have messages
    const investors = await User.find(
      { _id: { $in: usersWithMessages } },
      "fullName"
    );

    res.status(200).json(investors);
  } catch (error) {
    console.error("Error fetching investors:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching investors." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("user id for profile", userId);

    const userProfile = await UserProfile.findOne({ user: userId }).populate(
      "user",
      "fullName"
    );
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the user profile.",
    });
  }
};

export const getEntrepreneursProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await UserProfile.findById(id).populate("user", "fullName");

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error getting entrepreneurs:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving entrepreneurs." });
  }
};

export const createProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("userId", userId);
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    const user = await User.findById(userId);

    // Parse each key in req.body (they were stringified on the client)
    const parsedData = {};
    Object.entries(req.body).forEach(([Key, value]) => {
      try {
        parsedData[Key] = JSON.parse(value);
      } catch (error) {
        parsedData[Key] = value;
      }
    });

    // Process file uploads from req.files and integrate them into the file field.
    let photo = null;
    if (req.file) {
      // If you have an uploaded file via multipart/form-data, use its path.
      photo = req.file.path;
    } else if (req.body.photo) {
      // If the client sends the photo as a Base64 string in the body, use it.
      photo = req.body.photo;
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with id " + userId + " not found." });
    }
    const newProfile = new UserProfile({
      ...parsedData, // All the idea details
      user: userId, // Associate this idea with the user
      photo: photo,
    });

    await newProfile.save();

    res
      .status(201)
      .json({ message: "Profile created successfully!", profile: newProfile });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the user profile.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const parsedData = {};
    Object.entries(req.body).forEach(([Key, value]) => {
      try {
        parsedData[Key] = JSON.parse(value);
      } catch (error) {
        parsedData[Key] = value;
      }
    });
    const profile = await UserProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    if (req.files["photo"]) {
      if (profile.photo) {
        fs.unlinkSync(profile.photo); // Delete old image file
      }
      profile.photo = req.files["photo"][0].path;
    }

    // Handle document file upload
    if (req.files["documents"]) {
      profile.documents = req.files["documents"].map((file) => file.path);
    }

    Object.assign(profile, parsedData);
    await profile.save();

    res.status(200).json({ message: "Profile updated successfully!", profile });
  } catch (error) {
    console.error("Error Updating user profile:", error);
    res
      .status(500)
      .json({ message: "An error occurred while Updating the user profile." });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    if (userProfile.photo) {
      fs.unlinkSync(userProfile.photo);
    }

    await userProfile.deleteOne();
    res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (error) {
    console.error("Error Deleting user profile:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the user profile." });
  }
};
