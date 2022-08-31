import { Component } from './component'
import { Entity, RenderOrder } from '../entity'

export class BodyCmp implements Component {
	entity?: Entity
	_hp: number

	constructor(
		public maxHp: number = 10,
		public defense: number = 5,
		public power: number = 5,
		public isAlive: boolean = true
	) {
		this._hp = maxHp
		//this.entity = null
	}
	update() {}

	public get hp(): number {
		return this._hp
	}

	public set hp(value: number) {
		this._hp = Math.max(0, Math.min(value, this.maxHp))
		if (this._hp === 0 && this.isAlive) {
			this.die()
		}
	}

	takeDamage(amount: number) {
		this.hp -= amount
	}

	heal(amount: number): number {
		if (this.hp === this.maxHp) return 0

		const newHp = Math.min(this.maxHp, this.hp + amount)
		const amountRecovered = newHp - this.hp
		this.hp = newHp

		return amountRecovered
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
		window.msgLog.addMessage(deathMessage)
	}
}
