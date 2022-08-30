import { Component } from './component'
import { Entity } from '../entity'

export class Inventory implements Component {
	entity: Entity | null
	items: Entity[]

	constructor(public capacity: number) {
		this.entity = null
		this.items = []
	}

	update() {}

	drop(item: Entity) {
		const index = this.items.indexOf(item)
		if (index >= 0) {
			this.items.splice(index, 1)
			if (this.entity) {
				item.place(this.entity.pos, window.engine.gameMap)
			}
			window.msgLog.addMessage(
				`${this.entity?.name} dropped the ${item.name}."`
			)
		}
	}
}
