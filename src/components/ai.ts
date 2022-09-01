import {
	Action,
	//MeleeAction,
	MovementAction,
	WaitAction,
} from '../actions/actions'
//import * as ROT from 'rot-js'
import { RNG } from 'rot-js'
import { Entity } from '../entity'
import { Component } from './component'
import { addXY, generateRandomNumber, getRandomDir } from '../utils'

export abstract class AI implements Component {
	data: any
	entity?: Entity
	nextAction?: Action
	lastDir?: Point
	constructor(public aiType: String = 'base') {
		this.data = {}
	}

	update() {
		this.chooseNextAction()
		this.nextAction?.perform(this.entity!, this.entity?.gameMap!)
	}

	chooseNextAction() {
		switch (this.aiType) {
			case 'base':
				this.guard()
		}
	}

	guard() {
		if (!this.data.guard) {
			this.data.guard = { stay: 10, walk: 100, attack: 0 }
		}
		this.nextAction = (() => {
			switch (RNG.getWeightedValue(this.data.guard)) {
				case 'stay':
					return new WaitAction()
				case 'walk':
					//FIXME: doesn't seem to work properly
					if (
						this.lastDir &&
						generateRandomNumber(0, 10) < 8 &&
						this.entity?.gameMap?.isNotBlocked(this.lastDir)
					) {
						return new MovementAction(this.lastDir)
					} else {
						this.lastDir = addXY(this.entity!.pos, getRandomDir())
						return new MovementAction(this.lastDir)
					}
				case 'attack':
					return new WaitAction()
				default:
					return new WaitAction()
			}
		})()

		if (this.nextAction && this.entity) {
			this.nextAction.perform(this.entity, this.entity.gameMap!)
		}
	}
}
