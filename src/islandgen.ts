import { FLOOR, WALL, Tile, createTile } from './tiles'
import { Colors } from './values'
import { WorldMap } from './overworld'
import { Display } from 'rot-js'
import { generateRandomNumber, isEqual, generateRandomPoint } from './utils'

interface Bounds {
	x1: number
	y1: number
	x2: number
	y2: number
}

class Island {
	tiles: Tile[][]
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	) {
		this.tiles = new Array(this.height)
		this.createIsland()
	}

	public get center(): [number, number] {
		const centerX = this.x + Math.floor(this.width / 2)
		const centerY = this.y + Math.floor(this.height / 2)
		return [centerX, centerY]
	}

	get bounds(): Bounds {
		return {
			x1: this.x,
			y1: this.y,
			x2: this.x + this.width - 1,
			y2: this.y + this.height - 1,
		}
	}

	createIsland() {
		const land = createTile('rgb(10,128,230,0.5)', 'rgb(10,128,230,0.1)')

		for (let y = 0; y < this.height; y++) {
			const row = new Array(this.width)
			for (let x = 0; x < this.width; x++) {
				const nx = x / this.width - 0.5
				const ny = y / this.height - 0.5
				row[x] = createTile('rgb(255,255,255,)')
				/*
				const isWall =
					x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
				row[x] = isWall ? { ...land } : { ...land }
				*/
			}
			this.tiles[y] = row
		}
	}

	intersects(other: Island): boolean {
		return (
			this.x <= other.x + other.width &&
			this.x + this.width >= other.x &&
			this.y <= other.y + other.height &&
			this.y + this.width >= other.y
		)
	}
}

function* connectRooms(
	a: Island,
	b: Island
): Generator<[number, number], void, void> {
	// set the start point of our tunnel at the center of the first room
	let current = a.center
	// set the end point at the center of the second room
	const end = b.center

	// flip a coin to see if we go horizontally first or vertically
	let horizontal = Math.random() < 0.5
	// set our axisIndex to 0 (x axis) if horizontal or 1 (y axis) if vertical
	let axisIndex = horizontal ? 0 : 1

	// we'll loop until our current is the same as the end point
	while (current[0] !== end[0] || current[1] !== end[1]) {
		//are we tunneling in the positive or negative direction?

		// if direction is 0 we have hit the destination in one direction
		const direction = Math.sign(end[axisIndex] - current[axisIndex])
		if (direction !== 0) {
			current[axisIndex] += direction
			yield current
		} else {
			// we've finished in this direction so switch to the other
			axisIndex = axisIndex === 0 ? 1 : 0
			yield current
		}
	}
}

export const generateIslands = (
	mapWidth: number,
	mapHeight: number,
	maxIslands: number,
	minSize: number,
	maxSize: number,
	display: Display
): WorldMap => {
	const world = new WorldMap(mapWidth, mapHeight, display)
	const islands: Island[] = []
	let centerOfLastRoom: Point = { x: 0, y: 0 }
	// create rooms
	for (let count = 0; count < maxIslands; count++) {
		const width = generateRandomNumber(minSize, maxSize)
		const height = generateRandomNumber(minSize, maxSize)

		const x = generateRandomNumber(0, mapWidth - width - 1)
		const y = generateRandomNumber(0, mapHeight - height - 1)

		const newIsland = new Island(x, y, width, height)

		if (islands.some((r) => r.intersects(newIsland))) {
			continue
		}

		world.addRoom(x, y, newIsland.tiles)

		islands.push(newIsland)
		console.log(islands)
		centerOfLastRoom = { x: newIsland.center[0], y: newIsland.center[1] }
	}

	return world
}
