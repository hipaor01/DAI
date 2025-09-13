// ./model/usuarios.js
import mongoose from "mongoose";

const UsuariosSchema = new mongoose.Schema({
  "address": {
    "geolocation": {
      "lat": {
        "type": "String"
      },
      "long": {
        "type": "String"
      }
    },
    "city": {
      "type": "String"
    },
    "street": {
      "type": "String"
    },
    "number": {
      "type": "Number"
    },
    "zipcode": {
      "type": "String"
    }
  },
  "id": {
    "type": "Number"
  },
  "email": {
    "type": "String"
  },
  "username": {
    "type": "String"
  },
  "password": {
    "type": "String"
  },
  "name": {
    "firstname": {
      "type": "String"
    },
    "lastname": {
      "type": "String"
    }
  },
  "phone": {
    "type": "String"
  },
  "__v": {
    "type": "Number"
  },
  "admin": {
    "type": "Boolean",
    "default": false,
    "required": false
  }
})

const Usuarios = mongoose.model("usuarios", UsuariosSchema)
export default Usuarios