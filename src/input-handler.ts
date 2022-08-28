import { Entity } from './entity'
import { addXY, isEqual } from './utils'
import { GameState } from './engine'
import { renderNamesAtLocation } from './render'

export interface Action {
	perform: (entity: Entity) => void
}

interface MovementMap {
	[key: string]: Action
}

export abstract class ActionWithDirection implements Action {
	constructor(public dir: Point) {}

	perform(_entity: Entity) {}
}

export class WaitAction implements Action {
	perform(_entity: Entity) {}
}

export class MovementAction extends ActionWithDirection {
	perform(entity: Entity) {
		const direction = addXY(entity.pos, this.dir)

		if (!window.engine.gameMap.isInBounds(direction)) return
		if (!window.engine.gameMap.tiles[direction.y][direction.x].walkable) return
		if (window.engine.gameMap.getBlockingEntityAtLocation(direction)) return
		entity.move(this.dir)
	}
}
export class MeleeAction extends ActionWithDirection {
	perform(entity: Entity) {
		const dest = addXY(entity.pos, this.dir)

		const target = window.engine.gameMap.getBlockingEntityAtLocation(dest)

		if (!target) return

		console.log(`You kick the ${target.name}, much to its annoyance!`)
	}
}

export class BumpAction extends ActionWithDirection {
	perform(entity: Entity) {
		const dest = addXY(entity.pos, this.dir)

		if (window.engine.gameMap.getBlockingEntityAtLocation(dest)) {
			return new MeleeAction(dest).perform(entity)
		} else {
			return new MovementAction(dest).perform(entity)
		}
	}
}

export class LogAction implements Action {
	perform(_entity: Entity) {
		window.engine.state = GameState.Log
	}
}

const MOVE_KEYS: MovementMap = {
	ArrowUp: new MovementAction({ x: 0, y: -1 }),
	ArrowDown: new MovementAction({ x: 0, y: 1 }),
	ArrowLeft: new MovementAction({ x: -1, y: 0 }),
	ArrowRight: new MovementAction({ x: 1, y: 0 }),
	l: new LogAction(),
}

interface LogMap {
	[key: string]: number
}
const LOG_KEYS: LogMap = {
	ArrowUp: -1,
	ArrowDown: 1,
	PageDown: 10,
	PageUp: -10,
}

export const handleMouse = (event: MouseEvent, pos: Point = { x: 0, y: 0 }) => {
	// Map inputs
	if (
		window.engine.gameMap.isInBounds(pos) &&
		window.engine.gameMap.tiles[pos.y][pos.x].visible
	) {
		if (event.button === 0) {
			const entities = window.engine.gameMap.entities.filter((e) =>
				isEqual(e.pos, pos)
			)
			if (entities.length) renderNamesAtLocation(pos, entities)
		}
	}
}

export const handleInput = (event: KeyboardEvent): Action => {
	return MOVE_KEYS[event.key]
}

export const handleLogInput = (event: KeyboardEvent): number => {
	if (event.key === 'Home') {
		window.engine.logCursorPosition = 0
		return 0
	}
	if (event.key === 'End') {
		window.engine.logCursorPosition =
			window.engine.messageLog.messages.length - 1
		return 0
	}

	const scrollAmount = LOG_KEYS[event.key]

	if (!scrollAmount) {
		window.engine.state = GameState.Game
		return 0
	}
	return scrollAmount
}
