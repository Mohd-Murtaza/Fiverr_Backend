const mongoose=require("mongoose");
const orderSchema=mongoose.Schema({
    name:String,
    amount:Number,
    order_id:String,
    razorpay_payment_id:{type:String,default:null},
    razorpay_order_id:{type:String,default:null},
    razorpay_signature:{type:String,default:null},
},{timestamps:true});
const OrderModel=mongoose.model("order",orderSchema);
module.exports=OrderModel;