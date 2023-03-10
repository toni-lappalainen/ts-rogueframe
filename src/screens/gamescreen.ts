import { Display, Scheduler } from 'rot-js'
import {
	BaseInputHandler,
	GameInputHandler,
	InputState,
	handleMouse,
} from '../input-handler'
import { Action } from '../actions/actions'
import { Entity } from '../entity'
import { GameMap } from '../map'
import { WorldMap } from '../overworld'
import { generateIslands } from '../islandgen'
import { generateDungeon } from '../procgen'
import {
	renderFrameWithTitle,
	renderHearts,
	renderInventory,
	renderUI,
	renderMinimap,
} from '../render'
import { ImpossibleException } from '../messagelog'
import { Colors } from '../values'
import { BaseScreen } from './screen'
import { Tribe, generateTribes } from '../gameplay/tribes'

export class GameScreen extends BaseScreen {
	public static readonly MAP_WIDTH = 64 //* 10
	public static readonly MAP_HEIGHT = 50 // * 8
	public static readonly MAX_ROOMS = 12
	public static readonly MIN_ROOM_SIZE = 3
	public static readonly MAX_ROOM_SIZE = 12
	public static readonly MAX_MONSTERS_PER_ROOM = 2
	public static readonly MAX_ITEMS_PER_ROOM = 2

	public static readonly MAX_ISLANDS = 8

	inputHandler: BaseInputHandler
	gameMap!: GameMap
	worldMap!: WorldMap
	tribes!: Tribe[]
	scheduler = new Scheduler.Action()

	constructor(
		display: Display,
		public uiDisplay: Display,
		player: Entity,
		public currentFloor: number = 0
	) {
		super(display, player)
		this.generateWorld()

		this.inputHandler = new GameInputHandler()
		//window.engine.runGame()
	}

	generateWorld(): void {
		this.worldMap = generateIslands(
			GameScreen.MAP_WIDTH,
			GameScreen.MAP_HEIGHT,
			GameScreen.MAX_ISLANDS,
			GameScreen.MIN_ROOM_SIZE,
			GameScreen.MAX_ROOM_SIZE,
			this.display
		)
		this.tribes = generateTribes(this.worldMap.islands)
		console.log(this.tribes)
		this.tribes.forEach((tribe) => {
			tribe.island.locations.forEach((loc) => {})
		})
	}

	generateFloor(): void {
		this.currentFloor += 1

		this.gameMap = generateDungeon(
			GameScreen.MAP_WIDTH,
			GameScreen.MAP_HEIGHT,
			GameScreen.MAX_ROOMS,
			GameScreen.MIN_ROOM_SIZE,
			GameScreen.MAX_ROOM_SIZE,
			GameScreen.MAX_MONSTERS_PER_ROOM,
			GameScreen.MAX_ITEMS_PER_ROOM,
			this.player,
			this.display
		)
	}

	handleEnemyTurns() {
		this.gameMap.actors.forEach((e) => {
			if (e.cmp.body?.isAlive && e.cmp.ai) {
				try {
					e.cmp.ai.update()
					//e.ai?.perform(e)
				} catch (error) {
					//console.log(error)
				}
			}
		})
	}

	update() {
		//		this.inputHandler = this.inputHandler.nextHandler

		this.render()
		return this
	}

	render() {
		this.display.clear()
		this.worldMap.render()
		//this.worldMap.renderZoomed(this.tribes[0].center)
		window.msgLog.render(this.display, 21, 45, 40, 5)

		this.uiDisplay.clear()
		for (let x = 0; x < GameScreen.MAP_WIDTH / 4; x++) {
			for (let y = 0; y < GameScreen.MAP_HEIGHT / 4; y++) {
				this.uiDisplay.draw(x, y, null, null, Colors.Black)
			}
		}

		const resources = []
		for (const [key, value] of Object.entries(this.tribes[0].resources)) {
			resources.push(`${key}: ${value}`)
		}

		const data = [`name: ${this.tribes[0].name}`, ...resources]
		renderUI(this.uiDisplay, data)
		//renderMinimap(this.uiDisplay, this.tribes[0].center, this.worldMap.tiles)

		if (this.inputHandler.inputState === InputState.Log) {
			renderFrameWithTitle(3, 3, 74, 38, 'Message Log')
			window.msgLog.renderMessages(
				this.display,
				4,
				4,
				72,
				36,
				window.msgLog.messages.slice(0, this.inputHandler.logCursorPosition + 1)
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
			this.display.drawOver(x, y, null, '#000', '#fff')
		}
		this.inputHandler.onRender(this.display)
	}
}
