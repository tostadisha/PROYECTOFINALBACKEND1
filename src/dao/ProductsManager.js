import { productosModelo } from "./models/productos.model.js";
import mongoose from "mongoose";

export class ProductosManager {
  // Conseguir los producto con cierto parámetros (paginate)
  static async getProducts(limit, page, filter = {}, sort = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    return await productosModelo.paginate(filter, { limit, page, lean: true , sort});
  }
  // Conseguir los productos SÓLO con el filtro
  static async getProductsBy(filter) {
    return await productosModelo.find(filter);
  }
  // Crear un producto
  static async createProduct(productos = []) {
    if (Array.isArray(productos)) {
      return await productosModelo.insertMany(productos);
    } else {
      return await productosModelo.create(productos);
    }
  }
  // Cambiar los datos de algún producto
  static async updateOneProduct(productoModificado, id) {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error("El ID proporcionada no es válida")
      }
      const camposSchema =  Object.keys(productosModelo.schema.paths)
      const camposModificados = Object.keys(productoModificado)
      let esValido = false
      console.log(esValido)
      camposModificados.forEach((e) =>{
        camposSchema.forEach((x)=>{
          if(e===x){
            esValido = true
          }
        })
      })
      console.log(`Los campos buscados son ${camposSchema} y los que se quieren modiciar son ${camposModificados}`);
      if(esValido){
        return await productosModelo.updateOne({ _id: id }, productoModificado);
      }else{
        throw new Error("El key que usted ha proporcionado no está en el schema")
      };
    } catch (error) {
      return {error: error.message}
    }
  }
  // Borrar un producto
  static async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID inválido.")
      }
      const result = await productosModelo.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        throw new Error("Producto no encontrado.")
      };
      return result;
    } catch (error) {
      return {error : error.message}
    }
  }
  
}
