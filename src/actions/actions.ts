import { Entity } from '../entity'
import { addXY, isEqual } from '../utils'
import { ImpossibleException } from '../messagelog'

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
			throw new ImpossibleException('That way is blocked.')
		}
		if (!window.engine.gameMap.tiles[this.dir.y][this.dir.x].walkable) {
			throw new ImpossibleException('That way is blocked.')
		}
		if (window.engine.gameMap.getBlockingEntityAtLocation(this.dir)) {
			throw new ImpossibleException('That way is blocked.')
		}

		entity.move(this.dir)
	}
}
export class MeleeAction extends ActionWithDirection {
	perform(entity: Entity) {
		const target = window.engine.gameMap.getBlockingEntityAtLocation(this.dir)

		if (!target) {
			throw new ImpossibleException('Nothing to attack.')
		}
		window.msgLog.addMessage(
			`${entity.name} kicks the ${target.name}, much to its annoyance!`
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
	constructor(
		public item: Entity | null,
		public targetPosition: Point | null = null
	) {
		super()
	}

	perform(entity: Entity) {
		const effect = this.item?.getEffect()
		if (this.item && effect) effect.activate(this, entity)
		else throw new ImpossibleException(`Cannot use ${this.item?.name}`)
	}

	public get targetActor(): Entity | undefined {
		if (!this.targetPosition) {
			return
		}
		return window.engine.gameMap.getEntityAtLocation(this.targetPosition)
	}
}

export class DropItem extends ItemAction {
	perform(entity: Entity) {
		const dropper = entity
		if (!dropper || !this.item) return
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
					throw new ImpossibleException('Your inventory is full.')
				}

				window.engine.gameMap.removeEntity(item)
				item.parent = inventory
				inventory.items.push(item)

				window.msgLog.addMessage(`You picked up the ${item.name}!`)
				return
			}
		}
		throw new ImpossibleException('There is nothing here to pick up.')
	}
}
