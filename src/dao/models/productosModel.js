import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2'

const productosSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true
    },
    code: {
      type: String,
      unique: true,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    thumbnails:{
      type: Array,
      required: false,
      default: []
    },
    category:{
      type: String,
      required: true
    },
    status:{
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true,
  }
);
productosSchema.plugin(paginate);

export const productosModelo = mongoose.model("productos", productosSchema);
