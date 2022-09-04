import PlainDraggable from 'plain-draggable'
import crel from 'crel'
import Cellular from './cellular'

let count = 0
const area = document.getElementById('area')

let source = null
let target = null

const startConnection = (connection) => {
	if (connection.classList.contains('dot-right') && target === null) {
		target = connection
	} else if (
		connection.classList.contains('dot-left') &&
		target !== null &&
		source === null
	) {
		source = connection
		console.log(`Connected ${target} to ${source}!`)
		stopConnection()
	}
}

const stopConnection = () => {
	target = null
	source = null
}

// event listeners for Crel elements
crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

const nodeTypes = [Cellular]
const nodes = []

const createLeftClickMenu = () => {
	const els = []
	let name = 'node'
	nodeTypes.forEach((node) => {
		els.push(
			crel(
				'div',
				{
					class: 'menu-item',
					on: {
						click: (e) => {
							const newNode = new node(
								{ x: e.pageX + 'px', y: e.pageY + 'px' },
								count
							)
							name = newNode.name
							nodes.push(newNode)
							count++
							console.log(count)
						},
					},
				},
				name
			)
		)
	})

	let element = crel('div', { id: 'menu' }, [...els])
	area.appendChild(element)
	return element
}

//Events for desktop and touch
let events = ['mouseup', 'touchstart']

//initial declaration
var timeout

//for double tap
var lastTap = 0

//refer menu div
let contextMenu = createLeftClickMenu()

const toggleMenu = (e) => {
	//x and y position of mouse or touch
	//mouseX represents the x-coordinate of the mouse
	let mouseX = e.clientX || e.touches[0].clientX
	//mouseY represents the y-coordinate of the mouse.
	let mouseY = e.clientY || e.touches[0].clientY
	//height and width of menu
	//getBoundingClientRect() method returns the size of an element and its position relative to the viewport
	let menuHeight = contextMenu.getBoundingClientRect().height
	let menuWidth = contextMenu.getBoundingClientRect().width
	//width and height of screen
	//innerWidth returns the interior width of the window in pixels
	let width = window.innerWidth
	let height = window.innerHeight
	//If user clicks/touches near right corner
	if (width - mouseX <= 200) {
		contextMenu.style.borderRadius = '5px 0 5px 5px'
		contextMenu.style.left = width - menuWidth + 'px'
		contextMenu.style.top = mouseY + 'px'
		//right bottom
		if (height - mouseY <= 200) {
			contextMenu.style.top = mouseY - menuHeight + 'px'
			contextMenu.style.borderRadius = '5px 5px 0 5px'
		}
	}
	//left
	else {
		contextMenu.style.borderRadius = '0 5px 5px 5px'
		contextMenu.style.left = mouseX + 'px'
		contextMenu.style.top = mouseY + 'px'
		//left bottom
		if (height - mouseY <= 200) {
			contextMenu.style.top = mouseY - menuHeight + 'px'
			contextMenu.style.borderRadius = '5px 5px 5px 0'
		}
	}
	//display the menu
	contextMenu.style.visibility = 'visible'
}
//same function for both events
//event type is a data structure that defines the data contained in an event
events.forEach((eventType) => {
	area.addEventListener(
		eventType,
		(e) => {
			if (contextMenu.style.visibility === 'visible') {
				contextMenu.style.visibility = 'hidden'
				return
			}
			if (e.target.classList.contains('dot')) return startConnection(e.target)
			stopConnection()
			if (e.target.id !== 'area') return
			e.stopPropagation()
			if (e.button === 2) return
			//preventDefault() method stops the default action of a selected element from happening by a user
			//e.preventDefault()
			toggleMenu(e)
		},
		{ passive: false }
	)
})

//for double tap(works on touch devices)
area.addEventListener('touchend', function (e) {
	//current time
	var currentTime = new Date().getTime()
	//gap between two gaps
	var tapLength = currentTime - lastTap
	//clear previous timeouts(if any)
	//The clearTimeout() method clears a timer set with the setTimeout() method.
	clearTimeout(timeout)
	//if user taps twice in 500ms
	if (tapLength < 500 && tapLength > 0) {
		//hide menu
		contextMenu.style.visibility = 'hidden'
		e.preventDefault()
	} else {
		//timeout if user doesn't tap after 500ms
		timeout = setTimeout(function () {
			clearTimeout(timeout)
		}, 500)
	}
	//lastTap set to current time
	lastTap = currentTime
})
