import { Display } from 'rot-js'
import { Entity } from './entity'
import { isEqual } from './utils'

import { Colors } from './values'
import { Inventory } from './components/inventory'

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
	const remainingAfterTitle = innerWidth - (title.length + 2) // adding two because of the borders on left and right
	const left = Math.floor(remainingAfterTitle / 2)

	const topRow =
		topLeft +
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

export const renderInventory = (title: string) => {
	const player = window.engine.player
	const inventory: Inventory = player.get('inventory')
	const itemCount = inventory.items.length
	const height = itemCount + 2 <= 3 ? 3 : itemCount + 2
	const width = title.length + 12
	const x = player.pos.x <= 30 ? 40 : 0
	const y = 3

	renderFrameWithTitle(x, y, width, height, title)

	if (itemCount > 0) {
		inventory.items.forEach((i, index) => {
			const key = String.fromCharCode('a'.charCodeAt(0) + index)
			window.engine.display.drawText(x + 1, y + index + 1, `(${key}) ${i.name}`)
		})
	} else {
		window.engine.display.drawText(x + 1, y + 1, '(Empty)')
	}
}
