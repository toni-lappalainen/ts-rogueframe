import * as ROT from 'rot-js'

import { handleInput, handleLogInput, handleMouse } from './input-handler'
import { Entity } from './entity'
import { GameMap } from './map'
import { generateDungeon } from './procgen'
import {
	renderFrameWithTitle,
	renderHearts,
	renderNamesAtLocation,
} from './render'
import { MessageLog } from './messagelog'
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

	display: ROT.Display
	gameMap: GameMap
	player: Entity
	messageLog: MessageLog
	mousePosition: Point
	_state: GameState
	logCursorPosition: number

	constructor(player: Entity) {
		this._state = GameState.Game
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
			player,
			this.display
		)

		this.player = player
		this.gameMap.updateFov(this.player)
	}
	public get state() {
		return this._state
	}

	public set state(value) {
		this._state = value
		this.logCursorPosition = this.messageLog.messages.length - 1
	}

	handleEnemyTurns() {
		this.gameMap.nonPlayerEntities.forEach((e) => {
			console.log(
				`The ${e.pos.x} wonders when it will get to take a real turn.`
			)
		})
	}

	processGameLoop(event: KeyboardEvent) {
		if (this.player.get('body').hp > 0) {
			const action = handleInput(event)

			if (action) {
				action.perform(this.player)

				if (this.state === GameState.Game) {
					this.handleEnemyTurns()
				}
			}
		}

		this.gameMap.updateFov(this.player)
	}

	processLogLoop(event: KeyboardEvent) {
		const scrollAmount = handleLogInput(event)
		if (scrollAmount < 0 && this.logCursorPosition === 0) {
			this.logCursorPosition = this.messageLog.messages.length - 1
		} else if (
			scrollAmount > 0 &&
			this.logCursorPosition === this.messageLog.messages.length - 1
		) {
			this.logCursorPosition = 0
		} else {
			this.logCursorPosition = Math.max(
				0,
				Math.min(
					this.logCursorPosition + scrollAmount,
					this.messageLog.messages.length - 1
				)
			)
		}
	}

	update(event: KeyboardEvent) {
		if (this.state === GameState.Game) {
			this.processGameLoop(event)
		} else if (this.state === GameState.Log) {
			this.processLogLoop(event)
		}

		this.render()
	}

	render() {
		this.display.clear()
		this.messageLog.render(this.display, 21, 45, 40, 5)
		renderHearts(this.display, 1, 47, 5)
		this.gameMap.render()

		if (this.state === GameState.Log) {
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
	}
}
export enum GameState {
	Start,
	Game,
	Dead,
	Log,
}
