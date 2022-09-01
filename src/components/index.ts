import { BodyCmp } from './body'
import { Fireball, Healing, Lightning } from './effects'
import { Item } from './Item'
import { Inventory } from './inventory'
import { Exp } from './exp'
import { Equippable, Equipment } from './equips'
import { AI } from './ai'

export type CmpTypes = InstanceType<typeof componentList[number]>

//  Index types use to combine for final type
type WithRequiredSignature = {
	[key: `${string}`]: CmpTypes
}
type WithOptionalSignature = {
	body?: BodyCmp
	inventory?: Inventory
	item?: Item
	healing?: Healing
	lightning?: Lightning
	fireball?: Fireball
	exp?: Exp
	equippable?: Equippable
	equipment?: Equipment
	ai?: AI
}

export type cmpList = WithRequiredSignature & WithOptionalSignature

export const componentList = [
	BodyCmp,
	Inventory,
	Item,
	Healing,
	Lightning,
	Fireball,
	Exp,
	Equippable,
	Equipment,
	AI,
]
