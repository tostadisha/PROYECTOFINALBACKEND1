import express from "express";
import mongoose from "mongoose";
import path from "path";
import { engine } from "express-handlebars";
import __dirname from "./utils.js";
import productosRouter from "./routes/productosRouter.js";
import carritosRouter from "./routes/carritosRouter.js";
import vistasRouter from "./routes/vistasRouter.js";
const PORT = 3000;
const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);
app.use("/", vistasRouter);
const server = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

const conectarDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://juan20beloso02:contrasenacoder0204@cluster0.fvpe9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        dbName: "entregaFinalDB",
      }
    );
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

conectarDB();
