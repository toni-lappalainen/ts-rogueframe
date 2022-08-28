import { Entity } from '../entity'
import { Action, ItemAction } from '../actions/actions'
import { Colors } from '../values'
import { Component } from './component'
import { Inventory } from './inventory'

export interface Effect extends Component {
	activate: (entity: Entity) => void
	uses: number
}
export class Healing implements Effect {
	entity: Entity | null

	constructor(public amount: number, public uses: number = 1) {
		this.entity = null
	}

	update() {}

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
		if (this.uses <= 0 && item && item.get('item').consumable) {
			const inventory = item.parent
			if (inventory instanceof Inventory) {
				const index = inventory.items.indexOf(item)
				if (index >= 0) {
					inventory.items.splice(index, 1)
				}
			}
		}
	}

	activate(entity: Entity) {
		const consumer = entity as Entity
		if (!consumer) return

		const amountRecovered = consumer.get('body').heal(this.amount)

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
