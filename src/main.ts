import { Engine } from './engine'
import { MessageLog } from './messagelog'

declare global {
	interface Window {
		engine: Engine
		msgLog: MessageLog
	}
}

window.addEventListener('DOMContentLoaded', () => {
	window.msgLog = new MessageLog()
	window.engine = new Engine()
	window.engine.screen.render()
})
