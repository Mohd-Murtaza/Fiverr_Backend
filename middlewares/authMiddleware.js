const jwt = require("jsonwebtoken");
const { BlacklistModel } = require("../models/blacklistModel");
require("dotenv").config();

const auth = async(req, res, next) => {
    console.log("auth hit",req.cookies)
    const accessToken = req.cookies.accessToken;
    const refreshToken= req.cookies.refreshToken;
    try {
        if (!accessToken || !refreshToken) {
            return res.status(401).send({ msg: "Unauthorized - Tokens missing" });
        }
        const checkIsBlacklistTokenExist=await BlacklistModel.exists({accessToken,refreshToken})
        if(checkIsBlacklistTokenExist){
            res.status(200).send("please login you are logout person");
        }
        jwt.verify(accessToken, process.env.ACCESS_KEY, (err, decode) => {
            if (err) {
                if (err.message === "jwt expired") {
                    jwt.verify(refreshToken, process.env.REFRESH_KEY, (err,decode)=>{
                        const cookieOptions={httpOnly:true,secure:true,sameSite:"none"}
                        if (err) {
                            // Handle invalid or expired refresh token
                            return res.status(401).json({ msg: "Invalid or expired refresh token" });
                        }
                            const accessToken = jwt.sign({userId:decode.userId,userName:decode.userName}, process.env.ACCESS_KEY, { expiresIn: "5m" });
                            res.cookie("accessToken",accessToken,cookieOptions);
                            console.log("create a access token again")
                            next();
                        
                    });
                }else {
                    // Handle other errors with access token
                    return res.status(401).json({ msg: "Invalid access token" });
                }
            } else {
                req.body.userId=decode.userId;
                req.body.userName=decode.userName;
                next();
            }
        });
        
    } catch (error) {
        res.status(400).json({ msg: "login again!", error: error.message });
    }
};

module.exports = {auth};