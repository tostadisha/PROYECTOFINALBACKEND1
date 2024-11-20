import { Router } from "express";
import { CarritosManager } from "../dao/CartsManager.js";
import { ProductosManager } from "../dao/ProductsManager.js";
import { isValidObjectId } from "mongoose";
const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    if (!body || body.length === 0 || Object.keys(body).length === 0) {
      let nuevoCarrito = await CarritosManager.createCarrito();
      res.setHeader("Content-type", "application/json");
      return res.status(201).send(nuevoCarrito);
    }
    let nuevoCarrito = await CarritosManager.createCarritoWithProducts(body);
    return res.status(201).send(nuevoCarrito);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ message: "Ha ocurrido un error", error: error.message });
  }
});
// Ver todos los carritos
router.get("/", async (req, res) => {
  try {
    let carritos = await CarritosManager.getAllCarritos();
    res.setHeader("Content-type", "application/json");
    return res.status(200).send(carritos);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Borrar items del carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    let carritoBorrado = await CarritosManager.deleteById(cid);
    res.setHeader("Content-type", "application/json");
    return res.status(200).send(carritoBorrado);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Añadir producto al carrito seleccionado
router.post("/:cid/products/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Id proporcionado inválido` });
  }
  try {
    let carrito = await CarritosManager.getById(cid);
    if (!carrito || carrito.length === 0) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Su carrito no existe` });
    }
    let producto = await ProductosManager.getProductsBy({ _id: pid });
    if (!producto || producto.length === 0) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Su producto no existe` });
    }
    const productSearch = carrito.products.find(
      (product) => product.product.toString() === pid.toString()
    );
    if (!productSearch) {
      carrito.products.push({
        product: pid,
        quantity: 1,
      });
    } else {
      productSearch.quantity += 1;
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
    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
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
    const carritoOrdenado = carrito.products.map((e) => ({
      nombre: e.product.title,
      descripcion: e.product.description,
      cantidad: e.quantity,
    }));

    res.json(carritoOrdenado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});
// Borrar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
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

    let carritoActualizado = await CarritosManager.removeProductFromCarrito(
      cid,
      pid
    );
    if (!carritoActualizado) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No se pudo eliminar el producto` });
    }

    res.setHeader("Content-Type", "application/json");
    return res
      .status(200)
      .json({
        message: "Su producto se ha eliminado correctamente",
        response: carritoActualizado,
      });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Modificar producto en carrito
router.put("/:cid/products/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  let { quantity } = req.body;
  try {
    let carrito = await CarritosManager.changeQuantityFromCarrito(
      cid,
      pid,
      quantity
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({ status: "success", payload: carrito });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
// Cambiar un arreglo de productos por otro arreglo
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const body = req.body;
    let existe = await CarritosManager.getById(cid);
    if (!existe || Object.keys(existe).length === 0) {
      throw new Error("El carrito que ha ingresado no existe");
    }
    let nuevoCarrito = await CarritosManager.exchangeCart(cid, body);
    return res.status(201).send(nuevoCarrito);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: error.message });
  }
});
export default router;
