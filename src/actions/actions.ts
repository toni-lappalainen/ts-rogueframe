import { Entity, serializeEntity } from '../entity'
import { addXY, isEqual } from '../utils'
import { ImpossibleException } from '../messagelog'
import { GameMap } from '../map'
import { Colors } from '../values'

export abstract class Action {
	abstract perform(entity: Entity, gameMap: GameMap): void
}

export abstract class ActionWithDirection extends Action {
	constructor(public dir: Point) {
		super()
	}

	perform(entity: Entity, gameMap: GameMap) {}
}

export class WaitAction extends Action {
	perform(_entity: Entity) {
		console.log(`${_entity.name} is waiting.`)
	}
}

export class MovementAction extends ActionWithDirection {
	perform(entity: Entity, gameMap: GameMap) {
		if (!gameMap.isInBounds(this.dir)) {
			throw new ImpossibleException('That way is blocked.')
		}
		if (!gameMap.tiles[this.dir.y][this.dir.x].walkable) {
			throw new ImpossibleException('That way is blocked.')
		}
		if (gameMap.getBlockingEntityAtLocation(this.dir)) {
			throw new ImpossibleException('That way is blocked.')
		}

		entity.move(this.dir)
	}
}
export class MeleeAction extends ActionWithDirection {
	perform(entity: Entity, gameMap: GameMap) {
		const target = gameMap.getBlockingEntityAtLocation(this.dir)

		if (!target) {
			throw new ImpossibleException('Nothing to attack.')
		}
		window.msgLog.addMessage(
			`${entity.name} kicks the ${target.name}, much to its annoyance!`
		)
	}
}

export class BumpAction extends ActionWithDirection {
	perform(entity: Entity, gameMap: GameMap) {
		const direction = addXY(entity.pos, this.dir)

		if (gameMap.getBlockingEntityAtLocation(direction)) {
			return new MeleeAction(direction).perform(entity, gameMap)
		} else {
			return new MovementAction(direction).perform(entity, gameMap)
		}
	}
}

export class TakeStairsAction extends Action {
	perform(entity: Entity, gameMap: GameMap) {
		if (isEqual(entity.pos, gameMap.downstairsLocation)) {
			window.engine.screen.generateFloor()
			window.msgLog.addMessage('You descend the staircase.', Colors.BrownLight)
		} else {
			throw new ImpossibleException('There are no stairs here.')
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

	perform(entity: Entity, gameMap: GameMap) {
		const effect = this.item?.getEffect()
		if (this.item && effect) effect.activate(this, entity, gameMap)
		else throw new ImpossibleException(`Cannot use ${this.item?.name}`)
	}

	targetActor(gameMap: GameMap): Entity | undefined {
		if (!this.targetPosition) {
			return
		}
		return gameMap.getEntityAtLocation(this.targetPosition)
	}
}

export class DropItem extends ItemAction {
	perform(entity: Entity, gameMap: GameMap) {
		const dropper = entity
		if (!dropper || !this.item) return
		dropper.cmp.inventory?.drop(this.item, gameMap)

		if (dropper.cmp.equipment?.itemIsEquipped(this.item)) {
			dropper.cmp.equipment.toggleEquip(this.item)
		}
	}
}

export class PickupAction extends Action {
	perform(entity: Entity, gameMap: GameMap) {
		const consumer = entity
		if (!consumer) return

		const pos = consumer.pos
		const inventory = consumer.cmp.inventory
		if (!inventory) return

		for (const item of gameMap.items) {
			if (isEqual(pos, item.pos)) {
				if (inventory.items.length >= inventory.capacity) {
					throw new ImpossibleException('Your inventory is full.')
				}

				gameMap.removeEntity(item)
				item.parent = inventory
				inventory.items.push(item)

				window.msgLog.addMessage(`You picked up the ${item.name}!`)

				return
			}
		}
		throw new ImpossibleException('There is nothing here to pick up.')
	}
}

export class EquipAction extends Action {
	constructor(public item: Entity) {
		super()
	}

	perform(entity: Entity, _gameMap: GameMap) {
		if (!entity) return
		entity.cmp.equipment?.toggleEquip(this.item)
	}
}
