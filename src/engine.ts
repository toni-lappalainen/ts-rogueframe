import * as ROT from 'rot-js'

import { handleInput } from './input-handler'
import { Entity } from './entity'
import { GameMap } from './map'
import { generateDungeon } from './procgen'
import { renderHearts, renderNamesAtLocation } from './render'
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

	constructor(player: Entity) {
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
			this.render()
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

	handleEnemyTurns() {
		this.gameMap.nonPlayerEntities.forEach((e) => {
			console.log(
				`The ${e.pos.x} wonders when it will get to take a real turn.`
			)
		})
	}

	update(event: KeyboardEvent) {
		const action = handleInput(event)

		if (action) {
			action.perform(this.player)
			console.log(this.player.pos)
			this.handleEnemyTurns()
		}

		this.gameMap.updateFov(this.player)
		this.render()
	}

	render() {
		this.display.clear()
		this.messageLog.render(this.display, 21, 45, 40, 5)
		renderHearts(this.display, 1, 47, 5)
		renderNamesAtLocation(1, 44)
		this.gameMap.render()
	}
}
