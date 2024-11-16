import { productosModelo } from "./models/productos.model.js";

export class ProductosManager {
  static async getProducts(limit, page, filter = {}, sort = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    return await productosModelo.paginate(filter, { limit, page, lean: true , sort});
  }
  static async getProductsBy(filter) {
    return await productosModelo.find(filter);
  }
  static async createProduct(productos = []) {
    if (Array.isArray(productos)) {
      return await productosModelo.insertMany(productos);
    } else {
      return await productosModelo.create(productos);
    }
  }
  static async updateOneProduct(productoModificado, id) {
    return await productosModelo.updateOne({ _id: id }, productoModificado);
  }
  static async deleteProduct(id) {
    return await productosModelo.deleteOne({ _id: id });
  }
}
