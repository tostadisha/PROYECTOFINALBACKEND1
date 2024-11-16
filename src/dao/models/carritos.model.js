import mongoose from "mongoose";

const carritosSchema = new mongoose.Schema(
  {
    productos: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productos", // Refere a los productos
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const carritosModelo = mongoose.model("carritos", carritosSchema);
