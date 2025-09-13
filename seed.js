//seed.js

import {MongoClient} from 'mongodb'
console.log( '🏁 seed.js ----------------->')

//del archivo .env
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS

const urlPropio = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(urlPropio)

//Database Name
const dbName = 'myProject'

//función asíncrona
async function Inserta_datos_en_coleccion(coleccion,url){
	try{
		const datos = await fetch(url).then(res => res.json())

		// ... Insertar datos en la BD aquí

		//Conectarse al servidor
		await client.connect()
		console.log('Conectado a MongoDB')

		//Seleccionar la base de datos
		const db = client.db(dbName)
		//Seleccionar la colección
		const tabla = db.collection(coleccion)

		//Aquí puedes hacer la inserción
		await tabla.insertMany(datos)

		return `${datos.length} datos traidos para ${coleccion}`
	}catch(err){
		err.errorResponse += ` en fetch ${coleccion}`
		throw err
	}
}


//Inserción consecutiva
Inserta_datos_en_coleccion('productos', 'https://fakestoreapi.com/products')
	.then((r)=>console.log(`Todo bien: ${r}`))                          //OK
	.then(()=>Inserta_datos_en_coleccion('usuarios', 'https://fakestoreapi.com/users'))
	.then((r)=>console.log(`Todo bien: ${r}`))                          //OK
	.catch((err)=>console.error('Algo mal: ', err.errorResponse))       //error
	.finally(() => {
		//Cerrar la conexión a MongoDB
		client.close()
		console.log('Conexión a MongoDB cerrada')
		})

console.log('Lo primero que pasa')	