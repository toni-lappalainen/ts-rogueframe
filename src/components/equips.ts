import { Entity } from '../entity'
import { Component } from './component'

export enum EquipmentType {
	Weapon,
	Armor,
}

type Slot = {
	[slotName: string]: Entity | null
}

export class Equipment implements Component {
	entity?: Entity
	slots: Slot

	constructor(weapon: Entity, armor: Entity) {
		this.slots = {
			weapon,
			armor,
		}
	}
	update() {}

	itemIsEquipped(item: Entity): boolean {
		return this.slots['weapon'] === item || this.slots['armor'] === item
	}

	unequipMessage(itemName: string) {
		window.msgLog.addMessage(`You remove the ${itemName}.`)
	}

	equipMessage(itemName: string) {
		window.msgLog.addMessage(`You equip the ${itemName}.`)
	}

	equipToSlot(slot: string, item: Entity, addMessage: boolean) {
		const currentItem = this.slots[slot]
		if (currentItem) {
			this.unequipFromSlot(slot, addMessage)
		}
		this.slots[slot] = item

		if (addMessage) {
			this.equipMessage(item.name)
		}
	}

	unequipFromSlot(slot: string, addMessage: boolean) {
		const currentItem = this.slots[slot]
		if (addMessage && currentItem) {
			this.unequipMessage(currentItem.name)
		}
		this.slots[slot] = null
	}

	toggleEquip(item: Entity, addMessage: boolean = true) {
		let slot = 'armor'
		if (
			item.cmp.equippable &&
			item.cmp.equippable.equipmentType === EquipmentType.Weapon
		) {
			slot = 'weapon'
		}

		if (this.slots[slot] === item) {
			this.unequipFromSlot(slot, addMessage)
		} else {
			this.equipToSlot(slot, item, addMessage)
		}
	}
}

export abstract class Equippable implements Component {
	entity?: Entity

	constructor(
		public equipmentType: EquipmentType,
		public powerBonus: number = 0,
		public defenseBonus: number = 0
	) {}
	update() {}
}

export class Dagger extends Equippable {
	constructor() {
		super(EquipmentType.Weapon, 2)
	}
}

export class Sword extends Equippable {
	constructor() {
		super(EquipmentType.Weapon, 4)
	}
}

export class LeatherArmor extends Equippable {
	constructor() {
		super(EquipmentType.Armor, 0, 1)
	}
}

export class ChainMail extends Equippable {
	constructor() {
		super(EquipmentType.Armor, 0, 3)
	}
}
