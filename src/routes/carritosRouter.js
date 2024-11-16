import { Router } from "express";
import { CarritosManager } from "../dao/CartsManager.js";
import { ProductosManager } from "../dao/ProductsManager.js";
import { isValidObjectId } from "mongoose";
const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
  try {
    let nuevoCarrito = await CarritosManager.createCarrito();
    res.setHeader("Content-type", "application/json");
    return res.status(201).send(nuevoCarrito);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `` });
  }
});
// Añadir producto al carrito seleccionado
router.post("/:cid/producto/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Id proporcionado inválido` });
  }
  try {
    let carrito = await CarritosManager.getById(cid);
    if (!carrito) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Su carrito no existe` });
    }
    let producto = await ProductosManager.getProductsBy({ _id: pid });
    if (!producto) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Su producto no existe` });
    }
    const productSearch = carrito.productos.findIndex(
      (product) => product.id.toString() === pid.toString()
    );
    if (productSearch === -1) {
      carrito.productos.push({
        id: pid,
        cantidad: 1,
      });
    } else {
      carrito.productos[productSearch].cantidad += 1;
    }
    let carritoActualizado = await CarritosManager.updateCarrito(cid, carrito);
    res.setHeader("Content-type", "application/json");
    return res.status(200).send(carritoActualizado);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// [DEV] Ver carrito sin el populate
router.get("/temporary/:cid", async (req, res) => {
  try {
    let { cid } = req.params;
    let carrito = await CarritosManager.getById(cid);
    res.setHeader("Content-type", "application/json");
    return res.status(200).send(carrito);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Ver carrito con populate
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const carrito = await CarritosManager.findById(cid);
    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    const carritoOrdenado = carrito.productos.map(e => ({
      nombre: e.id.name,
      descripcion: e.id.description,
      cantidad: e.cantidad
    }));

    res.json(carritoOrdenado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});
// Borrar producto del carrito
router.delete("/:cid/producto/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Id proporcionado inválido` });
  }

  try {
    let carrito = await CarritosManager.getById(cid);
    if (!carrito) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Su carrito no existe` });
    }

    let carritoActualizado = await CarritosManager.removeProductFromCart(
      cid,
      pid
    );
    if (!carritoActualizado) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No se pudo eliminar el producto` });
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(carritoActualizado);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Modificar producto en carrito
router.put("/:cid/productos/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  let { quantity } = req.body;
  try {
    let carrito = await CarritosManager.changeQuantityFromCart(
      cid,
      pid,
      quantity
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(carrito);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});

export default router;
