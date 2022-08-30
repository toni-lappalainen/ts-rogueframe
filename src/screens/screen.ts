import { Display } from 'rot-js'
import { Entity } from '../entity'
import { BaseInputHandler } from '../input-handler'

export abstract class BaseScreen {
	abstract inputHandler: BaseInputHandler

	protected constructor(public display: Display, public player: Entity) {}
	generateFloor() {}

	abstract update(event: KeyboardEvent): BaseScreen

	abstract render(): void
}
