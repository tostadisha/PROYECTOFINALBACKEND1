import { carritosModelo } from "./models/carritos.model.js";

export class CarritosManager {
  // Para crear el carrito
  static async createCarrito() {
    let carritoNuevo = await carritosModelo.create({ productos: [] });
    return carritoNuevo.toJSON();
  }
  // Para conseguir el carrito en crudo, sin el populate
  static async getById(id) {
    return carritosModelo.findOne({ _id: id });
  }
  // Para conseguir el carrito con la informacion de los respectivos productos
  static async findById(id) {
    return carritosModelo.findById({ _id: id }).populate("productos.id");
  }
  // Para actualizar algun producto de un carrito
  static async updateCarrito(idCarrito, idProducto) {
    return await carritosModelo.findByIdAndUpdate(
      idCarrito,
      { productos: idProducto.productos },
      { new: true }
    );
  }
  // Eliminar un item del carrito (entero)
  static async removeProductFromCart(idCarrito, idProducto) {
    return await carritosModelo.findByIdAndUpdate(
      idCarrito,
      { $pull: { productos: { id: idProducto } } },
      { new: true }
    );
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
  static async changeQuantityFromCart(idCarrito, idProducto, quantity) {
    try {
      let carritoActual = await this.getById(idCarrito);
      let productExist = carritoActual.productos.find((e) =>
        e.id.equals(idProducto)
      );

      if (productExist) {
        productExist.cantidad = quantity;
        await carritoActual.save();
      } else {
        console.log("Producto no encontrado en el carrito");
      }

      return carritoActual;
    } catch (error) {
      console.error(
        "Error al cambiar la cantidad del producto en el carrito:",
        error
      );
      throw error;
    }
  }
}
