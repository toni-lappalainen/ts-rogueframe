import { Entity } from './entity'
import { Engine } from './engine'
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
import { Display } from 'rot-js'

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
const MOVE_KEYS: DirectionMap = {
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
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
	mousePosition: Point
	//logCursorPosition: number
	protected constructor(public inputState: InputState = InputState.Game) {
		this.nextHandler = this
		this.mousePosition = { x: 0, y: 0 }
		//this.logCursorPosition = window.engine.messageLog.messages.length - 1
	}

	abstract handleKeyboardInput(event: KeyboardEvent): Action | null
	handleMouseMovement(position: Point) {
		this.mousePosition = position
	}
	onRender(_display: Display) {}
}

export class GameInputHandler extends BaseInputHandler {
	constructor() {
		super()
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (window.engine.player.cmp.body?.isAlive) {
			if (event.key in MOVE_KEYS) {
				const dir = MOVE_KEYS[event.key]
				return new BumpAction(dir)
			}
			if (event.key === 'm') {
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
			if (event.key === 'l') {
				this.nextHandler = new LookHandler()
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
export abstract class SelectIndexHandler extends BaseInputHandler {
	protected constructor() {
		super(InputState.Target)
		const x = window.engine.player.pos.x
		const y = window.engine.player.pos.y
		this.mousePosition = { x: x, y: y }
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (event.key in MOVE_KEYS) {
			const moveAmount = MOVE_KEYS[event.key]
			let modifier = 1
			if (event.shiftKey) modifier = 5
			if (event.ctrlKey) modifier = 10
			if (event.altKey) modifier = 20

			// FIXME: make this cleaner
			let x = this.mousePosition.x
			let y = this.mousePosition.y
			let dx = moveAmount.x
			let dy = moveAmount.y
			x += dx * modifier
			y += dy * modifier
			x = Math.max(0, Math.min(x * modifier, Engine.MAP_WIDTH - 1))
			y = Math.max(0, Math.min(y * modifier, Engine.MAP_HEIGHT - 1))
			this.mousePosition = { x: x, y: y }
			return null
		} else if (event.key === 'Enter') {
			return this.onIndexSelected(this.mousePosition)
		}

		this.nextHandler = new GameInputHandler()
		return null
	}

	abstract onIndexSelected(targetPos: Point): Action | null
}
type ActionCallback = (pos: Point) => Action | null

export class LookHandler extends SelectIndexHandler {
	constructor() {
		super()
	}

	onIndexSelected(_targetPos: Point): Action | null {
		this.nextHandler = new GameInputHandler()
		return null
	}
}

export class SingleRangedAttackHandler extends SelectIndexHandler {
	constructor(public callback: ActionCallback) {
		super()
	}

	onIndexSelected(targetPos: Point): Action | null {
		this.nextHandler = new GameInputHandler()
		return this.callback(targetPos)
	}
}

export class AreaRangedAttackHandler extends SelectIndexHandler {
	constructor(public radius: number, public callback: ActionCallback) {
		super()
	}

	onRender(display: Display) {
		const startX = this.mousePosition.x - this.radius - 1
		const startY = this.mousePosition.y - this.radius - 1

		for (let x = startX; x < startX + this.radius ** 2; x++) {
			for (let y = startY; y < startY + this.radius ** 2; y++) {
				const data = display._data[`${x},${y}`]
				const char = data ? data[2] || ' ' : ' '
				display.drawOver(x, y, char[0], '#fff', Colors.BrownYellow)
			}
		}
	}

	onIndexSelected(targetPos: Point): Action | null {
		this.nextHandler = new GameInputHandler()
		return this.callback(targetPos)
	}
}
