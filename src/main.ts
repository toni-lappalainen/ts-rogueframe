import { spawnEntity } from './entity'
import { Engine } from './engine'
import playerData from '../res/prefab/player.json'

declare global {
	interface Window {
		engine: Engine
	}
}

window.addEventListener('DOMContentLoaded', () => {
	window.engine = new Engine(spawnEntity(playerData))
	window.engine.render()
})
