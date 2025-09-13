import Usuarios from "./usuarios.js"
import connectDB from "./db.js"
import bcrypt from "bcrypt"


const generarHash = async (password) =>{
	const saltRounds = 10
	const hash = await bcrypt.hash(password, saltRounds)
	return hash
}

async function buscarUsuarios() {
    try {
        let usuarios = await Usuarios.find({})
        for(let i = 0; i < usuarios.length; i++){
            const contrasenaCifrada = await generarHash(usuarios[i].password.trim())
            console.log(contrasenaCifrada)
            const resultado = await Usuarios.updateOne({id:usuarios[i].id},{$set: {password:contrasenaCifrada}})
        }
    } catch (err) {
        console.error("Error al buscar usuarios:", err);
    }
}

connectDB()
buscarUsuarios()