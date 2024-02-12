const express=require("express");
const ProductModel = require("../models/productModel");
const { auth } = require("../middlewares/authMiddleware");
const productRouter=express.Router();


productRouter.get("/allProducts", async(req,res)=>{
    const query=req.query;
    const data=await ProductModel.find(query)
    console.log(query,"line no. 8")
    res.status(200).send({msg:"all prods", data})
})
productRouter.post("/add", async(req,res)=>{
    const body=req.body;
    try {
        const data=new ProductModel(body);
        await data.save();
        res.send({msg:"data added",data})
    } catch (error) {
        console.log(error)
        res.send("error while adding",error)
    }
})

module.exports={productRouter}