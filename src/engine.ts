import * as ROT from 'rot-js'
import playerData from '../res/prefab/player.json'
import { BaseInputHandler, GameInputHandler } from './input-handler'
import { Entity, spawnEntity } from './entity'
import { BaseScreen } from './screens/screen'
import { MainMenu } from './screens/mainmenu'
import { GameScreen } from './screens/gamescreen'

export class Engine {
	public static readonly WIDTH = 80 * 4.5 //* 8
	public static readonly HEIGHT = 50 * 6 //* 8
	public static readonly MAP_WIDTH = 80 * 1.5 //* 2
	public static readonly MAP_HEIGHT = 43 * 1.5 //* 2

	display: ROT.Display
	uiDisplay: ROT.Display

	inputHandler: BaseInputHandler
	screen: BaseScreen
	player: Entity

	constructor() {
		this.inputHandler = new GameInputHandler()
		this.display = new ROT.Display({
			width: Engine.WIDTH,
			height: Engine.HEIGHT,
			fontSize: 2,
			forceSquareRatio: true,
		})

		this.uiDisplay = new ROT.Display({
			width: Engine.WIDTH / 8,
			height: Engine.HEIGHT / 8,
			fontSize: 16,
		})

		this.player = spawnEntity(playerData)

		const container = this.display.getContainer()!
		const uiContainer = this.uiDisplay.getContainer()!
		document.getElementById('game')?.appendChild(container)
		document.getElementById('game')?.appendChild(uiContainer)

		window.addEventListener('keydown', (event) => {
			this.update(event)
		})

		window.addEventListener('mousemove', (event) => {
			this.inputHandler.mousePosition = {
				x: this.display.eventToPosition(event)[0],
				y: this.display.eventToPosition(event)[1],
			}
			//this.render()
		})

		window.addEventListener('click', (event) => {
			//TODO: make better render system that takes all the drawed stuff and then renders them.
			//this.render()
			//handleMouse(event, this.inputHandler.mousePosition)
		})

		// this.screen = new MainMenu(this.display, this.player)
		this.screen = new GameScreen(this.display, this.uiDisplay, this.player)
	}

	update(event: KeyboardEvent) {
		const screen = this.screen.update(event)
		if (!Object.is(screen, this.screen)) {
			this.screen = screen
			this.screen.render()
		}
	}
}
