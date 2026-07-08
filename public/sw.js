
importScripts('/src/js/sw-utils.js');

const STATIC_CACHE = 'static-1v';
const DYNAMIC_CACHE = 'dynamic-1v';
const INMUTABLE_CACHE = 'inmutable-1v';


const APP_SHELL = [
	'/',
	'index.html',
	'style.css',
	'css/favicon.ico',
	'img/avatars/hul.jpg',
	'img/avatars/ironman.jpg',
	'img/avatars/spiderman.jpg',
	'img/avatars/thor.jpg',
	'img/avatars/wolverine.jpg',
	'js/app.js',
	'js/sw-utils.js'
];
const APP_SHELL_INMUTABLE = [
	'https://fonts.googleapis.com/css?family=Quicksand:300,400',
	'https://fonts.googleapis.com/css?family=Lato:400,300',
	'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
	'css/animate.css',
	'js/libs/jquery.js'
]


//Intalación del SW
self.addEventListener('install', e => {

	const cacheStatic = caches.open( STATIC_CACHE ).then( cache => 
		cache.addAll( APP_SHELL ));
	const cacheInmutable = caches.open( INMUTABLE_CACHE ).then( cache => {
		return Promise.all(
				APP_SEHLL_INMUTABLE.map( url => {
					//Si es local, normal. externa no-cors
					if( url.startsWith('http')){
						return cache.add( new Request(url, { mode: 'no-cors'}));
					}else{
						return cache.add( url );
					}
				})
			)
	}).catch( err => {console.log('Fallo cache inmutable', err)})



		// cache.addAll( APP_SEHLL_INMUTABLE ));


	e.waitUntil(Promise.all([ cacheStatic, cacheInmutable]));
});

//Borrar caches viejos

self.addEventListener('activate', e => {

	const resp = caches.keys().then(keys => {

		keys.forEach(key => {
			if( key != STATIC_CACHE && key.includes('static')){
				return caches.delete(key);
			}
		})
	})
	e.waitUntil( resp);
});

//Estrategia cache con Netfall

self.addEventListener('fetch', e => {
	const resp = caches.match( e.request ).then( resp => {
		if( resp ){
			return resp;
		}else{
			console.log( e.request.url );
			return fetch( e.request ).then( newRes => {
				return actualizarCacheDinamico( DYNAMIC_CACHE, e.request, newRes)
			})
		}
	})

	e.respondWith(resp);
})



