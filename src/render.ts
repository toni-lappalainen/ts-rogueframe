import { Display } from 'rot-js'
import { isEqual } from './utils'

import { Colors } from './values'

const drawColoredBar = (
	display: Display,
	x: number,
	y: number,
	width: number,
	char: string,
	color: Colors | null = null
) => {
	for (let pos = x; pos < x + width; pos++) {
		display.draw(pos, y, char, color, color)
	}
}

export const renderHearts = (
	display: Display,
	currentValue: number,
	maxValue: number,
	totalWidth: number
) => {
	drawColoredBar(display, 2, 45, 5, '💚')
}

export const renderNamesAtLocation = (x: number, y: number) => {
	const mousePos = window.engine.mousePosition
	if (
		window.engine.gameMap.isInBounds(mousePos) &&
		window.engine.gameMap.tiles[mousePos.y][mousePos.x].visible
	) {
		const names = window.engine.gameMap.entities
			.filter((e) => isEqual(e.pos, mousePos))
			.map((e) => e.name.charAt(0).toUpperCase() + e.name.substring(1))
			.join(', ')

		window.engine.display.drawText(
			mousePos.x + 1,
			mousePos.y - 1,
			`%c{green}` + names
		)
	}
}
