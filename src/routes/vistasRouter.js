import { Router } from "express";
import { ProductosManager } from "../dao/ProductsManager.js";
import { CarritosManager } from "../dao/CartsManager.js"

const router = Router();

// Conseguir los productos, modificado por paginate
router.get("/", async (req, res) => {
  let { page, limit, sort, filter } = req.query;
  
  try {
    const { payload: productos, totalPages, hasNextPage, hasPrevPage, prevPage, nextPage} = await ProductosManager.getProducts(limit, page, filter, sort);
    res.render("home", {
      productos,
      totalPages,
      hasNextPage,
      hasPrevPage,
      prevPage,
      nextPage,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los productos");
  }
});
// Conseguir el carrito especificado en el prompt
router.get("/carritoUser/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const carrito = await CarritosManager.findById(cid);

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Accede al array de productos dentro del carrito
    const carritoOrdenado = carrito.productos.map(e => ({
      nombre: e.id.title,
      descripcion: e.id.description,
      cantidad: e.cantidad
    }));
    
    res.render("carrito",{carritoOrdenado}); // Devuelve el array procesado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

export default router;

