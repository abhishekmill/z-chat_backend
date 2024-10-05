import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register
const register = async (req, res) => {
  try {
    const { fullname, username, password, gender } = req.body;

    // Check if all inputs are provided
    if (!fullname || !username || !password || !gender) {
      return res.status(400).json({ message: "Please fill all inputs" });
    }

    // Check if username already exists
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Select profile photo based on gender
    const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    // Create the user
    await User.create({
      fullname,
      username,
      password: hashedPassword,
      profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
      gender,
    });

    // Send success response
    return res.status(201).json({
      message: "User successfully registered",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

//login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).send("please enter details");
    }
    const validUser = await User.findOne({ username });

    if (!validUser) {
      return res.status(401).send("user not exist");
    }

    const validPass = await bcrypt.compare(password, validUser.password);
    if (!validPass) {
      return res.status(401).send("incorrect password");
    }
    const tokenData = {
      userId: validUser._id,
    };

    const token = await jwt.sign(tokenData, process.env.SECRETE_KEY, {
      expiresIn: "1d",
    });
    res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 1000 * 1000,
        httpOnly: true,
      })
      .json({
        token,
        sucess: true,
        message: "login done",

        userID: validUser._id,
        username: validUser.username,
        fullname: validUser.fullname,
        profilePhoto: validUser.profilePhoto,
      });
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const getOtherUsers = async (req, res) => {
  try {
    const loggedInUserId = req.id;
    console.log(loggedInUserId);

    const getOtherUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    if (!getOtherUsers.length) {
      return res.status(400).send("no user found");
    }
    res.status(200).json(getOtherUsers);
  } catch (error) {
    console.log(error);
  }
};

const userInfo = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    const user = await User.findById(id).select("-password");
    if (user) {
      res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
  }
};

export { register, login, logout, userInfo, getOtherUsers };
