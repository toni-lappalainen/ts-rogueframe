import { Display } from 'rot-js'
import { BaseScreen } from './screen'
import { GameScreen } from './gamescreen'
import { Entity } from '../entity'
import { Engine } from '../engine'
import { BaseInputHandler, GameInputHandler } from '../input-handler'

const OPTIONS = [
	'[N] Play a new game',
	'[C] Continue last game', // TODO: hide this option if no save game is present
	'[P] Procgen playground',
]

const MENU_WIDTH = 24

export class MainMenu extends BaseScreen {
	inputHandler: BaseInputHandler
	constructor(display: Display, player: Entity) {
		display.setOptions({ fontSize: 16 })
		super(display, player)
		this.inputHandler = new GameInputHandler()
	}

	render() {
		this.display.clear()
		OPTIONS.forEach((o, i) => {
			const x = Math.floor(Engine.WIDTH / 4)
			const y = Math.floor(Engine.HEIGHT / 4 - 1 + i)

			this.display.draw(x, y, o.padEnd(MENU_WIDTH, ' '), '#fff', '#000')
		})
	}

	update(event: KeyboardEvent): BaseScreen {
		if (event.key === 'n') return new GameScreen(this.display, this.player)

		this.inputHandler.onRender(this.display)
		this.render()

		return this
	}
}
