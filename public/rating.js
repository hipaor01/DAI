// rating.js
// se ejecuta cuando la pagina esta completamente cargada

document.addEventListener('DOMContentLoaded', async () =>{
	console.log('Iniciando fetch ...')
	const ele_starts = document.getElementsByClassName('starts')

	for(const ele of ele_starts){
		const ide = ele.dataset._id 
		const ratingData = await fetch('/api/ratings/' + ide).then(response => response.json())
		const valoracion = ratingData.rate

		cambiarEstrellas(valoracion, ele)
	}

	/*
	for(const ele_hijo of ele_starts[0].children){
		ele_hijo.addEventListener('click', Vota)
	}
	*/
})

async function Vota(evt, valoracionAntigua){
	try{
		const ide = evt.target.parentElement.dataset._id
		const pun = evt.target.dataset.star

		cambiarEstrellas(pun, evt.target.parentElement)

		const ratingData = await fetch('/api/ratings/' + ide, {
			method: 'PUT',
			headers:{
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ nuevoRate: pun })
		}).then(response => response.json())

		const valoracionMedia = document.getElementById("valoracionMedia")
		valoracionMedia.textContent = "Valoración Media: " + ratingData.valoracionMedia
	
		const numValoraciones = document.getElementById("numValoraciones")
		numValoraciones.textContent = "Número de Valoraciones: " + ratingData.numeroVotos

	}catch(err){
		cambiaEstrellas(valoracionAntigua, evt.target.parentElement)
	}
}

function cambiarEstrellas(valoracion, ele){
		ele.innerHTML = ''

		const estrellasCompletas = Math.floor(valoracion)
		const mediaEstrella = valoracion % 1 >= 0.5
		const maximoEstrellas = 5

		for(let i = 0; i < estrellasCompletas; i++)
			ele.innerHTML += `<span class="fa fa-star checked" data-star="${i + 1}" onclick="Vota(event,${valoracion})"></span>`

		
		if(mediaEstrella)
			ele.innerHTML += `<span class="fa fa-star-half checked" data-star="${estrellasCompletas+1}" onclick="Vota(event,${valoracion})"></span>`


		for(let i = estrellasCompletas + (mediaEstrella ? 1 : 0); i < maximoEstrellas; i++)
			ele.innerHTML += `<span class="fa fa-star" data-star="${i + 1}" onclick="Vota(event,${valoracion})"></span>`
}