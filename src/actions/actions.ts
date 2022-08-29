import { Entity } from '../entity'
import { addXY, isEqual } from '../utils'
import { Colors } from '../values'

export abstract class Action {
	abstract perform(entity: Entity): void
}

export abstract class ActionWithDirection extends Action {
	constructor(public dir: Point) {
		super()
	}

	perform(_entity: Entity) {}
}

export class WaitAction extends Action {
	perform(_entity: Entity) {}
}

export class MovementAction extends ActionWithDirection {
	perform(entity: Entity) {
		if (!window.engine.gameMap.isInBounds(this.dir)) {
			window.engine.messageLog.addMessage('That way is blocked.', Colors.Gray)
			return
			//throw new Error('That way is blocked.')
		}
		if (!window.engine.gameMap.tiles[this.dir.y][this.dir.x].walkable) {
			window.engine.messageLog.addMessage('That way is blocked.', Colors.Gray)
			return //throw new Error('That way is blocked.')
		}
		if (window.engine.gameMap.getBlockingEntityAtLocation(this.dir)) {
			window.engine.messageLog.addMessage('That way is blocked.', Colors.Gray)
			return
			//throw new Error('That way is blocked.')
		}

		entity.move(this.dir)
	}
}
export class MeleeAction extends ActionWithDirection {
	perform(entity: Entity) {
		const target = window.engine.gameMap.getBlockingEntityAtLocation(this.dir)

		if (!target) {
			window.engine.messageLog.addMessage('Nothing to attack', Colors.Gray)
			throw new Error('Nothing to attack.')
		}
		window.engine.messageLog.addMessage(
			`${entity.name} kick the ${target.name}, much to its annoyance!`
		)
	}
}

export class BumpAction extends ActionWithDirection {
	perform(entity: Entity) {
		const direction = addXY(entity.pos, this.dir)

		if (window.engine.gameMap.getBlockingEntityAtLocation(direction)) {
			return new MeleeAction(direction).perform(entity)
		} else {
			return new MovementAction(direction).perform(entity)
		}
	}
}

export class ItemAction extends Action {
	constructor(public item: Entity) {
		super()
	}

	perform(entity: Entity) {
		const effect = this.item.getEffect()
		if (effect) effect.activate(entity)
		else console.log('no effect')
	}
}

export class DropItem extends ItemAction {
	perform(entity: Entity) {
		const dropper = entity
		if (!dropper) return
		dropper.cmp.inventory?.drop(this.item)
	}
}

export class PickupAction extends Action {
	perform(entity: Entity) {
		const consumer = entity
		if (!consumer) return

		const pos = consumer.pos
		const inventory = consumer.cmp.inventory
		if (!inventory) return

		for (const item of window.engine.gameMap.items) {
			if (isEqual(pos, item.pos)) {
				if (inventory.items.length >= inventory.capacity) {
					window.engine.messageLog.addMessage(
						`${consumer.name}'s inventory is full.`,
						Colors.Gray
					)
					throw new Error('Your inventory is full.')
				}

				window.engine.gameMap.removeEntity(item)
				item.parent = inventory
				inventory.items.push(item)

				window.engine.messageLog.addMessage(
					`${consumer.name} picked up the ${item.name}!`
				)
				return
			}
		}

		window.engine.messageLog.addMessage(
			'There is nothing here to pick up.',
			Colors.Gray
		)
		throw new Error('There is nothing here to pick up.')
	}
}
