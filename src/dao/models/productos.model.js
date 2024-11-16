import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2'

const productosSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
productosSchema.plugin(paginate);

export const productosModelo = mongoose.model("productos", productosSchema);
