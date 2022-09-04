import PlainDraggable from 'plain-draggable'
import crel from 'crel'

const area = document.getElementById('area')

export class Node {
	element = null
	input = null
	output = null
	map = null
	values = null
	w = 180
	h = 180
	ctx = null
	tokens = []
	onChange = null
	topic = null
	name = 'node'
	body = null
	draggable = null

	constructor(pos, count) {
		this.onChange = {
			change: (e) => {
				this.values[e.target.name] = e.target.valueAsNumber
				this.generateMap()
				this.draw()
			},
		}

		//this.subscribe(node.topic)
	}
	generateMap = (input = null) => {}
	mySubscriber = (msg, data) => {
		this.input = data
		console.log(this.input)
		console.log('asd')
		this.generateMap()
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
		console.log(this.map)
		this.ctx.clearRect(0, 0, this.w, this.h)
		for (let x = 0; x < this.w / 4; x++) {
			for (let y = 0; y < this.h / 4 - 12; y++) {
				if (this.map[x][y] === 1) this.ctx.fillRect(x * 4, y * 4, 4, 4)
			}
		}
	}

	createNodeElement = (pos, canvas, count) => {
		let element = crel(
			'div',
			{ class: 'node', id: `node${count}` },
			crel('div', { class: 'node-header', id: `handle${count}` }, this.name),
			crel(
				'div',
				{ class: 'dots' },
				crel('div', { id: `input${count}`, class: 'dot dot-left' }),
				crel('div', { id: `output${count}`, class: 'dot dot-right' })
			),
			crel('div', { class: 'node-body' }, this.body)
		)
		element.appendChild(canvas)
		element.style.left = pos.x
		element.style.top = pos.y
		area.appendChild(element)
		this.draggable = new PlainDraggable(element, {
			handle: document.getElementById(`handle${count}`),
		})

		//count++

		return element
	}
}
