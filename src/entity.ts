import { Colors } from './values'
import { Component, componentList } from './components/component'

export enum RenderOrder {
	Corpse,
	Item,
	Actor,
	Player,
}

export class Entity {
	readonly id: string
	constructor(
		public name: string = '<Unnamed>',
		public char: string = ' ',
		public renderOrder: RenderOrder = RenderOrder.Corpse,
		public fg: string = Colors.White,
		public bg: string = Colors.Black,
		public blocksMovement: boolean = true,
		public pos: Point = { x: 0, y: 0 },
		private components: Map<string, any> = new Map<string, any>() // FIXME: don't use any
	) {
		this.char = char
		this.pos = pos
		this.fg = fg
		this.bg = bg
		this.id = crypto.randomUUID()
	}

	add = (cmps: Component[]) => {
		for (let cmp of cmps) {
			cmp.entity = this
			const name = cmp.constructor.name.replace('Cmp', '').toLocaleLowerCase()
			this.components.set(name, cmp)
		}
	}

	has = (cmpClass: string) => {
		if (this.components.has(cmpClass)) return true
		else {
			console.log(`Component ${cmpClass} not found on ${this.name}`)
			return false
		}
	}

	get = (cmpClass: string) => {
		return this.components.get(cmpClass)
	}

	remove = (cmpClass: string) => {
		this.components.delete(cmpClass)
	}

	move(dir: Point) {
		this.pos.x += dir.x
		this.pos.y += dir.y
	}
}

export const spawnEntity = (data: any) => {
	const { name, char, renderOrder, fg, bg, blocksMovement, pos, components } =
		data
	const entity = new Entity(
		name,
		char,
		renderOrder,
		fg,
		bg,
		blocksMovement,
		pos
	)

	const entityCmps = []
	for (const [key, value] of Object.entries(components)) {
		const cmp = componentList.find((c) => c.name === key)
		if (cmp) {
			entityCmps.push(new cmp(...Object.values(value as number)))
		}
	}
	entity.add(entityCmps)

	return entity
}

const serializeEntity = (entity: Entity) => {
	return JSON.stringify(entity, (key, value) => {
		console.log(value)
		if (key === 'entity') return value.id
		if (value instanceof Map) {
			return {
				dataType: 'Map',
				value: Array.from(value.entries()),
			}
		} else return value
	})
}
