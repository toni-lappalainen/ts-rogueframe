import { Entity } from './entity'
import { addXY, isEqual } from './utils'
import { renderNamesAtLocation } from './render'
import { Colors } from './values'
import {
	Action,
	BumpAction,
	DropItem,
	PickupAction,
	WaitAction,
} from './actions/actions'

interface MovementMap {
	[key: string]: Action
}

interface LogMap {
	[key: string]: number
}
const LOG_KEYS: LogMap = {
	ArrowUp: -1,
	ArrowDown: 1,
	PageDown: 10,
	PageUp: -10,
}

interface DirectionMap {
	[key: string]: Point
}

export enum InputState {
	Game,
	Dead,
	Log,
	UseInventory,
	DropInventory,
	Target,
}

export abstract class BaseInputHandler {
	nextHandler: BaseInputHandler
	protected constructor(public inputState: InputState = InputState.Game) {
		this.nextHandler = this
	}

	abstract handleKeyboardInput(event: KeyboardEvent): Action | null
}

export class GameInputHandler extends BaseInputHandler {
	MOVE_KEYS: DirectionMap
	constructor() {
		super()
		this.MOVE_KEYS = {
			ArrowUp: { x: 0, y: -1 },
			ArrowDown: { x: 0, y: 1 },
			ArrowLeft: { x: -1, y: 0 },
			ArrowRight: { x: 1, y: 0 },
		}
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (window.engine.player.cmp.body?.isAlive) {
			if (event.key in this.MOVE_KEYS) {
				const dir = this.MOVE_KEYS[event.key]
				return new BumpAction(dir)
			}
			if (event.key === 'l') {
				this.nextHandler = new LogInputHandler()
			}
			if (event.key === '5' || event.key === '.') {
				return new WaitAction()
			}
			if (event.key === 'g') {
				return new PickupAction()
			}
			if (event.key === 'i') {
				this.nextHandler = new InventoryInputHandler(InputState.UseInventory)
			}
			if (event.key === 'd') {
				this.nextHandler = new InventoryInputHandler(InputState.DropInventory)
			}
		}

		return null
	}
}

export class LogInputHandler extends BaseInputHandler {
	constructor() {
		super(InputState.Log)
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (event.key === 'Home') {
			return new LogAction(() => (window.engine.logCursorPosition = 0))
		}
		if (event.key === 'End') {
			return new LogAction(
				() =>
					(window.engine.logCursorPosition =
						window.engine.messageLog.messages.length - 1)
			)
		}

		const scrollAmount = LOG_KEYS[event.key]

		if (!scrollAmount) {
			this.nextHandler = new GameInputHandler()
		}

		return new LogAction(() => {
			if (scrollAmount < 0 && window.engine.logCursorPosition === 0) {
				window.engine.logCursorPosition =
					window.engine.messageLog.messages.length - 1
			} else if (
				scrollAmount > 0 &&
				window.engine.logCursorPosition ===
					window.engine.messageLog.messages.length - 1
			) {
				window.engine.logCursorPosition = 0
			} else {
				window.engine.logCursorPosition = Math.max(
					0,
					Math.min(
						window.engine.logCursorPosition + scrollAmount,
						window.engine.messageLog.messages.length - 1
					)
				)
			}
		})
	}
}
export class InventoryInputHandler extends BaseInputHandler {
	constructor(inputState: InputState) {
		super(inputState)
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (event.key.length === 1) {
			const ordinal = event.key.charCodeAt(0)
			const index = ordinal - 'a'.charCodeAt(0)

			if (index >= 0 && index <= 26) {
				const item = window.engine.player.cmp.inventory?.items[index]
				console.log(item)
				if (item) {
					this.nextHandler = new GameInputHandler()
					if (this.inputState === InputState.UseInventory) {
						const action = item.getEffect()?.getAction()
						if (action) return action
					} else if (this.inputState === InputState.DropInventory) {
						return new DropItem(item)
					}
				} else {
					window.engine.messageLog.addMessage('Invalid entry.', Colors.Gray)
					return null
				}
			}
		}
		this.nextHandler = new GameInputHandler()
		return null
	}
}

export class LogAction extends Action {
	constructor(public moveLog: () => void) {
		super()
	}

	perform(_entity: Entity) {
		this.moveLog()
	}
}

export const handleMouse = (event: MouseEvent, pos: Point = { x: 0, y: 0 }) => {
	// Map inputs
	if (
		window.engine.gameMap.isInBounds(pos) &&
		window.engine.gameMap.tiles[pos.y][pos.x].visible
	) {
		if (event.button === 0) {
			const entities = window.engine.gameMap.entities.filter((e) =>
				isEqual(e.pos, pos)
			)
			if (entities.length) renderNamesAtLocation(pos, entities)
		}
	}
}
