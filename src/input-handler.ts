import { Entity } from './entity'
import { addXY } from './utils'

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

const MOVE_KEYS: MovementMap = {
	ArrowUp: new MovementAction({ x: 0, y: -1 }),
	ArrowDown: new MovementAction({ x: 0, y: 1 }),
	ArrowLeft: new MovementAction({ x: -1, y: 0 }),
	ArrowRight: new MovementAction({ x: 1, y: 0 }),
}

export const handleInput = (event: KeyboardEvent): Action => {
	return MOVE_KEYS[event.key]
}
