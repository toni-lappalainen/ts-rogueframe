import crel from 'crel'
import PubSub from 'pubsub-js'
import { Node } from './nodebase'
import { generateRandomNumber, getRandomDir } from '../src/utils'

crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

class Random extends Node {
	constructor(pos, count) {
		super(pos, count)
		this.name = 'Randomizer'
		//this.topic = 'random:render'
		this.values = {
			random: 30,
		}

		this.map = [...Array(180 / 4)].map((e) => Array(180 / 4))
		this.body = crel(
			'div',
			crel('label', { for: `random` }, 'random: '),
			crel('input', {
				type: 'number',
				name: `random`,
				value: this.values.random,
				min: 0,
				max: 100,
				step: 1,
				on: this.onChange,
			})
		)
		this.element = this.createNodeElement(pos, this.createCanvas(), count)
		this.generateMap()
		this.draw()
	}

	generateMap = () => {
		this.map = [...Array(180 / 4)].map((e) => Array(180 / 4))
		if (this.input) this.map = this.input
		const array = this.map
		console.log(this.input)
		for (let x = 0; x < 180 / 4; x++) {
			for (let y = 0; y < 180 / 4; y++) {
				if (generateRandomNumber(0, 99) < this.values.random) array[x][y] = 1
			}
		}
		//console.log(array)
		//this.map = array
		//PubSub.publish(this.topic, array)
		//return array
	}
}
export default Random
