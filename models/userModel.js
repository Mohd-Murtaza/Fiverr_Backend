const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    userName:{type:String, required:true, unique:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true,},
    userProfile:String,
    mobile:Number,
    shippingDetails:String,
    gender:String
},{versionKey:false});
const UserModel=mongoose.model("user", userSchema);
module.exports={UserModel};
