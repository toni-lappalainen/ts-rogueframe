import { Colors } from './values'
import { Component } from './components/component'
import { GameMap } from './map'
import { componentList } from './components'
import { Effect } from './components/effects'

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
		public parent: GameMap | Component | null = null,
		private components: Map<string, any> = new Map<string, any>() // FIXME: don't use any
	) {
		if (this.parent && this.parent instanceof GameMap) {
			this.parent.entities.push(this)
		}
		this.char = char
		this.pos = pos
		this.fg = fg
		this.bg = bg
		this.id = crypto.randomUUID()
	}

	public get gameMap(): GameMap | undefined {
		if (this.parent instanceof GameMap) return this.parent?.gameMap
		else return undefined
	}

	update() {
		this.components.forEach((value) => {
			value.update()
		})
	}
	place(pos: Point, gameMap: GameMap | undefined) {
		this.pos = pos
		if (gameMap) {
			if (this.parent) {
				if (this.parent === gameMap) {
					gameMap.removeEntity(this)
				}
			}
			this.parent = gameMap
			gameMap.entities.push(this)
		}
	}

	move(dir: Point) {
		this.pos = dir
		//this.pos.x += dir.x
		//this.pos.y += dir.y
	}

	// Component methods

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

	getEffect = (): Effect | null => {
		let component = null
		this.components.forEach((cmp) => {
			if (typeof cmp.activate === 'function') component = cmp
		})
		return component
	}

	get = (cmpClass: string) => {
		return this.components.get(cmpClass)
	}

	remove = (cmpClass: string) => {
		this.components.delete(cmpClass)
	}
}

export const spawnEntity = (
	data: any,
	map: GameMap | null = null,
	position: Point | null = null
) => {
	const { name, char, renderOrder, fg, bg, blocksMovement, pos, components } =
		data
	const entityPos = position ? position : pos
	const entity = new Entity(
		name,
		char,
		renderOrder,
		fg,
		bg,
		blocksMovement,
		entityPos,
		map
	)

	const entityCmps = []
	for (const [key, value] of Object.entries(components)) {
		const cmp: any = componentList.find((c) => c.name === key)
		if (cmp) {
			entityCmps.push(new cmp(...Object.values(value as any)))
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
