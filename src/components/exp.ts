import { Component } from './component'
import { Entity } from '../entity'

export class Exp implements Component {
	entity?: Entity
	constructor(
		public levelUpBase: number = 0,
		public xpGiven: number = 0,
		public currentLevel: number = 1,
		public currentXp: number = 0,
		public levelUpFactor: number = 200
	) {}

	update() {}

	public get experienceToNextLevel(): number {
		return this.levelUpBase + this.currentLevel * this.levelUpFactor
	}

	public get requiresLevelUp(): boolean {
		return this.currentXp > this.experienceToNextLevel
	}

	addXp(xp: number) {
		if (xp === 0 || this.levelUpBase === 0) return

		this.currentXp += xp

		window.msgLog.addMessage(`You gain ${xp} experience points.`)

		if (this.requiresLevelUp) {
			window.msgLog.addMessage(`You advance to level ${this.currentLevel + 1}`)
			this.increaseLevel()
		}
	}

	private increaseLevel() {
		this.currentXp -= this.experienceToNextLevel
		this.currentLevel++
	}
}
