import PlainDraggable from 'plain-draggable'
import crel from 'crel'
import Cellular from './cellular'

let count = 0
const area = document.getElementById('area')

// event listeners for Crel elements
crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

const nodeTypes = [Cellular]
const nodes = []

const createLeftClickMenu = (pos) => {
	const els = []
	nodeTypes.forEach((node) => {
		els.push(
			crel(
				'div',
				{
					class: 'menu-item',
					on: {
						click: (e) => {
							nodes.push(
								new Node({ x: e.pageX + 'px', y: e.pageY + 'px' }, node)
								//	createNode({ x: e.pageX + 'px', y: e.pageY + 'px' }, node)
							)
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

class Node {
	element = null
	input = null
	output = null
	map = null
	values = null
	w = 180
	h = 180
	ctx = null
	tokens = []

	constructor(pos, node) {
		this.element = createNode(pos, node, this.createCanvas())
		this.values = node.values
		this.map = node.map
		this.draw()
		node.draw = this.draw
		this.subscribe(node.topic)
	}
	mySubscriber = (msg, data) => {
		this.map = data
		this.draw()
	}

	subscribe = (topic) => {
		this.tokens.push(PubSub.subscribe(topic, this.mySubscriber))
	}

	createCanvas = () => {
		const canvas = document.createElement('canvas')
		canvas.height = this.h
		canvas.width = this.w
		this.ctx = canvas.getContext('2d')

		if (this.ctx) this.ctx.clearRect(0, 0, this.w, this.h)
		return canvas
	}

	draw = () => {
		if (!this.map) return
		this.ctx.clearRect(0, 0, this.w, this.h)
		for (let x = 0; x < this.w / 4; x++) {
			for (let y = 0; y < this.h / 4 - 12; y++) {
				if (this.map[x][y] === 1) this.ctx.fillRect(x * 4, y * 4, 4, 4)
			}
		}
	}
}

const createNode = (pos, node, canvas) => {
	let element = crel(
		'div',
		{ class: 'node' },
		crel('div', { class: 'node-header', id: `handle${count}` }, node.name),
		crel(
			'div',
			{ class: 'dots' },
			crel('div', { class: 'dot-left' }),
			crel('div', { class: 'dot-right' })
		),
		crel('div', { class: 'node-body' }, node.body)
	)
	element.appendChild(canvas)
	element.style.left = pos.x
	element.style.top = pos.y
	area.appendChild(element)
	const draggable = new PlainDraggable(element, {
		handle: document.getElementById(`handle${count}`),
	})
	count++

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
let timer
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
