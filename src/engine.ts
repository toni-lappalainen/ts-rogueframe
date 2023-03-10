import * as ROT from 'rot-js'
import playerData from '../res/prefab/player.json'
import {
	BaseInputHandler,
	GameInputHandler,
	handleMouse,
} from './input-handler'
import { Entity, spawnEntity } from './entity'
import { BaseScreen } from './screens/screen'
import { MainMenu } from './screens/mainmenu'
import { GameScreen } from './screens/gamescreen'

export class Engine {
	public static readonly WIDTH = 64 //* 8
	public static readonly HEIGHT = 48 //* 8
	public static readonly MAP_WIDTH = 80 //* 2
	public static readonly MAP_HEIGHT = 48 //* 2

	display: ROT.Display
	uiDisplay: ROT.Display

	inputHandler: BaseInputHandler
	screen: BaseScreen
	player: Entity

	playing: Boolean

	constructor() {
		this.inputHandler = new GameInputHandler()
		this.display = new ROT.Display({
			width: Engine.WIDTH,
			height: Engine.HEIGHT,
			fontSize: 14,
			forceSquareRatio: true,
		})

		this.playing = false

		this.uiDisplay = new ROT.Display({
			width: Engine.WIDTH / 2,
			height: Engine.HEIGHT,
			fontSize: 14,
		})

		this.player = spawnEntity(playerData)

		const container = this.display.getContainer()!
		const uiContainer = this.uiDisplay.getContainer()!
		document.getElementById('game')?.appendChild(container)
		document.getElementById('game')?.appendChild(uiContainer)

		window.addEventListener('keydown', (event) => {
			if (event.code === 'Space') {
				if (this.playing) {
					this.playing = false
				} else {
					this.playing = true
					this.runGame()
				}
			}
		})

		let mousePos: Point = { x: 0, y: 0 }
		window.addEventListener('mousemove', (event) => {
			this.inputHandler.mousePosition = {
				x: this.display.eventToPosition(event)[0],
				y: this.display.eventToPosition(event)[1],
			}
			handleMouse(event, this.inputHandler.mousePosition)
			this.screen.render()
		})

		window.addEventListener('click', (event) => {
			//TODO: make better render system that takes all the drawed stuff and then renders them.
			//this.render()
			handleMouse(event, this.inputHandler.mousePosition)
		})

		// this.screen = new MainMenu(this.display, this.player)
		this.screen = new GameScreen(this.display, this.uiDisplay, this.player)
	}

	runGame() {
		setTimeout(() => {
			this.update()
		}, 1000)
	}

	update() {
		const screen = this.screen.update()
		console.log('updating')
		if (!Object.is(screen, this.screen)) {
			this.screen = screen
			this.screen.render()
		}
		if (this.playing) this.runGame()
	}
}
