require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/userModel");
const { BlacklistModel } = require("../models/blacklistModel");
const userRouter = express.Router();
const ACCESS_KEY = process.env.ACCESS_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;

userRouter.post("/signup", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    // Check if the password meets the specified criteria means password should have one uppercase character,one number,one special character, and the length of password should be at least 8 characters long
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password does not meet the criteria." });
    }
    const checkUserIsExist = await UserModel.exists({ email });
    if (checkUserIsExist) {
      res.status(400).send("user is exist already");
    } else {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (hash) {
          const newUser = new UserModel({ userName, email, password: hash });
          await newUser.save();
          res.status(200).send({ msg: "user register successfully", newUser });
        } else {
          res
            .status(400)
            .send({ msg: "error while hashing password!", err: err.message });
        }
      });
    }
  } catch (error) {
    res.status(400).send({ msg: "error while sign up!", error: error.message });
  }
});
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cookieOptions = { httpOnly: true, secure: true, sameSite: "none"};
    const checkUserIsExist = await UserModel.findOne({ email });
    console.log(checkUserIsExist);
    if (!checkUserIsExist) {
      res.status(404).send({ msg: "user not found please signup first" });
    } else {
      bcrypt.compare(password, checkUserIsExist.password, (err, decode) => {
        if (err) {
          console.error("Error during password comparison:", err);
          res.status(500).send({ msg: "Internal server error" });
        } else if (!decode) {
          res.status(401).send({ msg: "Invalid password" });
        } else {
          const accessToken = jwt.sign(
            {
              userId: checkUserIsExist._id,
              userName: checkUserIsExist.userName,
            },
            ACCESS_KEY,
            { expiresIn: "5m" }
          );
          const refreshToken = jwt.sign(
            {
              userId: checkUserIsExist._id,
              userName: checkUserIsExist.userName,
            },
            REFRESH_KEY,
            { expiresIn: "1h" }
          );
          res.cookie("accessToken", accessToken, cookieOptions);
          res.cookie("refreshToken", refreshToken, cookieOptions);
          res
            .status(200)
            .send({
              msg: "user login successfully.",
              userName: checkUserIsExist.userName,
              accessToken,
              refreshToken,
            });
        }
      });
    }
  } catch (error) {
    res.status(400).send({ msg: "error while login!", error: error.message });
  }
});

userRouter.post("/reset", async (req, res) => {
  try {
    const { oldPassword, newPassword, email } = req.body;
    const findUserForResetPassword = await UserModel.findOne({ email });

    if (!findUserForResetPassword) {
      return res.status(401).send({ status: "fail", msg: "User not found" });
    }

    // Check if the password meets the specified criteria means password should have one uppercase character,one number,one special character, and the length of password should be at least 8 characters long
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res
        .status(401)
        .send({ error: "Password does not meet the criteria." });
    }

    const oldPasswordValidation = bcrypt.compareSync(
      oldPassword,
      findUserForResetPassword.password
    );
    if (!oldPasswordValidation) {
      return res
        .status(401)
        .send({ status: "fail", msg: "Your old password is incorrect" });
    }
    const hashedNewPassword = bcrypt.hashSync(newPassword, 5);

    findUserForResetPassword.password = hashedNewPassword;
    await findUserForResetPassword.save({ validateBeforeSave: false });
    res
      .status(201)
      .send({ status: "success", msg: "Your password changed successfully" });
  } catch (error) {
    res.status(400).send({ status: "fail", msg: error.message });
  }
});

const generateFourDigitOTP = () => {
  return Math.floor(1000 + Math.random() * 9999).toString();
};

const saveOTPToUserDocument = async (userId, otp) => {
  await UserModel.findByIdAndUpdate(userId, { $set: { otp } });
};

userRouter.post("/otpRequest", async (req, res) => {
  try {
    const { email } = req.body;
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res
        .status(400)
        .send({ status: "fail", msg: "User not found with this email" });
    }
    const otp = generateFourDigitOTP();

    await saveOTPToUserDocument(checkUser._id, otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "OTP for Forget",
      text: `This is your ${otp} OTP for forget password on Fiverr`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).send({ status: "success", msg: "OTP send Successfully" });
  } catch (error) {
    res.status(400).send({ status: "fail", msg: error.message });
  }
});

userRouter.post("/otpVerify", async (req, res) => {
  try {
    const { otp, email } = req.body;
    const otpFindInUserModel = await UserModel.find({ email });

    if (!otpFindInUserModel) {
      return res.status(200).send({
        status: "fail",
        msg: "User with this email not found please enter your correct mail",
      });
    }
    const otpWhichIsStoreInUserDocument = otpFindInUserModel[0].otp;

    if (otpWhichIsStoreInUserDocument == otp) {
      return res
        .status(201)
        .send({ status: "success", msg: "Otp verified successfully" });
    } else {
      return res
        .status(401)
        .send({ status: "fail", msg: "Invalid otp please enter correct otp" });
    }
  } catch (error) {
    res.status(200).send({ status: "fail", msg: error.message });
  }
});

userRouter.post("/forget", async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    const findUserWithEmail = await UserModel.findOne({ email });
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res
        .status(401)
        .send({ error: "Password does not meet the criteria." });
    }
    if (!findUserWithEmail) {
      return res.status(400).send({ status: "fail", msg: "User not found" });
    }
    
    const hashedNewPassword = bcrypt.hashSync(newPassword, 5);
    findUserWithEmail.password = hashedNewPassword;
    await findUserWithEmail.save();
    res
      .status(201)
      .send({ status: "success", msg: "Password reset successfully" });
  } catch (error) {
    res.status(200).send({ status: "fail", msg: error.message });
  }
});

userRouter.post("/logout", async (req, res) => {
  const accessToken = req.cookies.accessToken;
  console.log({ accessToken: accessToken });
  try {
    const checkTokensIsExists = await BlacklistModel.findOne({ accessToken });
    console.log(checkTokensIsExists, "checking token is exist while logout...")
    if (checkTokensIsExists) {
      res.status(400).send({ msg: "you already logout!" });
    } else {
      const blacklistTokens = new BlacklistModel({ accessToken });
      await blacklistTokens.save();
      res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
      res.status(200).send({ msg: "logout successfull", blacklistTokens });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ msg: "error while logout! hehehehehe", error: error });
  }
});

module.exports = { userRouter };
