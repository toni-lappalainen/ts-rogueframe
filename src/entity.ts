import { Colors } from './values'
import { Component } from './components/component'
import { GameMap } from './map'
import { componentList, CmpTypes, cmpList } from './components'
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
		public description: string = `It is a ${name}.`,
		public char: string = ' ',
		public renderOrder: RenderOrder = RenderOrder.Corpse,
		public fg: string = Colors.White,
		public bg: string = Colors.Black,
		public blocksMovement: boolean = true,
		public canAct: boolean = true,
		public pos: Point = { x: 0, y: 0 },
		public parent: GameMap | Component | null = null, //Map<string, any> = new Map<string, any>() // FIXME: don't use any
		public cmp: cmpList = {}
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
		for (const cmp of Object.values(this.cmp) as any) {
			cmp.update()
		}
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
	}

	// Component methods

	add = (cmps: CmpTypes[]) => {
		for (let cmp of cmps) {
			cmp.entity = this
			const name = cmp.constructor.name.replace('Cmp', '').toLowerCase()
			this.cmp[name] = cmp
		}
	}

	has = (cmpClass: string) => {
		if (this.cmp[cmpClass.toLowerCase()] !== undefined) return true
		else {
			console.log(`Component ${cmpClass} not found on ${this.name}`)
			return false
		}
	}

	getEffect = (): Effect | null => {
		let component = null
		for (const [key, value] of Object.entries(this.cmp) as [
			string,
			CmpTypes
		][]) {
			if (value instanceof Effect) component = value
		}
		return component
	}

	get = (cmpClass: string) => {
		return this.cmp[`${cmpClass}`] as CmpTypes
	}

	remove = (cmpClass: string) => {
		delete this.cmp[`${cmpClass}`]
	}
}

export const spawnEntity = (
	data: any,
	map: GameMap | null = null,
	position: Point | null = null
) => {
	const {
		name,
		description,
		char,
		renderOrder,
		fg,
		bg,
		blocksMovement,
		canAct,
		pos,
		components,
	} = data
	const entityPos = position ? position : pos
	const entity = new Entity(
		name,
		description,
		char,
		renderOrder,
		fg,
		bg,
		blocksMovement,
		canAct,
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
