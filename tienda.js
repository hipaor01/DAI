// tienda.js 
import express from "express"
import nunjucks from "nunjucks"
import session from "express-session"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {  //directorio 'views' para las plantillas HTML
	autoescape: true,
	noCache: IN == 'development', //true para desarrollo, sin cache
	watch: IN == 'development', //reinicio con ctrl s
	express: app
})
app.set('view engine', 'html');

app.use(express.static('public')) //directorio public para archivos
app.use(express.urlencoded({extended: true}))

app.use(session({
	secret: 'my-secret',
	resave: false,
	saveUninitialized: false
}))


//test para el servidor
app.get("/hola", (req,res) => {
	res.send('Hola desde el servidor');
});


app.use(cookieParser())

app.use(express.json())

// middleware de
const autentificacion = (req, res, next) => {
	const token = req.cookies.access_token;
	if(token){
		try{
			const data = jwt.verify(token, process.env.SECRET_KEY);
			req.modo = "Salir"
			req.username = data.username
			if(data.admin === undefined)
				req.admin = false
			else
				req.admin = data.admin
		}catch (error){
			req.modo = "Identificarse"
		}
	}else{
		req.modo = "Identificarse"
	}
	next()
}
app.use(autentificacion)


//Las demas rutas de codigo en el directorio routes
import UsuariosRouter from "./routes/router_usuarios.js"
app.use(UsuariosRouter);


import TiendaRouter from "./routes/router_tienda.js"
app.use(TiendaRouter);




const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
})