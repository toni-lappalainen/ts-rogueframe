import { Entity } from '../entity'
import { BodyCmp } from './body'

export interface Component {
	entity: Entity | null
}

export const componentList = [BodyCmp]
