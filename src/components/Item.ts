import { Entity } from '../entity'
import { Component } from './component'

export class Item implements Component {
	entity?: Entity
	constructor(public weight: number = 0, public consumable: boolean = false) {}
	update() {}
	//getAction(): Action | null {}
	//activate(entity: Entity): void {}
}
