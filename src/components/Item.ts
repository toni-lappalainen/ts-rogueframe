import { Entity } from '../entity'
import { Component } from './component'

export class Item implements Component {
	entity: Entity | null
	constructor(public weight: number = 0, public consumable: boolean = false) {
		this.entity = null
	}
	update() {}
	//getAction(): Action | null {}
	//activate(entity: Entity): void {}
}
