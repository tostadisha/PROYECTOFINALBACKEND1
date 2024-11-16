import { productosModelo } from "./models/productos.model.js";

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
    if(mongoose.Types.ObjectId.isValid(id)){
      return await productosModelo.updateOne({ _id: id }, productoModificado);
    }
  }
  // Borrar un producto
  static async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido.")
    }
  ;
    const result = await productosModelo.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new Error("Producto no encontrado.")
    };
    return result;
  }
  
}
