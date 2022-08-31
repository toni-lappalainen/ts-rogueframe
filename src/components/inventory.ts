import { Component } from './component'
import { Entity } from '../entity'
import { GameMap } from '../map'

export class Inventory implements Component {
	entity?: Entity
	items: Entity[]

	constructor(public capacity: number) {
		this.items = []
	}

	update() {}

	drop(item: Entity, gameMap: GameMap) {
		const index = this.items.indexOf(item)
		if (index >= 0) {
			this.items.splice(index, 1)
			if (this.entity) {
				item.place(this.entity.pos, gameMap)
			}
			window.msgLog.addMessage(
				`${this.entity?.name} dropped the ${item.name}."`
			)
		}
	}
}
