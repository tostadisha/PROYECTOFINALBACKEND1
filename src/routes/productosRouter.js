import { Router } from "express";
import { ProductosManager } from "../dao/ProductsManager.js";
const router = Router();
router.get("/", async (req, res) => {
  try {
    let {limit, page, filter, sort} = req.query
    let productos = await ProductosManager.getProducts(limit,page,filter,sort);
    res.setHeader("Content-type", "application/json");
    return res.status(200).send({ productos });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: `${error.message}` });
  }
});
router.post("/", async (req, res) => {
  try {
    const { body } = req;
    console.log(body);
    const response = await ProductosManager.createProduct(body);
    res.setHeader("Content-type", "application/json");
    return res.status(200).send(`Su producto ha sido creado con éxito, este es:
        ${JSON.stringify(response)}`);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(201).json({
      message: "Su producto no ha podido ser creado",
      error: error.message,
    });
  }
});
router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const { body } = req;
    const response = await ProductosManager.updateOneProduct(body, pid);
    res.setHeader("Content-type", "text/plain");
    return res
      .status(200)
      .send(
        `Su producto ha sido modificado el valor que usted ha ingresado es ${JSON.stringify(
          body
        )}. ${JSON.stringify(response)}`
      );
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      message: "Su producto no ha podido ser modificado",
      error: error.message,
    });
  }
});
router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const response = await ProductosManager.deleteProduct(pid);
    res.setHeader("Content-type", "text/plain");
    return res.status(200).send({
      message: `Su producto ha sido eliminado.`,
      response: response,
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: error.message });
  }
});

export default router;
