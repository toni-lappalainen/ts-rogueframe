import { Component } from './component'
import { Entity } from '../entity'

export class BodyCmp implements Component {
	entity: Entity | null
	_hp: number

	constructor(
		public maxHp: number = 10,
		public defense: number = 5,
		public power: number = 5
	) {
		this._hp = maxHp
		this.entity = null
	}

	public get hp(): number {
		return this._hp
	}

	public set hp(value: number) {
		this._hp = Math.max(0, Math.min(value, this.maxHp))
	}
}
