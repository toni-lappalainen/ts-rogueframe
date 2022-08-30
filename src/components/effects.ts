import { Entity } from '../entity'
import { Action, ItemAction } from '../actions/actions'
import { Colors } from '../values'
import { getDistance } from '../utils'
import { Component } from './component'
import { Inventory } from './inventory'
import { ImpossibleException } from '../messagelog'
import { AreaRangedAttackHandler } from '../input-handler'

export abstract class Effect implements Component {
	protected constructor(
		public entity: Entity | null,
		public uses: number = 1
	) {}
	update() {}
	abstract activate(action: ItemAction, entity: Entity): void

	getAction(): Action | null {
		if (this.entity) {
			return new ItemAction(this.entity)
		}
		return null
	}

	consume() {
		--this.uses
		const item = this.entity
		// If effect is in consumable item, remove the item when there are no more uses
		if (this.uses <= 0 && item && item.cmp.item?.consumable) {
			const inventory = item.parent
			if (inventory instanceof Inventory) {
				const index = inventory.items.indexOf(item)
				if (index >= 0) {
					inventory.items.splice(index, 1)
				}
			}
		}
	}
}

export class Healing extends Effect {
	constructor(
		public amount: number = 1,
		public entity: Entity | null = null,
		public uses: number = 1
	) {
		super(entity, uses)
	}

	activate(action: ItemAction, entity: Entity) {
		const consumer = entity as Entity
		const body = consumer.cmp.body
		if (!consumer || !body) return
		const amountRecovered = body.heal(this.amount)

		if (amountRecovered > 0) {
			window.msgLog.addMessage(
				`${entity.name} consumes the ${this.entity?.name}, and recovers ${amountRecovered} HP!`,
				Colors.Green
			)
			this.consume()
		} else {
			throw new ImpossibleException('Your health is already full.')
		}
	}
}

export class Fireball extends Effect {
	constructor(
		public damage: number,
		public radius: number,
		parent: Entity | null = null
	) {
		super(parent)
	}

	activate(action: ItemAction, _entity: Entity) {
		const { targetPosition } = action

		if (!targetPosition) {
			throw new ImpossibleException('You must select an area to target.')
		}
		const targetPos = targetPosition
		if (!window.engine.gameMap.tiles[targetPos.y][targetPos.x].visible) {
			throw new ImpossibleException(
				'You cannot target an area that you cannot see.'
			)
		}

		let targetsHit = false
		for (let actor of window.engine.gameMap.actors) {
			if (getDistance(actor.pos, targetPos) <= this.radius) {
				window.msgLog.addMessage(
					`The ${actor.name} is engulfed in a fiery explosion, taking ${this.damage} damage!`
				)
				actor.cmp.body?.takeDamage(this.damage)
				targetsHit = true
			}

			if (!targetsHit) {
				throw new ImpossibleException('There are no targets in the radius.')
			}
			this.consume()
		}
	}

	getAction(): Action | null {
		window.msgLog.addMessage('Select a target location.', Colors.Yellow)
		window.engine.inputHandler = new AreaRangedAttackHandler(
			this.radius,
			(pos) => {
				return new ItemAction(this.entity, pos)
			}
		)
		return null
	}
}

export class Lightning extends Effect {
	constructor(
		public damage: number = 1,
		public maxRange: number = 10,
		public entity: Entity | null = null,
		public uses: number = 1
	) {
		super(entity, uses)
	}

	activate(action: ItemAction, entity: Entity) {
		let target: Entity | null = null
		let closestDistance = this.maxRange + 1.0

		for (const actor of window.engine.gameMap.actors) {
			if (
				!Object.is(actor, entity) &&
				window.engine.gameMap.tiles[actor.pos.y][actor.pos.x].visible
			) {
				const distance = getDistance(entity.pos, actor.pos)
				if (distance < closestDistance) {
					target = actor
					closestDistance = distance
				}
			}
		}

		if (target) {
			window.msgLog.addMessage(
				`A lightning bolt strikes the ${target.name} with a loud thunder, for ${this.damage} damage!`
			)
			target.cmp.body?.takeDamage(this.damage)
			this.consume()
		} else {
			throw new ImpossibleException('No enemy is close enough to strike.')
		}
	}
}
