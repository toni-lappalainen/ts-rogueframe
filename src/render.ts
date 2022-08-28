import { Display } from 'rot-js'
import { Entity } from './entity'
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

export const renderNamesAtLocation = (pos: Point, entities: Entity[]) => {
	const names = entities
		.map((e) => e.name.charAt(0).toUpperCase() + e.name.substring(1))
		.join(', ')
	renderFrameWithTitle(pos.x - 3, pos.y - 3, 20, 20, names)
}

export const renderFrameWithTitle = (
	x: number,
	y: number,
	width: number,
	height: number,
	title: string
) => {
	const topLeft = '┌'
	const topRight = '┐'
	const bottomLeft = '└'
	const bottomRight = '┘'
	const vertical = '│'
	const horizontal = '─'
	const leftTitle = '┤'
	const rightTitle = '├'
	const empty = ' '

	const innerWidth = width - 2
	const innerHeight = height - 2
	const remainingAfterTitle = innerWidth - (title.length + 3) // adding two because of the borders on left and right
	const left = Math.floor(remainingAfterTitle / 2)

	const topRow =
		topLeft +
		'X' +
		horizontal.repeat(left) +
		leftTitle +
		title +
		rightTitle +
		horizontal.repeat(remainingAfterTitle - left) +
		topRight
	const middleRow = vertical + empty.repeat(innerWidth) + vertical
	const bottomRow = bottomLeft + horizontal.repeat(innerWidth) + bottomRight

	window.engine.display.drawText(x, y, topRow)
	for (let i = 1; i <= innerHeight; i++) {
		window.engine.display.drawText(x, y + i, middleRow)
	}
	window.engine.display.drawText(x, y + height - 1, bottomRow)
}
