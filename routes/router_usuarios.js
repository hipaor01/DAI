// ./routes/router_usuarios.js

import express from "express";
import Productos from "../model/productos.js";
import Usuarios from  "../model/usuarios.js";
import jwt from "jsonwebtoken"
const router = express.Router();
import bcrypt from "bcrypt"


async function obtenerCategoriasUnicas() {
    const categorias = await Productos.find({}, { category: 1, _id: 0 }); // todas las categorías
    const categoriasProcesadas = categorias.map(categoria => categoria.category);
    const categoriasProcesadasUnicas = [...new Set(categoriasProcesadas)]; // categorías sin repeticiones
    return categoriasProcesadasUnicas;
}

// Para mostrar formulario de login
router.get('/login', async (req,res) =>{
	const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
	res.render('login.html', {categoriasProcesadasUnicas, modo:req.modo, admin:req.admin})
})

router.get('/logout', async (req,res) =>{
	const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
	res.clearCookie('access_token').render('despedida.html', {categoriasProcesadasUnicas, modo:req.modo, usuario: req.username, admin: req.admin})
})

// Para recoger datos del formulario de login
router.post('/login', async (req,res) =>{
	const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
	var mensajeError = ""

	const usuario = await Usuarios.find({"username": req.body.usuario})
	if(usuario.length == 0)
		mensajeError = "No hay ningún usuario que se corresponda con el nombre de usuario introducido"
	if(usuario.length > 1)
		mensajeError = "Hay más de un usuario con el nombre de usuario introducido"

	if(mensajeError == ""){
		const esValida = await bcrypt.compare(req.body.contrasena.trim(), usuario[0].password)
		if(esValida){
			const token = jwt.sign({username: usuario[0].name.firstname, admin: usuario[0].admin}, process.env.SECRET_KEY)

			res.cookie("access_token", token, { //cookie en el response
				httpOnly: true,
				secure: process.env.IN === 'production' //en producción, solo con https
			}).render('bienvenida.html', {usuario: usuario[0].name.firstname, mensajeError, categoriasProcesadasUnicas, modo:req.modo, admin: req.admin})
		}else{
			mensajeError = "La contraseña introducida no es correcta"
			res.render('bienvenida.html', {mensajeError, categoriasProcesadasUnicas, modo:req.modo, admin: req.admin})
		}
	}else{
		res.render('bienvenida.html', {mensajeError, categoriasProcesadasUnicas, modo:req.modo, admin: req.admin})
	}
})


export default router