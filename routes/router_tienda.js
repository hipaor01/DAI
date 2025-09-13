// ./routes/router_tienda.js

import express from "express";
import Productos from "../model/productos.js";
import logger from "../logger.js";
const router = express.Router();

async function obtenerCategoriasUnicas() {
    const categorias = await Productos.find({}, { category: 1, _id: 0 }); // todas las categorías
    const categoriasProcesadas = categorias.map(categoria => categoria.category);
    const categoriasProcesadasUnicas = [...new Set(categoriasProcesadas)]; // categorías sin repeticiones
    return categoriasProcesadasUnicas;
}

async function obtenerTitulos(){
	const titulos = await Productos.find({}, {title: 1, _id: 0}) // todos los títulos
	const titulosProcesados = titulos.map(titulo => titulo.title)
	return titulosProcesados
}

async function obtenerPrecios(){
	const precios = await Productos.find({}, {price: 1, _id: 0}) //todos los precios
	const preciosProcesados = precios.map(precio => precio.price)
	return preciosProcesados
} 

async function obtenerArticulo(idArticulo){
	let articulo = await Productos.findOne({id : parseInt(idArticulo,10)})
	articulo.image = articulo.image.replace('https://fakestoreapi.com/img/', 'imagenesProductos/')
	return articulo
}

async function obtenerArticuloPorTitulo(titulo){
	let articulo = await Productos.findOne({title: titulo})
	articulo.image = articulo.image.replace('https://fakestoreapi.com/img/', 'imagenesProductos/')
	return articulo
}

async function obtenerRatings(desde,hasta){
	let ratings = await Productos.find({}, {title: 1,"rating.rate": 1,  _id: 0})
	let ratingsProcesados = ratings.map(producto => ({ rate: producto.rating.rate, title: producto.title }))
	if(desde >= 0 && hasta >= 0)
		ratingsProcesados = ratingsProcesados.sort((a,b) => b.rate - a.rate).slice(desde,hasta+1)

	return ratingsProcesados
}

async function obtenerRatingArticulo(identificador){
	const producto = await Productos.findOne({id: identificador}, {title: 1,"rating": 1,  _id: 0})
	const ratingProcesado = { rate: producto.rating.rate, title: producto.title, count: producto.rating.count}
	return ratingProcesado
}

function comprobarArticulosSesion(req){
	const articulos = req.session.Articulos || []
	if(articulos.length == 0)
		return false
	else
		return true
}

async function obtenerProductosMayores(){
	const puntuaciones = await Productos.find({},{"rating.rate": 1, _id:0 }) //todas las puntuaciones
	const puntuacionesProcesadas = puntuaciones.map(puntuacion => puntuacion.rating.rate)
	const puntuacionesMayores = puntuacionesProcesadas.sort((a,b) => b - a).slice(0,3)
	const puntuacionesMayoresUnicas = [...new Set(puntuacionesMayores)]
	const productosMayores = await Productos.find({"rating.rate": {$in: puntuacionesMayoresUnicas}});
	const productosMayoresProcesados = productosMayores.map(producto => {
    return {
    	id: producto.id,
      	title: producto.title,
        image: producto.image.replace('https://fakestoreapi.com/img/', 'imagenesProductos/')
    };
	});

	return productosMayoresProcesados
}

router.get('/portada', async (req,res) =>{
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
		const productosMayoresProcesados = await obtenerProductosMayores()
		

		res.render('portada.html', {categoriasProcesadasUnicas,productosMayoresProcesados,hayArticulos:comprobarArticulosSesion(req), modo:req.modo, admin:req.admin});    // ../views/portada.html,
	}catch(err){
		res.status(500).send({err})
	}
})

router.get('/buscarArticulo', async (req,res) =>{
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()

		const cadenaArticulo = req.query.cadenaArticulo
		const productosEncontrados = await Productos.find({
    	$or: [
        	{ title: { $regex: cadenaArticulo, $options: 'i' } },
        	{ description: { $regex: cadenaArticulo, $options: 'i' } }
    	]
		})
		const productosEncontradosProcesados = productosEncontrados.map(producto => {
    	return {
    		id: producto.id,
      		title: producto.title,
        	image: producto.image.replace('https://fakestoreapi.com/img/', 'imagenesProductos/')
    	};
		});

		res.render('articulosBuscados.html', {categoriasProcesadasUnicas,productosEncontradosProcesados,hayArticulos:comprobarArticulosSesion(req), modo:req.modo, admin:req.admin})
	}catch(err){
		res.status(500).send({err})
	}
})


router.get('/mostrarArticulo', async (req,res) =>{
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()

		const identificadorArticulo = req.query.idArticulo
		const productoEncontrado = await obtenerArticulo(identificadorArticulo)
		res.render('mostrarArticulo.html', {categoriasProcesadasUnicas,productoEncontrado,hayArticulos:comprobarArticulosSesion(req), modo:req.modo, admin:req.admin})
	}catch(err){
		res.status(500).send({err})
	}
})

router.post('/anadirCarritoArticulo', async (req,res) =>{
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
		const productosMayoresProcesados = await obtenerProductosMayores()

		const identificadorArticulo = req.body.identificadorArticulo
		const productoEncontrado = await obtenerArticulo(identificadorArticulo)
		if(!req.session.Articulos){
			req.session.Articulos = []
		}

		req.session.Articulos.push(productoEncontrado)
		res.render('portada.html', {categoriasProcesadasUnicas,productosMayoresProcesados,hayArticulos:comprobarArticulosSesion(req), modo:req.modo, admin:req.admin})
	}catch(err){
		res.status(500).send({err})
	}	
})

router.get('/verCarrito', async (req,res) =>{
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
		const articulos = req.session.Articulos || []

		res.render('carrito.html', {categoriasProcesadasUnicas,articulos,hayArticulos:comprobarArticulosSesion(req), modo:req.modo, admin:req.admin})
	}catch(err){
		res.status(500).send({err})
	}
})

router.get('/cambiarProducto', async (req,res) =>{
	var mensajeError = ""
	try{
		const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
		const articulo = await obtenerArticuloPorTitulo(req.query.tituloArticulo)
		res.render('cambiarProducto.html', {categoriasProcesadasUnicas, modo:req.modo, admin:req.admin, articulo, mensajeError})
	}catch(err){
		mensajeError = "Debe introducir un título válido"
		res.render('cambiarProducto.html', {categoriasProcesadasUnicas:[], modo:req.modo, admin:req.admin,articulo:null, mensajeError})
	}
})

router.post('/actualizadoProducto', async (req, res) =>{
	var mensajeError = ""
	try{
	  const categoriasProcesadasUnicas = await obtenerCategoriasUnicas()
	  const tituloNuevo = req.body.tituloNuevo
	  if(!/^[A-Z]/.test(tituloNuevo))
	  	mensajeError = "El título debe empezar por mayúscula"
	  else{
	  	const precioNuevo = req.body.precioNuevo
	  	const tituloActual = req.body.tituloActual
	  	const resultado = await Productos.updateOne({title: tituloActual}, {$set: {title:tituloNuevo, price:precioNuevo}})
	  	if(resultado.modifiedCount != 1)
	  		mensajeError = "Error al actualizar el título y el precio del artículo 2"
	  }
	  res.render('actualizadoProducto.html', {categoriasProcesadasUnicas, modo:req.modo, admin:req.admin, mensajeError})
	}catch(err){
		mensajeError = "Error al actualizar el título y el precio del artículo"
		res.render('actualizadoProducto.html', {categoriasProcesadasUnicas:[], modo:req.modo, admin:req.admin, mensajeError})
	}
})

router.get('/api/ratings/', async (req,res) =>{
	try{
		let desde = -1
		let hasta = -1
		if(req.query.desde && req.query.hasta){
			desde = parseInt(req.query.desde)
			hasta = parseInt(req.query.hasta)

			if(desde < 0 || hasta < 0 || (desde > hasta)){
				res.status(400).json({
					success: false,
					message: 'No pueden ser negativos los valores de desde ni hasta y hasta debe ser mayor o igual que desde'
				})
				logger.error('No pueden ser negativos los valores de desde ni hasta y hasta debe ser mayor o igual que desde')
				return
			}
		}
		const puntuaciones = await obtenerRatings(desde,hasta)
		res.json(puntuaciones)
		logger.info('Las valoraciones han sido devueltas correctamente')
	}catch(err){
		res.status(500).json({
			success: false,
			ḿessage : err.message
		})
	}
})

router.get('/api/ratings/:id', async (req,res) =>{
	try{
		const identificador = parseInt(req.params.id)
		const puntuacion = await obtenerRatingArticulo(identificador)
		if(puntuacion)
			res.json(puntuacion)
		else
			res.status(404).json({
      			success: false,
      			message: 'Artículo no encontrado'
    		})
	}catch(err){
		res.status(500).json({
			success: false,
			ḿessage : err.message
		})
	}
})

router.put('/api/ratings/:id', async (req,res) =>{
	try{
		const identificador = parseInt(req.params.id)
		const {nuevoRate} = req.body
		const puntuacion = await obtenerRatingArticulo(identificador)
		const resultado = await Productos.updateOne({id: identificador}, {$set: {"rating.count": puntuacion.count+1,"rating.rate": nuevoRate}})
	  	if(resultado.modifiedCount != 1)
	  		res.status(404).json({
      			success: false,
      			message: 'Artículo no encontrado'
    		})
	  	else
	  		res.json({"comment": "Artículo actualizado correctamente", "valoracionMedia": nuevoRate, "numeroVotos": puntuacion.count+1})
	}catch(err){
		res.status(500).json({
			success: false,
			ḿessage : err.message
		})
	}
})

export default router