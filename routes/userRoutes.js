require("dotenv").config();
const express=require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const { UserModel } = require("../models/userModel");
const { BlacklistModel } = require("../models/blacklistModel");
const userRouter=express.Router();
const ACCESS_KEY=process.env.ACCESS_KEY;
const REFRESH_KEY=process.env.REFRESH_KEY;

userRouter.post("/signup", async(req,res)=>{
    try {
        const {userName,email,password}=req.body;
        // Check if the password meets the specified criteria means password should have one uppercase character,one number,one special character, and the length of password should be at least 8 characters long 
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password does not meet the criteria." });
        }
        const checkUserIsExist=await UserModel.exists({email});
        if(checkUserIsExist){
            res.status(400).send("user is exist already");
        }else{
            bcrypt.hash(password,5,async(err,hash)=>{
                if(hash){
                    const newUser=new UserModel({userName,email,password:hash});
                    await newUser.save();
                    res.status(200).send({msg:"user register successfully",newUser});
                }else{
                    res.status(400).send({msg:"error while hashing password!",err:err.message})
                }
            })
        }
    } catch (error) {
        res.status(400).send({msg:"error while sign up!",error:error.message});
    }
    
});
userRouter.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body;
        const cookieOptions={httpOnly:true,secure:true,sameSite:"none"}
        const checkUserIsExist=await UserModel.findOne({email});
        console.log(checkUserIsExist)
        if(!checkUserIsExist){
            res.status(404).send({msg:"user not found please signup first"})
        }else{
            bcrypt.compare(password, checkUserIsExist.password, (err,decode)=>{
                if(err){
                    console.error("Error during password comparison:", err);
                    res.status(500).send({ msg: "Internal server error" });
                }else if(!decode){
                    res.status(401).send({ msg: "Invalid password" });
                }else{
                    const accessToken=jwt.sign({userId:checkUserIsExist._id,userName:checkUserIsExist.userName}, ACCESS_KEY,{expiresIn:"5m"});
                    const refreshToken=jwt.sign({userId:checkUserIsExist._id,userName:checkUserIsExist.userName}, REFRESH_KEY, {expiresIn:"1h"});
                    res.cookie("accessToken",accessToken,cookieOptions);
                    res.cookie("refreshToken",refreshToken,cookieOptions);
                    res.status(200).send({msg:"user login successfully.",userName:checkUserIsExist.userName, accessToken, refreshToken});
                }
            })
        }
    } catch (error) {
        res.status(400).send({msg:"error while login!", error:error.message})
    }
});
userRouter.post("/logout", async(req,res)=>{
    console.log("gjgjghjfhfhf",req.cookies)
    const accessToken=req.cookies.accessToken;
    console.log({accessToken:accessToken})
    try {
        const checkTokensIsExists=await BlacklistModel.findOne({accessToken})
        if(checkTokensIsExists){
            res.status(400).send({msg:"you already logout!"})
        }else{
            const blacklistTokens=new BlacklistModel({accessToken});
            await blacklistTokens.save();
            res.status(200).send({msg:"logout successfull",blacklistTokens})
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({msg:"error while logout!",error:error})
    }
});

module.exports={userRouter};

