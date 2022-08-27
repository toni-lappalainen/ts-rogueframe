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
		console.log(this.dir)
		const direction = addXY(entity.pos, this.dir)
		console.log(direction)

		if (!window.engine.gameMap.isInBounds(direction.x, direction.y)) return
		if (!window.engine.gameMap.tiles[direction.y][direction.x].walkable) return
		if (
			window.engine.gameMap.getBlockingEntityAtLocation(
				direction.x,
				direction.y
			)
		)
			return
		entity.move(this.dir)
	}
}
/*
export class MeleeAction extends ActionWithDirection {
	perform(entity: Entity) {
		const dest = { x: entity.pos.x + this.d.x, y: entity.pos.y + this.d.y }

		const target = window.engine.gameMap.getBlockingEntityAtLocation(dest)

		if (!target) return

		console.log(`You kick the ${target.name}, much to its annoyance!`)
	}
}*/
/*
export class BumpAction extends ActionWithDirection {
	perform(entity: Entity) {
		const destX = entity.x + this.dx
		const destY = entity.y + this.dy

		if (window.engine.gameMap.getBlockingEntityAtLocation(destX, destY)) {
			return new MeleeAction(this.dx, this.dy).perform(entity)
		} else {
			return new MovementAction(this.dx, this.dy).perform(entity)
		}
	}
}
*/
const MOVE_KEYS: MovementMap = {
	ArrowUp: new MovementAction({ x: 0, y: -1 }),
	ArrowDown: new MovementAction({ x: 0, y: 1 }),
	ArrowLeft: new MovementAction({ x: -1, y: 0 }),
	ArrowRight: new MovementAction({ x: 1, y: 0 }),
}

export const handleInput = (event: KeyboardEvent): Action => {
	return MOVE_KEYS[event.key]
}
