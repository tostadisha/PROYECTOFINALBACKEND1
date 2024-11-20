import { Router } from "express";
import { ProductosManager } from "../dao/ProductsManager.js";
import { CarritosManager } from "../dao/CartsManager.js"

const router = Router();

// Conseguir los productos, modificado por paginate
router.get("/products", async (req, res) => {
  try {
    let { limit, page, category, stock, sort } = req.query;
    if (sort === "asc") {
      sort = "price";
    } else if (sort === "desc") {
      sort = "-price";
    } else if (sort) {
      throw new Error("El valor de 'sort' que usted ha ingresado no es válido");
    }
    const {
      payload: productos,
      totalPages,
      hasNextPage,
      hasPrevPage,
      prevLink,
      nextLink,
      page: currentPage,
    } = await ProductosManager.getProducts(limit, page, category, stock, sort);

    const modifiedPrevLink = prevLink ? prevLink.replace("/api/", "/") : null;
    const modifiedNextLink = nextLink ? nextLink.replace("/api/", "/") : null;

    res.render("home", {
      productos,
      totalPages,
      hasNextPage,
      hasPrevPage,
      modifiedPrevLink,
      modifiedNextLink,
      currentPage,
      category,
      stock,
      sort,
      limit,
    });
  } catch (error) {
    res.status(500).send("Error al obtener los productos");
  }
});

// Conseguir el carrito especificado en el prompt
router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const carrito = await CarritosManager.findById(cid);
    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Accede al array de productos dentro del carrito
    const carritoOrdenado = carrito.products.map(e => ({
      nombre: e.product.title,
      descripcion: e.product.description,
      cantidad: e.quantity
    }));
    
    res.render("carrito",{carritoOrdenado}); // Devuelve el array procesado
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

export default router;

