const mongoose = require("mongoose");
const productSchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    categoryDesc: { type: String, required: true },
    pTitle: { type: String, required: true },
    pDesc: { type: String, required: true },
    pSubDesc: { type: String, required: true },
    pPrice: { type: Number, required: true },
    pRating: { type: Number, required: true },
    pReview: { type: String, required: true },
    pImage: { type: String, required: true },
    sortBy: { type: String, required: true },
    topRated: { type: Boolean, required: true },
    proService: { type: Boolean, required: true },
    oName: { type: String, required: true },
    oImage: { type: String, required: true },
    oCountry: { type: String, required: true },
    oOrder: { type: String, required: true },
    slider: {
      type: Array,
      items: {
        type: Object,
        properties: {
          img: { type: String },
          title: { type: String },
        },
      },
    },
  },
  { versionKey: false }
);
const ProductModel = mongoose.model("product", productSchema);
module.exports = ProductModel;
