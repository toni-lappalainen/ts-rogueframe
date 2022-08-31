import { Entity } from '../entity'

export interface Component {
	entity?: Entity
	update: () => void
}

/*
export abstract class Component implements IComponent{
	constructor(public entity: Entity | null) {}
	abstract update(): void
}
*/
