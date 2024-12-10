const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    userName:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true,},
    userProfile:String,
    mobile:Number,
    shippingDetails:String,
    gender:String,
    otp:String
},{versionKey:false});
const UserModel=mongoose.model("user", userSchema);
module.exports={UserModel};
