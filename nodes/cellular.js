import crel from 'crel'
import { Map } from 'rot-js'
import PubSub from 'pubsub-js'

crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

const values = {
	ratio: 0.4,
	gens: 4,
}

const onChange = {
	change: (e) => {
		values[e.target.name] = e.target.valueAsNumber
		console.log(values)
		Cellular.generateMap()
	},
}

const body = crel(
	'div',
	crel('label', { for: `ratio` }, 'ratio: '),
	crel('input', {
		type: 'number',
		name: `ratio`,
		value: values.ratio,
		on: onChange,
	}),
	crel('label', { for: `gens` }, 'generations: '),
	crel('input', {
		type: 'number',
		name: `gens`,
		value: values.gens,
		on: onChange,
	})
)

const Cellular = {
	body: body,
	name: 'Cellular Automata',
	values: values,
	draw: null,
	topic: 'cellular:render',
	map: [...Array(180 / 4)].map((e) => Array(180 / 4)),

	generateMap: (input) => {
		const array = input || Cellular.map
		const map = new Map.Cellular(180 / 8, 180 / 8)
		map.randomize(values.ratio)
		for (let i = 0; i < values.gens; i++) {
			map.create((x, y, value) => {
				array[x + 10][y + 10] = value
			})
		}
		Cellular.map = array
		PubSub.publish(Cellular.topic, array)
		return array
	},
}
Cellular.generateMap()
export default Cellular
