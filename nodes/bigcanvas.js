import crel from 'crel'
import PubSub from 'pubsub-js'
import { Node } from './nodebase'

crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

class BigCanvas extends Node {
	constructor(pos, count) {
		super(pos, count)
		this.w = 510
		this.h = 510
		this.dim = 6
		this.name = 'Big Canvas'

		this.map = [...Array(this.w / this.dim)].map((e) =>
			Array(this.h / this.dim)
		)
		this.body = crel('div')
		this.element = this.createNodeElement(pos, this.createCanvas(), count)
		this.element.classList.add('node-big-canvas')
		this.draw()
	}

	generateMap = () => {
		this.map = [...Array(this.w / this.dim)].map((e) =>
			Array(this.h / this.dim)
		)
		if (this.input) this.map = this.input
	}
}
export default BigCanvas
