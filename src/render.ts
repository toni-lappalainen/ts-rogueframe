import { Display } from 'rot-js'
import { Entity } from './entity'
import { isEqual } from './utils'

import { Colors } from './values'
import { Inventory } from './components/inventory'
import { Tile } from './tiles'

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

export const renderUI = (display: Display, data: string[]) => {
	for (let i = 0; i < data.length; i++) {
		display.drawText(2, i + 1, data[i], 20)
	}
}

export const renderMinimap = (
	display: Display,
	center: Point,
	data: Tile[][],
	size: number = 42
) => {
	let lx = center.x - size / 2
	let ly = center.y - 8
	for (let x = 0; x < size + 1; x++) {
		for (let y = 0; y < size - 25; y++) {
			let char = ''
			let tile
			if (data[lx + x] === undefined || data[lx + x][ly + y] === undefined)
				tile = Colors.Black
			else tile = data[lx + x][ly + y].dark.bg

			if (lx + x === center.x && ly + y === center.y) char = 'X'
			display.drawOver(x + 1, y + 20, char, Colors.White, tile)
		}
	}
}

export const renderCursor = (pos: Point) => {
	window.engine.display.draw(
		pos.x,
		pos.y,
		'X',
		Colors.White,
		Colors.Transparent
	)
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
	let width = 21

	const names = entities
		.map((e) => e.name.charAt(0).toUpperCase() + e.name.substring(1))
		.join(', ')

	if (names.length > width - 4) width = names.length + 4

	renderFrameWithTitle(pos.x + 1, pos.y - 3, width, 12, names)
	window.engine.display.drawText(
		pos.x + 3,
		pos.y - 1,
		`%b{${Colors.Primary}}${entities[0].description}`,
		16
	)
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
	const empty = `%b{${Colors.Black}} `

	const innerWidth = width - 2
	const innerHeight = height - 2
	const remainingAfterTitle = innerWidth - (title.length + 2) // adding two because of the borders on left and right
	const left = Math.floor(remainingAfterTitle / 2)

	const topRow =
		topLeft +
		horizontal.repeat(left) +
		leftTitle +
		`%c{${Colors.BrownYellow}}${title}` +
		'%c{}' +
		rightTitle +
		horizontal.repeat(remainingAfterTitle - left) +
		topRight
	const middleRow =
		`%b{${Colors.BrownLight}}${vertical}` +
		empty.repeat(innerWidth) +
		`%b{${Colors.BrownLight}}${vertical}`
	const bottomRow = bottomLeft + horizontal.repeat(innerWidth) + bottomRight

	window.engine.display.drawText(x, y, `%b{${Colors.BrownLight}}${topRow}`)
	for (let i = 1; i <= innerHeight; i++) {
		window.engine.display.drawText(x, y + i, middleRow)
	}
	window.engine.display.drawText(
		x,
		y + height - 1,
		`%b{${Colors.BrownLight}}${bottomRow}`
	)
}

export const renderInventory = (title: string) => {
	const player = window.engine.player
	const inventory = player.cmp.inventory
	if (!inventory) return
	const itemCount = inventory.items.length
	const height = itemCount + 2 <= 3 ? 3 : itemCount + 2
	const width = title.length + 12
	const x = player.pos.x <= 30 ? 40 : 0
	const y = 3

	renderFrameWithTitle(x, y, width, height, title)

	if (itemCount > 0) {
		inventory.items.forEach((i, index) => {
			const key = String.fromCharCode('a'.charCodeAt(0) + index)
			const isEquipped = player.cmp.equipment?.itemIsEquipped(i)
			let itemString = `(${key}) ${i.name}`
			itemString = isEquipped ? `${itemString} (E)` : itemString
			window.engine.display.drawText(x + 1, y + index + 1, itemString)
		})
	} else {
		window.engine.display.drawText(x + 1, y + 1, '(Empty)')
	}
}
