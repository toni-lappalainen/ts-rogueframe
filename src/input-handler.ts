import { Entity } from './entity'
import { Engine } from './engine'
import { getCircle, isEqual, multiplyXY, addXY } from './utils'
import { renderFrameWithTitle, renderNamesAtLocation } from './render'
import { Colors } from './values'
import {
	Action,
	BumpAction,
	DropItem,
	EquipAction,
	PickupAction,
	TakeStairsAction,
	WaitAction,
} from './actions/actions'
import { Display } from 'rot-js'
import { GameMap } from './map'

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
export const DIR: DirectionMap = {
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
}

export enum Direction {
	Up = 'UP',
	Down = 'DOWN',
	Left = 'LEFT',
	Right = 'RIGHT',
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
	logCursorPosition: number
	protected constructor(public inputState: InputState = InputState.Game) {
		this.nextHandler = this
		this.mousePosition = { x: 0, y: 0 }
		this.logCursorPosition = window.msgLog.messages.length - 1
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
			if (event.key in DIR) {
				const dir = DIR[event.key]
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
			if (event.key === 'c') {
				this.nextHandler = new CharacterScreenInputHandler()
			}
			if (event.key === '>') {
				return new TakeStairsAction()
			}
		}

		return null
	}
}
export class CharacterScreenInputHandler extends BaseInputHandler {
	constructor() {
		super()
	}

	onRender(display: Display) {
		const x = window.engine.player.pos.x <= 30 ? 40 : 1
		const y = 1
		const title = 'Character Information'
		const width = title.length + 10
		const height = 20

		renderFrameWithTitle(x, y, width, height, title)

		const content = `%c{${Colors.BrownLight}}Level: ${window.engine.player.cmp.exp?.currentLevel}
XP: ${window.engine.player.cmp.exp?.currentXp}
XP for next Level: ${window.engine.player.cmp.exp?.experienceToNextLevel}
Attack: ${window.engine.player.cmp.body?.power}
Defense: ${window.engine.player.cmp.body?.defense}`

		display.drawText(x + 2, y + 2, content)
	}
	handleKeyboardInput(_event: KeyboardEvent): Action | null {
		this.nextHandler = new GameInputHandler()
		return null
	}
}

export class NewGameInputHandler extends BaseInputHandler {
	constructor() {
		super()
	}

	onRender(display: Display) {
		const title = 'New Game'
		const width = title.length + 10
		const height = 20

		renderFrameWithTitle(25, 25, width, height, title)
		display.drawText(27, 27, 'derp')
	}
	handleKeyboardInput(_event: KeyboardEvent): Action | null {
		this.nextHandler = new GameInputHandler()
		return null
	}
}

export class LogInputHandler extends BaseInputHandler {
	constructor() {
		super(InputState.Log)
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (event.key === 'Home') {
			return new LogAction(() => (this.logCursorPosition = 0))
		}
		if (event.key === 'End') {
			return new LogAction(
				() => (this.logCursorPosition = window.msgLog.messages.length - 1)
			)
		}

		const scrollAmount = LOG_KEYS[event.key]

		if (!scrollAmount) {
			this.nextHandler = new GameInputHandler()
		}

		return new LogAction(() => {
			if (scrollAmount < 0 && this.logCursorPosition === 0) {
				this.logCursorPosition = window.msgLog.messages.length - 1
			} else if (
				scrollAmount > 0 &&
				this.logCursorPosition === window.msgLog.messages.length - 1
			) {
				this.logCursorPosition = 0
			} else {
				this.logCursorPosition = Math.max(
					0,
					Math.min(
						this.logCursorPosition + scrollAmount,
						window.msgLog.messages.length - 1
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
						if (item.cmp.item?.consumable) {
							const action = item.getEffect()?.getAction()
							if (action) return action
						} else if (item.cmp.equippable) {
							return new EquipAction(item)
						}
						return null
					} else if (this.inputState === InputState.DropInventory) {
						return new DropItem(item)
					}
				} else {
					window.msgLog.addMessage('Invalid entry.', Colors.Gray)
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

export const handleMouse = (
	event: MouseEvent,
	pos: Point = { x: 0, y: 0 },
	gameMap: GameMap
) => {
	// Map inputs
	if (gameMap.isInBounds(pos) && gameMap.tiles[pos.y][pos.x].visible) {
		if (event.button === 0) {
			const entities = gameMap.entities.filter((e) => isEqual(e.pos, pos))
			if (entities.length) renderNamesAtLocation(pos, entities)
		}
	}
}
export abstract class SelectIndexHandler extends BaseInputHandler {
	protected constructor() {
		super(InputState.Target)
		this.mousePosition = window.engine.player.pos
	}

	handleKeyboardInput(event: KeyboardEvent): Action | null {
		if (event.key in DIR) {
			const moveAmount = DIR[event.key]
			let modifier = 1
			// FIXME: Doesn't work
			if (event.shiftKey) modifier = 5
			if (event.ctrlKey) modifier = 10
			if (event.altKey) modifier = 20

			const pos = addXY(this.mousePosition, multiplyXY(moveAmount, modifier))
			pos.x = Math.max(0, Math.min(pos.x * modifier, Engine.MAP_WIDTH - 1))
			pos.y = Math.max(0, Math.min(pos.y * modifier, Engine.MAP_HEIGHT - 1))
			this.mousePosition = pos
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
		getCircle(this.mousePosition, this.radius).forEach((coord) => {
			display.drawOver(coord.x, coord.y, null, '#fff', Colors.BrownYellow)
		})

		const startX = this.mousePosition.x - this.radius
		const startY = this.mousePosition.y - this.radius

		display.drawOver(
			this.mousePosition.x,
			this.mousePosition.y,
			'X',
			'#fff',
			null
		)
	}

	onIndexSelected(targetPos: Point): Action | null {
		this.nextHandler = new GameInputHandler()
		return this.callback(targetPos)
	}
}
