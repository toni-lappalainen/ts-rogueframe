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
		super(pos)
		this.name = 'Cellular Automata'
		this.topic = 'cellular:render'
		this.values = {
			ratio: 0.4,
			gens: 4,
		}

		this.map = [...Array(180 / 4)].map((e) => Array(180 / 4))
		this.body = crel(
			'div',
			crel('label', { for: `ratio` }, 'ratio: '),
			crel('input', {
				type: 'number',
				name: `ratio`,
				value: this.values.ratio,
				min: 0,
				max: 1.0,
				step: 0.05,
				on: this.onChange,
			}),
			crel('label', { for: `gens` }, 'generations: '),
			crel('input', {
				type: 'number',
				name: `gens`,
				value: this.values.gens,
				on: this.onChange,
			})
		)
		this.element = this.createNodeElement(pos, this.createCanvas(), count)
		this.generateMap()
		this.draw()
	}

	generateMap = (input = null) => {
		const array = input || this.map
		const map = new Map.Cellular(180 / 4, 180 / 4)
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
