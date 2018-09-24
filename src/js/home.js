(async function load() {

	// Traer info de peliculas, mediante api
	async function getData(url) {
	const response = await fetch(url)
	const data = await response.json()
	return data
	}

	function setAttributes($element, attributes) {
		for( const attribute in attributes ) {
			$element.setAttribute(attribute, attributes[attribute])
		}
	}


	const $form = document.getElementById('form')
	const $home = document.getElementById('home')
	const $featuringContainer = document.getElementById('featuring')

	const BASE_API = 'https://yts.am/api/v2/'

	function featuringTemplate(movie) {
		return(`
			<div class="featuring">
				<div class="featuring-image">
				<img src="${movie.medium_cover_image}" width="70" height="100" alt="${movie.title} | ${movie.year}">
				</div>
				<div class="featuring-content">
				<p class="featuring-title">Pelicula encontrada</p>
				<p class="featuring-album">${movie.title}</p>
				</div>
			</div>
		`)
	}
	function movieNotFound() {
		return(`
			<div class="featuring">
				<div class="featuring-content">
					<h1 class="featuring-title">Pelicula no encontrada</h1>
				</div>
			</div>
		`)
	}

	$form.addEventListener('submit', async (event) => {
		event.preventDefault()
		$home.classList.add('search-active')
		const $loader = document.createElement('img')
		setAttributes($loader, {
			src: './src/images/loader.gif',
			height: 50,
			width: 50,
		})
		$featuringContainer.append($loader)

		const data = new FormData($form)
		const {
			data: {
				movies: Movie
			}
		} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
		// debugger

		try {
			const HTMLString = featuringTemplate(Movie[0])
			$featuringContainer.innerHTML = HTMLString
		} catch(e) {
			const HTMLString = movieNotFound()
			$featuringContainer.innerHTML = HTMLString
			console.log(e);
		}
		// if(Movie == undefined) {
			// const HTMLString = movieNotFound()
			// $featuringContainer.innerHTML = HTMLString
		// } else {
			// const HTMLString = featuringTemplate(Movie[0])
			// $featuringContainer.innerHTML = HTMLString
		// }
	})

		// Colocar data en DIV para mostrar

	function videoItemTemplate (movie, category) {
	return(`<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
			<div class="primaryPlaylistItem-image">
			  <img src="${movie.medium_cover_image}" alt="${movie.title} | ${movie.year}">
			</div>
			<h4 class="primaryPlaylistItem-title">
			  ${movie.title}
			</h4>
		</div>`)
	}

	function createTemplate (HTMLString) {
			const html = document.implementation.createHTMLDocument()
			html.body.innerHTML = HTMLString
			return html.body.children[0]
	}

	function addEventClick($element) {
		$element.addEventListener('click', () => {
			showModal($element)
		})
	}

	function renderMovieList (list, $container, category) {
		$container.children[0].remove()
		
		list.forEach((movie) => {
			const HTMLString = videoItemTemplate(movie, category)
			const movieElement = createTemplate(HTMLString)
			$container.append(movieElement)
			const image = movieElement.querySelector('img')
			image.addEventListener( 'load', (event) => {
				event.srcElement.classList.add('fadeIn')
			})
			addEventClick(movieElement)
		})
	}

	// Parts of Modal
	const $overlay = document.getElementById('overlay')
	const $modal = document.getElementById('modal')
	const $hideModal = document.getElementById('hide-modal')

	// Modal Container Selectors
	const $modalTitle = $modal.querySelector('h1')
	const $modalImg = $modal.querySelector('img')
	const $modalDescription = $modal.querySelector('p')

	function showModal($element) {
		$overlay.classList.add('active')
		$overlay.style.animation = 'opal .4s forwards'
		$modal.style.animation = 'modalIn .8s forwards'

		const id = ~~($element.dataset.id)
		const category = $element.dataset.category
		const data = findMovie(id, category)

		$modalTitle.textContent = data.title
		$modalImg.setAttribute('src', data.medium_cover_image)
		$modalDescription.textContent = data.description_full
		// $overlay.classList.add('active')

	}


	$hideModal.addEventListener('click', hideModal)
	function hideModal() {
		$modal.style.animation = 'modalOut .7s forwards'
		$overlay.style.animation = 'endOpal 1s forwards'
		// $modal.addEventListener('animationend', () => )
		setTimeout(() => $overlay.classList.remove('active'), 1000)
		// $modal.removeEventListener('animationend', () => {})
	}

	async function cacheExist (category) {
		const listName = `${category}List`
		const cache = window.localStorage.getItem(listName)
		if(cache) {
			return JSON.parse(cache)
		}
		const { data: { movies: data } } = await  getData(`${BASE_API}list_movies.json?genre=${category}`)
		localStorage.setItem(listName, JSON.stringify(data))
		return data
	}

	const $actionContainer = document.querySelector('#action')
	// const { data: { movies: actionList} } = await  getData(`${BASE_API}list_movies.json?genre=action`)
	const actionList = await cacheExist('action')
	// window.localStorage.setItem('actionList', JSON.stringify(actionList))
	renderMovieList(actionList, $actionContainer, 'action')

	const $dramaContainer = document.querySelector('#drama')
	const dramaList = await cacheExist('drama')
	// const { data: { movies: dramaList } } = await getData(`${BASE_API}list_movies.json?genre=drama`)
	// window.localStorage.setItem('dramaList', JSON.stringify(dramaList))
	renderMovieList(dramaList, $dramaContainer, 'drama')

	const $animationContainer = document.getElementById('animation')
	const animationList = await cacheExist('animation')
	// const { data: { movies: animationList } } = await getData(`${BASE_API}list_movies.json?genre=animation`)
	// window.localStorage.setItem('animationList', JSON.stringify(animationList))
	renderMovieList(animationList, $animationContainer, 'animation')


	



	function findById(list, id) {
		// debugger
		return list.find( movie => movie.id === id)
	}

	function findMovie(id, category) {
		switch (category) {
			case 'action': {
				return findById(actionList, id)
			}

			case 'drama': {
				return findById(dramaList, id)
			}

			default: {
				return findById(animationList, id)
			}
		}
	}




	// console.log('Action list:', actionList)
	// console.log('Drama list:', dramaList)
	// console.log('Animation list:', animationList)
})()
	// getData('https://yts.am/api/v2/list_movies.json?genre=terror')
	// .then((data) => {
	// 	terrorList = data
	// 	console.log('Terror list: ', terrorList)
	// })

// fetch('https://randomuser.me/api/')
// 	.then((data) => {
// 		// console.log(data)
// 		// Retornar JSON en Promesa()
// 		return response = data.json()
// 	})
// 	.then((data) => {
// 		console.log(`User:`, data.results[0].name.first)
// 	})
// 	.catch((err) => console.log(err));

// const getUser = new Promise((response, reject) => {
// 	// Llamar a un API
// 	setTimeout(() => {
// 		reject('Todo esta Ok')
// 	}, 5500)
// })


// const getUserAll = new Promise((response, reject) => {
// 	// Llamar a un API
// 	setTimeout(() => {
// 		response('Todo bien')
// 	}, 3500)
// })

// Promise.race([
// 	getUser,
// 	getUserAll
// ])
// .then((message) => console.log(message))
// .catch((err) => {
// 	console.log(`Erro: ${err}`)
// })

// $.ajax('https://randomuser.me/api/', {
// 	'method': 'GET',
// 	success: function (data) {
// 		console.log(data)
// 	},
// 	error: function (err) {
// 		console.log(err)
// 	}
// })