import crel from 'crel'
import { Map } from 'rot-js'
import PubSub from 'pubsub-js'
import { Node } from './nodebase'

crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

class Cellular extends Node {
	constructor(pos, count) {
		super(pos, count)
		this.name = 'Cellular Automata'
		this.values = {
			ratio: 0.4,
			gens: 4,
		}

		this.map = [...Array(this.w / this.dim)].map((e) =>
			Array(this.h / this.dim)
		)
		this.body = crel(
			'div',
			{ class: 'form-wrapper' },
			crel(
				'div',
				{ class: 'input-wrapper' },
				crel('label', { for: `ratio` }, 'ratio: '),
				crel('input', {
					type: 'number',
					name: `ratio`,
					value: this.values.ratio,
					min: 0,
					max: 1.0,
					step: 0.05,
					on: this.onChange,
				})
			),
			crel(
				'div',
				{ class: 'input-wrapper' },
				crel('label', { for: `gens` }, 'generations: '),
				crel('input', {
					type: 'number',
					name: `gens`,
					value: this.values.gens,
					on: this.onChange,
				})
			)
		)
		this.element = this.createNodeElement(pos, this.createCanvas(), count)
		this.generateMap()
		this.draw()
	}

	generateMap = (input = null) => {
		const array = input || this.map
		const map = new Map.Cellular(this.w / this.dim, this.h / this.dim)
		map.randomize(this.values.ratio)
		for (let i = 0; i < this.values.gens; i++) {
			map.create((x, y, value) => {
				array[x][y] = value
			})
		}
		this.map = array
		PubSub.publish(this.topic, array)
		return array
	}
}
export default Cellular
