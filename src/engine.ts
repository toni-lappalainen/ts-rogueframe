import * as ROT from 'rot-js'

import {
	BaseInputHandler,
	GameInputHandler,
	InputState,
	handleMouse,
} from './input-handler'
import { Action } from './actions/actions'
import { Entity } from './entity'
import { GameMap } from './map'
import { generateDungeon } from './procgen'
import { renderFrameWithTitle, renderHearts, renderInventory } from './render'
import { MessageLog, ImpossibleException } from './messagelog'
import { Colors } from './values'

export class Engine {
	public static readonly WIDTH = 80
	public static readonly HEIGHT = 50
	public static readonly MAP_WIDTH = 80
	public static readonly MAP_HEIGHT = 43
	public static readonly MAX_ROOMS = 6
	public static readonly MIN_ROOM_SIZE = 3
	public static readonly MAX_ROOM_SIZE = 23
	public static readonly MAX_MONSTERS_PER_ROOM = 2
	public static readonly MAX_ITEMS_PER_ROOM = 2

	display: ROT.Display
	inputHandler: BaseInputHandler
	gameMap: GameMap
	player: Entity
	messageLog: MessageLog
	mousePosition: Point
	logCursorPosition: number

	constructor(player: Entity) {
		this.inputHandler = new GameInputHandler()
		this.logCursorPosition = 0
		this.display = new ROT.Display({
			width: Engine.WIDTH,
			height: Engine.HEIGHT,
			forceSquareRatio: true,
		})

		this.mousePosition = { x: 0, y: 0 }
		const container = this.display.getContainer()!
		document.body.appendChild(container)
		this.messageLog = new MessageLog()
		this.messageLog.addMessage(
			'Hello and welcome, adventurer, to yet another dungeon!',
			Colors.White
		)

		window.addEventListener('keydown', (event) => {
			this.update(event)
		})
		window.addEventListener('mousemove', (event) => {
			this.mousePosition = {
				x: this.display.eventToPosition(event)[0],
				y: this.display.eventToPosition(event)[1],
			}
			//this.render()
		})
		window.addEventListener('click', (event) => {
			//TODO: make better render system that takes all the drawed stuff and then renders them.
			this.render()
			handleMouse(event, this.mousePosition)
		})

		this.gameMap = generateDungeon(
			Engine.MAP_WIDTH,
			Engine.MAP_HEIGHT,
			Engine.MAX_ROOMS,
			Engine.MIN_ROOM_SIZE,
			Engine.MAX_ROOM_SIZE,
			Engine.MAX_MONSTERS_PER_ROOM,
			Engine.MAX_ITEMS_PER_ROOM,
			player,
			this.display
		)

		this.player = player
		this.gameMap.updateFov(this.player)
		//	this.player.get('body').takeDamage(6)
	}

	handleEnemyTurns() {
		this.gameMap.actors.forEach((e) => {
			if (e.cmp.body?.isAlive) {
				try {
					//e.ai?.perform(e)
				} catch {}
			}
		})
	}

	update(event: KeyboardEvent) {
		const action = this.inputHandler.handleKeyboardInput(event)
		if (action instanceof Action) {
			try {
				action.perform(this.player)
				this.handleEnemyTurns()
				this.gameMap.updateFov(this.player)
			} catch (error) {
				if (error instanceof ImpossibleException) {
					this.messageLog.addMessage(error.message, Colors.Gray)
				}
			}
		}

		this.inputHandler = this.inputHandler.nextHandler
		this.render()
	}

	render() {
		this.display.clear()
		this.messageLog.render(this.display, 21, 45, 40, 5)
		renderHearts(this.display, 1, 47, 5)
		this.gameMap.render()

		if (this.inputHandler.inputState === InputState.Log) {
			renderFrameWithTitle(3, 3, 74, 38, 'Message Log')
			this.messageLog.renderMessages(
				this.display,
				4,
				4,
				72,
				36,
				this.messageLog.messages.slice(0, this.logCursorPosition + 1)
			)
		}
		if (this.inputHandler.inputState === InputState.UseInventory) {
			renderInventory('Select an item to use')
		}
		if (this.inputHandler.inputState === InputState.DropInventory) {
			renderInventory('Select an item to drop')
		}
		if (this.inputHandler.inputState === InputState.Target) {
			const { x, y } = this.inputHandler.mousePosition
			const data = this.display._data[`${x},${y}`]
			const char = data ? data[2] || ' ' : ' '
			this.display.drawOver(x, y, char[0], '#000', '#fff')
		}
		this.inputHandler.onRender(this.display)
	}
}
