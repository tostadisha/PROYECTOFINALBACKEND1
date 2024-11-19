import { productosModelo } from "./models/productosModel.js";
import mongoose from "mongoose";

export class ProductosManager {
  // Conseguir los producto con cierto parámetros (paginate)
  static async getProducts(limit, page, category, stock, sort = {}) {
    try {
      page = Math.max(1, parseInt(page) || 1);
      limit = Math.max(1, parseInt(limit) || 10);
      const filtros = {};

      if (category) {
        filtros.category = category; // Filtrar por categoría
      }

      if (stock) {
        // Asegurarnos de que stock es un número
        const stockNumber = Number(stock);
        if (isNaN(stockNumber)) {
          throw new Error("El valor de 'stock' debe ser un número válido.");
        }
        filtros.stock = { $gte: stockNumber }; // Filtrar productos con stock mayor o igual al valor proporcionado
      }
      let response = await productosModelo.paginate(filtros, {
        limit,
        page,
        lean: true,
        sort,
      });
      response.docs.forEach(product => {
        delete product.id;
      }); 
      const checkParams = {
        sort: sort === "price" ? "asc" : sort === "-price" ? "desc" : null,
      };
      console.log(response)
      const prevLink = response.hasPrevPage
        ? `http://localhost:3000/api/products/?${
            checkParams.sort ? `sort=${checkParams.sort}&` : ""
          }${category ? `category=${category}&` : ""}${
            stock ? `stock=${stock}&` : ""
          }limit=${limit}&page=${page - 1}`
        : null;
      const nextLink = response.hasNextPage
        ? `http://localhost:3000/api/products/?${
            checkParams.sort ? `sort=${checkParams.sort}&` : ""
          }${category ? `category=${category}&` : ""}${
            stock ? `stock=${stock}&` : ""
          }limit=${limit}&page=${page + 1}`
        : null;
      let responsePedida = {
        status: "success",
        payload: response.docs,
        totalPages: response.totalPages,
        prevPage: response.prevPage,
        nextPage: response.nextPage,
        page: response.page,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
      };
      console.log(responsePedida);
      return responsePedida;
    } catch (error) {
      return { error: error.message };
    }
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("El ID proporcionada no es válida");
      }
      const camposSchema = Object.keys(productosModelo.schema.paths);
      const camposModificados = Object.keys(productoModificado);
      let esValido = false;
      console.log(esValido);
      camposModificados.forEach((e) => {
        camposSchema.forEach((x) => {
          if (e === x) {
            esValido = true;
          }
        });
      });
      if (esValido) {
        return await productosModelo.updateOne({ _id: id }, productoModificado);
      } else {
        throw new Error(
          "El key que usted ha proporcionado no está en el schema"
        );
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  // Borrar un producto
  static async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID inválido.");
      }
      const result = await productosModelo.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        throw new Error("Producto no encontrado.");
      }
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}
