import { Router } from "express";
import { ProductosManager } from "../dao/ProductsManager.js";
const router = Router();
// Conseguir los productos con paginate
router.get("/", async (req, res) => {
  try {
    let {limit, page, category, stock, sort} = req.query
    if (sort === "asc") {
      sort = "price";
    } else if (sort === "desc") {
      sort = "-price";
    } else if (sort && sort !== "asc" && sort !== "desc") {
      throw new Error("El valor de 'sort' que usted ha ingresado no es válido");
    } else {
      sort = {};
    }
    let productos = await ProductosManager.getProducts(limit,page,category, stock,sort);
    console.log(productos)
    res.setHeader("Content-type", "application/json");
    return res.status(200).send({ productos });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: `${error.message}` });
  }
});
// Crear un producto
router.post("/", async (req, res) => {
  try {
    const { body } = req;
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
// Updatear un producto
router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const { body } = req;
    const response = await ProductosManager.updateOneProduct(body, pid);
    res.setHeader("Content-type", "application/json");
    if(response.error){
      throw new Error(response.error)
    }
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
// Borrar un producto
router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const response = await ProductosManager.deleteProduct(pid);
    console.log(response)
    res.setHeader("Content-type", "application/json");
    if(response.error){
      throw new Error(`Hubo un problema al eliminar el producto: ${response.error}`)
    }else{
      return res.status(200).send({
        message: `Su producto ha sido eliminado.`,
        response: response,
      });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: error.message });
  }
});

export default router;
