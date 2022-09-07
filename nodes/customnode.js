import crel from 'crel'
import Sandbox from 'websandbox'
import CodeFlask from 'codeflask'
import { Node } from './nodebase'

crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

class Custom extends Node {
	constructor(pos, count) {
		super(pos, count)
		this.name = 'Customizer'
		this.editor = crel('div', { id: 'editor' })
		this.body = crel(
			'div',
			{ class: 'node-big-canvas' },
			crel(
				'button',
				{
					name: `runButton`,
					on: {
						click: () => {
							this.generateMap()
							this.draw()
						},
					},
				},
				'Generate'
			),
			crel(
				'button',
				{
					name: `hideButton`,
					on: {
						click: () => {
							const cnode = document.getElementById('editor')
							if (cnode.style.height === '400px') {
								cnode.style.height = '34px'
								cnode.style.width = '340px'
							} else {
								cnode.style.height = '400px'
								cnode.style.width = '340px'
							}
						},
					},
				},
				'Toggle editor'
			),

			this.editor
		)

		this.element = this.createNodeElement(pos, this.createCanvas(), count)
		this.element.classList.add('node-big-canvas')
		this.flask = new CodeFlask(this.editor, {
			language: 'js',
			defaultTheme: false,
			lineNumbers: true,
		})
		this.flask.updateCode(
			`for (let x = 0; x < ${this.w / this.dim}; x++) {
	for (let y = 0; y < ${this.h / this.dim}; y++) {
		if (x % 2 === 0) map[x][y] = 1
	}
}`
		)

		this.generateMap()
		this.draw()
	}

	generateMap = () => {
		/*this.map = [...Array(this.w / this.dim)].map((e) =>
			Array(this.h / this.dim)
		)*/
		this.map = Array.from(Array(this.w), (_) => Array(this.h).fill(0))
		if (this.input) this.map = this.input
		const mapString = JSON.stringify(this.map)
		const flaskCode = this.flask.getCode()

		const localApi = {
			getMap: (message) => {
				console.log(JSON.parse(message))
				this.map = JSON.parse(message)
				this.draw()
			},
		}
		const sandbox = Sandbox.create(localApi)

		//const map = [...Array(${w})].map((e) => Array(${h}))
		sandbox.promise.then(() => {
			return sandbox.run(`
						const map = ${mapString}
						${flaskCode}
            Websandbox.connection.remote.getMap(JSON.stringify(map));
				`)
		})
	}
}
export default Custom
