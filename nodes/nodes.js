import PlainDraggable from 'plain-draggable'
import crel from 'crel'
import Cellular from './cellular'
import Random from './random'
//import leaderline from 'leader-line'
//window.leaderline

const area = document.getElementById('area')
const nodeTypes = [Cellular, Random]
const nodes = []
const lines = []

let count = 0
let source = null
let target = null
let line = null
let mouseDiv = crel('div')
mouseDiv.style.position = 'absolute'
area.appendChild(mouseDiv)

const handleMouseMove = (e) => {
	mouseDiv.style.top = e.clientY + 'px'
	mouseDiv.style.left = e.clientX + 'px'
	line.position()
}

const startConnection = (connection) => {
	if (connection.classList.contains('dot-right') && source === null) {
		source = connection
		source.style.backgroundColor = 'red'

		const pos = source.getBoundingClientRect()
		mouseDiv.style.cssText = `position: absolute;top:${pos.y}px;left: ${pos.x}px;background-color: #bbb;width: 2px;height: 2px;`
		line = new LeaderLine(source, mouseDiv)
		area.addEventListener('mousemove', handleMouseMove)
	} else if (
		connection.classList.contains('dot-left') &&
		source !== null &&
		target === null
	) {
		target = connection
		const newLine = new LeaderLine(source, target)
		const targetNode = nodes.find(
			(e) => e.element.id === target.parentElement.parentElement.id
		)
		const sourceNode = nodes.find(
			(e) => (e) => e.element.id === source.parentElement.parentElement.id
		)

		targetNode.draggable.onMove = () => {
			newLine.position()
		}
		sourceNode.draggable.onMove = () => {
			newLine.position()
		}
		lines.push(newLine)

		targetNode.subscribe(sourceNode.topic)

		PubSub.publish(sourceNode.topic, sourceNode.map)
		stopConnection()
	}
}

const stopConnection = () => {
	if (source) source.style.backgroundColor = '#bbb'
	target = null
	source = null
	if (line) {
		area.removeEventListener('mousemove', handleMouseMove)
		line.remove()
		line = null
		return true
	}
}

// event listeners for Crel elements
crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

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
							nodes.push(newNode)
							count++
						},
					},
				},
				node.name
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
			if (e.target.id !== 'area') return
			if (stopConnection()) return
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
