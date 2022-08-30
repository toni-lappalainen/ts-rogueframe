import { spawnEntity } from './entity'
import { Engine } from './engine'
import playerData from '../res/prefab/player.json'
import { MessageLog } from './messagelog'

declare global {
	interface Window {
		engine: Engine
		msgLog: MessageLog
	}
}

window.addEventListener('DOMContentLoaded', () => {
	window.msgLog = new MessageLog()
	window.engine = new Engine(spawnEntity(playerData))
	window.engine.render()
})
