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
      response.docs.forEach((product) => {
        delete product.id;
      });
      const checkParams = {
        sort: sort === "price" ? "asc" : sort === "-price" ? "desc" : null,
      };
      let prevLink = response.hasPrevPage
        ? `http://localhost:3000/api/products/?${
            checkParams.sort ? `sort=${checkParams.sort}&` : ""
          }${category ? `category=${category}&` : ""}${
            stock ? `stock=${stock}&` : ""
          }${limit === 10 ? "" : `limit=${limit}`}&page=${page - 1}`
        : null;
      let nextLink = response.hasNextPage
        ? `http://localhost:3000/api/products/?${
            checkParams.sort ? `sort=${checkParams.sort}&` : ""
          }${category ? `category=${category}&` : ""}${
            stock ? `stock=${stock}&` : ""
          }${limit === 10 ? "" : `limit=${limit}`}&page=${page + 1}`
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
    // Obtener los campos requeridos del schema
    const camposRequeridos = Object.keys(productosModelo.schema.paths).filter(
      (e) => productosModelo.schema.paths[e].isRequired
    );

    // Obtener los campos permitidos (todos los campos definidos en el schema sin contar los que nos da mongoose)
    const camposPermitidos = Object.keys(productosModelo.schema.paths).filter(
      (e) => !["_id", "createdAt", "updatedAt", "__v"].includes(e)
    );
    if (Array.isArray(productos)) {
      const errores = [];

      productos.forEach((product, index) => {
        // Verificar campos requeridos
        const keysComparadas = camposRequeridos.filter(
          (e) => !Object.keys(product).includes(e)
        );
        if (keysComparadas.length > 0) {
          errores.push(
            `Revise los atributos ingresados en su producto n° ${
              index + 1
            } faltan los atributos: ${keysComparadas.join(", ")}.`
          );
        }

        // Verificar campos extra (no permitidos)
        const keysExtra = Object.keys(product).filter(
          (e) => !camposPermitidos.includes(e)
        );
        if (keysExtra.length > 0) {
          errores.push(
            `En el producto n° ${
              index + 1
            } los siguientes atributos no son válidos: ${keysExtra.join(", ")}.`
          );
        }
      });

      if (errores.length > 0) {
        throw new Error(errores.join(" \\ "));
      }

      return await productosModelo.insertMany(productos);
    } else {
      // Verificar campos requeridos
      const keysComparadas = camposRequeridos.filter((e) => !(e in productos));
      if (keysComparadas.length > 0) {
        throw new Error(
          `Revise los atributos ingresados, faltan los atributos: ${keysComparadas.join(
            ", "
          )}`
        );
      }

      // Verificar campos extra
      const keysExtra = Object.keys(productos).filter(
        (key) => !camposPermitidos.includes(key)
      );
      if (keysExtra.length > 0) {
        throw new Error(
          `Los siguientes atributos no son válidos: ${keysExtra.join(", ")}`
        );
      }

      return await productosModelo.create(productos);
    }
  }
  // Cambiar los datos de algún producto
  static async updateOneProduct(productoModificado, id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("El ID proporcionada no es válida");
      }
      const productoObjetivo = await productosModelo.findById(id);
      if (!productoObjetivo) {
        throw new Error("El producto no existe");
      }
      const camposSchema = Object.keys(productosModelo.schema.paths);
      const camposModificados = Object.keys(productoModificado);
      let esValido = false;
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
