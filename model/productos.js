// ./model/productos.js
import mongoose from "mongoose";

const ProductosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  "title": {
    "type": "String"
  },
  "price": {
    "type": "Number"
  },
  "description": {
    "type": "String"
  },
  "category": {
    "type": "String"
  },
  "image": {
    "type": "String"
  },
  "rating": {
    "rate": {
      "type": "Number"
    },
    "count": {
      "type": "Number"
    }
  }
})

const Productos = mongoose.model("productos", ProductosSchema)
export default Productos