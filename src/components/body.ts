import { Component } from './component'
import { Entity, RenderOrder } from '../entity'

export class BodyCmp implements Component {
	entity: Entity | null
	_hp: number

	constructor(
		public maxHp: number = 10,
		public defense: number = 5,
		public power: number = 5,
		public isAlive: boolean = true
	) {
		this._hp = maxHp
		this.entity = null
	}

	public get hp(): number {
		return this._hp
	}

	public set hp(value: number) {
		this._hp = Math.max(0, Math.min(value, this.maxHp))
		if (this._hp === 0 && this.isAlive) {
			this.die()
		}
	}

	die() {
		if (!this.entity) return

		let deathMessage = ''
		if (window.engine.player === this.entity) {
			deathMessage = 'You died!'
		} else {
			deathMessage = `${this.entity.name} is dead!`
		}

		this.entity.char = '%'
		this.entity.fg = '#bf0000'
		this.entity.blocksMovement = false
		//this.entity.ai = null
		this.entity.name = `Remains of ${this.entity.name}`
		this.entity.renderOrder = RenderOrder.Corpse

		console.log(deathMessage)
	}
}
