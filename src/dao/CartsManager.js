import mongoose from "mongoose";
import { carritosModelo } from "./models/carritos.model.js";

export class CarritosManager {
  // Para crear el carrito
  static async createCarrito() {
    let carritoNuevo = await carritosModelo.create({ productos: [] });
    return carritoNuevo.toJSON();
  }
  // Para conseguir el carrito en crudo, sin el populate
  static async getById(id) {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error ("El id ingresado es inválido")
      }
      const carritoBuscado = carritosModelo.findOne({ _id: id });
      if(!carritoBuscado){
        throw new Error ("Ese carrito no existe")
      }
      return carritoBuscado
    } catch (error) {
      return {error: error.message}
    }
  }
  // Para conseguir el carrito con la informacion de los respectivos productos
  static async findById(id) {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error ("El id ingresado es inválido")
      }
      const carritoBuscado = carritosModelo.findById({ _id: id }).populate("productos.id");
      if(!carritoBuscado){
        throw new Error ("Ese carrito no existe")
      }
      return carritoBuscado
    } catch (error) {
      return {error: error.message}
    }
  }
  // Borrar un carrito
  static async deleteById(id){
    try {
      if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error ("El id ingresado es inválido")
      }
      const carritoBorrado = await carritosModelo.deleteOne({ _id : id })
      if(carritoBorrado.deletedCount == 0){
        throw new Error ("Ese carrito no existe")
      }
      return { message: "El carrito fue borrado con éxito!"}
    } catch (error) {
      return {error: error.message}
    }
  }
  // Para actualizar algun producto de un carrito
  static async updateCarrito(idCarrito, idProducto) {
    if(mongoose.Types.ObjectId.isValid(idCarrito) && mongoose.Types.ObjectId.isValid(idProducto)){
      return await carritosModelo.findByIdAndUpdate(
        idCarrito,
        { productos: idProducto.productos },
        { new: true }
      );
    }else{
      throw new Error("Verifique los IDS proporcionados.")
    }
  }
  // Eliminar un item del carrito (entero)
  static async removeProductFromCarrito(idCarrito, idProducto) {
    try{
      const carrito = await this.getById(idCarrito);
      if (!carrito) throw new Error("Carrito no encontrado.");
      const productExist = carrito.productos.some((p) => p.id.equals(idProducto));
      if (!productExist) throw new Error("Producto no encontrado en el carrito.");
      return await carritosModelo.findByIdAndUpdate(
      idCarrito,
      { $pull: { productos: { id: idProducto } } },
      { new: true }
  );
   }catch(error){
  return {error: error.message}
   }
    

  }
  // Recibir un nuevo carrito y modificar el carrito especificado
  static async exchangeCart(idCarrito, nuevoCarrito) {
    return await carritosModelo.findByIdAndUpdate(
      idCarrito,
      {
        $set: { productos: nuevoCarrito },
      },
      { new: true }
    );
  }
  // Cambiar la quantity de un producto que está en el carrito
  static async changeQuantityFromCarrito(idCarrito, idProducto, quantity) {
    try {
      let carritoActual = await this.getById(idCarrito);
      let productExist = carritoActual.productos.find((e) =>
        e.id.equals(idProducto)
      );
      if (productExist) {
        productExist.cantidad = quantity;
        await carritoActual.save();
      } else {
        throw new Error("Producto no encontrado en el carrito")
      }

      return carritoActual;
    } catch (error) {
      return {error : error.message}
    }
  }
}
