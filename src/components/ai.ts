import {
	Action,
	//MeleeAction,
	MovementAction,
	WaitAction,
} from '../input-handler'
//import * as ROT from 'rot-js'
import { Path } from 'rot-js'
import { Entity } from '../entity'

export abstract class BaseAI implements Action {
	path: [number, number][]

	constructor() {
		this.path = []
	}

	perform(_entity: Entity) {}

	/**
	 * Compute and return a path to the target position.
	 *
	 * If there is no valid path then return an empty list.
	 *
	 * @param destX
	 * @param destY
	 * @param entity
	 */
	calculatePathTo(destX: number, destY: number, entity: Entity) {
		const isPassable = (x: number, y: number) =>
			window.engine.gameMap.tiles[y][x].walkable
		const dijkstra = new Path.Dijkstra(destX, destY, isPassable, {})

		this.path = []

		dijkstra.compute(entity.pos.x, entity.pos.y, (x: number, y: number) => {
			this.path.push([x, y])
		})
		this.path.shift()
	}
}

export class HostileEnemy extends BaseAI {
	constructor() {
		super()
	}

	perform(entity: Entity) {
		const target = window.engine.player
		const dx = target.pos.x - entity.pos.x
		const dy = target.pos.y - entity.pos.y
		const distance = Math.max(Math.abs(dx), Math.abs(dy))

		if (window.engine.gameMap.tiles[entity.pos.y][entity.pos.x].visible) {
			if (distance <= 1) {
				//	return new MeleeAction(dx, dy).perform(entity)
			}
			this.calculatePathTo(target.pos.x, target.pos.y, entity)
		}

		if (this.path.length > 0) {
			const [destX, destY] = this.path[0]
			this.path.shift()
			return new MovementAction({
				x: destX - entity.pos.x,
				y: destY - entity.pos.y,
			}).perform(entity)
		}

		return new WaitAction().perform(entity)
	}
}
