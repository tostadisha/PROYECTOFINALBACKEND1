import mongoose from "mongoose";
import { carritosModelo } from "./models/carritosModel.js";
import { productosModelo } from "./models/productosModel.js";

export class CarritosManager {
  // Para crear el carrito
  static async createCarrito() {
    try {
      const carritoNuevo = await carritosModelo.create({ products: [] });
      return carritoNuevo.toJSON();
    } catch (error) {
      throw new Error(`Error al crear el carrito: ${error.message}`);
    }
  }
  // Crear un carrito con un arreglo de productos
  static async createCarritoWithProducts(arrayProductos) {
    try {
      let productosIds = new Set();
      if (!arrayProductos.products) {
        throw new Error("Revise el anidado de sus productos");
      }
      let errores = [];
      //Hago un ciclo for porque no puedo hacer un foreach con await
      for (let i = 0; i < arrayProductos.products.length; i++) {
        const e = arrayProductos.products[i];
        if (productosIds.has(e.product)) {
          errores.push(`El producto n°${i + 1} está duplicado`);
          throw new Error(errores);
        }
        productosIds.add(e.product);
        const existe = await productosModelo.findById(e.product);

        if (existe === null) {;
        errores.push(`El producto n°${i + 1} no existe`);}
      }
      if (errores.length > 0) {
        throw new Error(errores.join(" \\ "));
      }
      const carritoNuevo = await carritosModelo.create({
        products: arrayProductos.products,
      });

      return carritoNuevo;
    } catch (error) {
      throw new Error(error.message); // Lanza el error nuevamente para que lo maneje el controlador
    }
  }

  // Ver todos los carritos (sin populate)
  static async getAllCarritos() {
    try {
      return await carritosModelo.find();
    } catch (error) {
      throw new Error(`Ocurrió un error : ${error.message}`);
    }
  }
  // Para conseguir el carrito en crudo, sin el populate
  static async getById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("El id ingresado es inválido");
      }
      const carritoBuscado = carritosModelo.findOne({ _id: id });
      if (!carritoBuscado) {
        throw new Error("Ese carrito no existe");
      }
      return carritoBuscado;
    } catch (error) {
      return { error: error.message };
    }
  }
  // Para conseguir el carrito con la informacion de los respectivos products
  static async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("El id ingresado es inválido");
      }
      const carritoBuscado = await carritosModelo
        .findById({ _id: id })
        .populate("products.product");
      if (!carritoBuscado) {
        throw new Error("Ese carrito no existe");
      }
      return carritoBuscado;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Borrar un carrito
  static async deleteById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("El id ingresado es inválido");
      }
      const carritoObjetivo = await carritosModelo.findById(id);
      if (!carritoObjetivo) {
        throw new Error("Ese carrito no existe");
      }
      if (carritoObjetivo.products.length === 0) {
        throw new Error("El carrito que usted quiere borrar está vacío");
      }
      const carritoBorrado = await carritosModelo.updateOne(
        { _id: id },
        { $set: { products: [] } }
      );
      if (carritoBorrado.modifiedCount === 0) {
        throw new Error("No se pudo vaciar el carrito");
      }
      return {
        message: "El carrito fue vaciado con éxito!",
        payload: carritoBorrado,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Para actualizar algun producto de un carrito
  static async updateCarrito(idCarrito, idProducto) {
    if (
      mongoose.Types.ObjectId.isValid(idCarrito) &&
      mongoose.Types.ObjectId.isValid(idProducto)
    ) {
      return await carritosModelo.findByIdAndUpdate(
        idCarrito,
        { products: idProducto.products },
        { new: true }
      );
    } else {
      throw new Error("Verifique los IDS proporcionados.");
    }
  }
  // Eliminar un item del carrito (entero)
  static async removeProductFromCarrito(idCarrito, idProducto) {
    try {
      const carrito = await this.getById(idCarrito);
      if (!carrito) throw new Error("Carrito no encontrado.");
      const productExist = carrito.products.some((p) =>
        p.product.equals(idProducto)
      );
      if (!productExist)
        throw new Error("Producto no encontrado en el carrito.");
      return await carritosModelo.findByIdAndUpdate(
        idCarrito,
        { $pull: { products: { product: idProducto } } },
        { new: true }
      );
    } catch (error) {
      return { error: error.message };
    }
  }
  // Recibir un nuevo carrito y modificar el carrito especificado
  static async exchangeCart(idCarrito, nuevoCarrito) {
    try {
      let productosIds = new Set();
      if (!nuevoCarrito || !Array.isArray(nuevoCarrito.products) || nuevoCarrito.products.length === 0) {
        throw new Error("Por favor, ingrese un body con productos válidos");
      }
      let errores = [];
      for (let i = 0; i < nuevoCarrito.products.length; i++) {
        const e = nuevoCarrito.products[i];
        if (productosIds.has(e.product)) {
          errores.push(`El producto n°${i + 1} está duplicado`);
          throw new Error(errores);
        }
        productosIds.add(e.product);
        const existe = await productosModelo.findById(e.product);
        if (!existe) {
          errores.push(`El producto n°${i + 1} no existe`);
        }
      }
      
  
      if (errores.length > 0) {
        throw new Error(errores.join(" \\ "));
      }
  
      // Si no hay errores, actualizamos el carrito
      const carritoModificado = await carritosModelo.findByIdAndUpdate(
        idCarrito,
        {
          $set: { products: nuevoCarrito.products },  // Solo el array de productos
        },
        { new: true } // Para que devuelva el documento actualizado
      );
  
      // Devolvemos el carrito actualizado
      return carritoModificado;
  
    } catch (error) {
      console.error(error); // Loguear el error para poder depurarlo
      throw new Error(error.message); // Lanzar el error nuevamente
    }
  }
  // Cambiar la quantity de un producto que está en el carrito
  static async changeQuantityFromCarrito(idCarrito, idProducto, quantity) {
    try {
      let carritoActual = await this.getById(idCarrito);
      let productExist = carritoActual.products.find((e) =>
        e.product.equals(idProducto)
      );
      if (productExist) {
        productExist.quantity = quantity;
        await carritoActual.save();
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }

      return carritoActual;
    } catch (error) {
      return { error: error.message };
    }
  }
}
