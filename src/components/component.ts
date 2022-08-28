import { Entity } from '../entity'

export interface Component {
	entity: Entity | null
	update: () => void
}
