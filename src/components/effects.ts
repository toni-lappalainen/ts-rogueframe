import { Entity } from '../entity'
import { Action, ItemAction } from '../actions/actions'
import { Colors } from '../values'
import { getDistance } from '../utils'
import { Component } from './component'
import { Inventory } from './inventory'

export abstract class Effect implements Component {
	protected constructor(
		public entity: Entity | null,
		public uses: number = 1
	) {}
	update() {}
	abstract activate(entity: Entity): void

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

	activate(entity: Entity) {
		const consumer = entity as Entity
		const body = consumer.cmp.body
		if (!consumer || !body) return
		const amountRecovered = body.heal(this.amount)

		if (amountRecovered > 0) {
			window.engine.messageLog.addMessage(
				`${entity.name} consumes the ${this.entity?.name}, and recovers ${amountRecovered} HP!`,
				Colors.Green
			)
			this.consume()
		} else {
			window.engine.messageLog.addMessage(
				'Your health is already full.',
				Colors.Gray
			)
			throw new Error('Your health is already full.')
		}
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

	activate(entity: Entity) {
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
			window.engine.messageLog.addMessage(
				`A lightning bolt strikes the ${target.name} with a loud thunder, for ${this.damage} damage!`
			)
			target.cmp.body?.takeDamage(this.damage)
			this.consume()
		} else {
			window.engine.messageLog.addMessage('No enemy is close enough to strike.')
			throw new Error('No enemy is close enough to strike.')
		}
	}
}
