import { FLOOR, WALL, Tile, createTile } from './tiles'
import { Colors } from './values'
import { WorldMap } from './overworld'
import { Display, Noise } from 'rot-js'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import { generateRandomNumber, isEqual, generateRandomPoint } from './utils'

interface Bounds {
	x1: number
	y1: number
	x2: number
	y2: number
}

class Island {
	tiles: Tile[][]
	//noise: any
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public exp: number,
		public scale: number,
		public factor1: number,
		public factor2: number
	) {
		this.tiles = new Array(this.width)
		this.createBiomes()
	}

	getTiles(): Tile[][] {
		return this.tiles
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

	createBiomes = () => {
		const elevationMap = this.generateElevationmap(
			this.exp,
			this.scale,
			this.factor1,
			this.factor2
		)

		let color = Colors.Black

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				const val = Math.floor(elevationMap[x][y] * 10)
				//	console.log(elevationMap[x][y]);

				if (val < 5) color = Colors.BlueDark
				else if (val < 6) color = Colors.Blue
				else if (val < 7) color = Colors.Green
				else if (val < 8) color = Colors.DarkGreen
				else if (val < 9) color = Colors.Gray
				else if (val < 10) color = Colors.GrayLight

				col[y] = createTile(color)
				//col[y] = createTile(`rgb(${val},${val},${val})`)
			}
			this.tiles[x] = col
		}
	}

	calculateNoise = (
		noise: any,
		scale: number,
		offsetX: number = 0,
		offsetY: number = 0
	) => {
		const noiseArray = []
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				const nx = x / this.width - 0.5
				const ny = y / this.height - 0.5
				let elevation =
					noise(nx * scale + offsetX, ny * scale + offsetY) / 2 + 0.5

				col[y] = elevation
			}
			noiseArray[x] = col
		}
		return noiseArray
	}

	shapeIsland = (x: number, y: number, elevation: any, factor = 1) => {
		const nx = (2 * x) / this.width - 1
		const ny = (2 * y) / this.height - 1

		let d = Math.min(1, (Math.pow(nx, 2) + Math.pow(ny, 2)) / Math.sqrt(2))
		d = d * factor
		return (elevation + (1 - d)) / 2
	}

	generateElevationmap(
		exp: number = 2,
		scale: number = 4,
		shapeFactor1 = 1,
		shapeFactor2 = 1
	) {
		const elevationSum = new Array(this.width)

		const prng = alea()
		let noise = createNoise2D(prng)
		// Simplex heightmap with different frequencies
		const elevation = this.calculateNoise(noise, scale)
		const elevation2 = this.calculateNoise(noise, scale * 4)
		const elevation3 = this.calculateNoise(noise, scale * 8)

		// add the noises together
		// and do the powers
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				elevationSum[x] = col
				//	console.log(` ${elevation3[x][y]}`);
				elevation[x][y] = this.shapeIsland(x, y, elevation[x][y], shapeFactor1)
				const noiseSum =
					(elevation[x][y] + elevation2[x][y] * 0.5 + elevation3[x][y] * 0.25) /
					1.75
				//console.log(noiseSum);
				elevationSum[x][y] = Math.pow(noiseSum, exp) // * 10;
				/*
				elevationSum[x][y] = this.shapeIsland(
					x,
					y,
					elevationSum[x][y],
					shapeFactor2
				)
				*/

				//console.log(elevationSum[x][y]);
			}
		}
		return elevationSum
	}
	intersects(other: Island): boolean {
		return (
			this.x <= other.x + other.width &&
			this.x + this.width >= other.x &&
			this.y <= other.y + other.height &&
			this.y + this.height >= other.y
		)
	}
}
/*
function* connectRooms(
	a: Island,
	b: Island
): Generator<[number, number], void, void> {
	// set the start point of our tunnel at the center of the first room
	let current = a.center;
	// set the end point at the center of the second room
	const end = b.center;

	// flip a coin to see if we go horizontally first or vertically
	let horizontal = Math.random() < 0.5;
	// set our axisIndex to 0 (x axis) if horizontal or 1 (y axis) if vertical
	let axisIndex = horizontal ? 0 : 1;

	// we'll loop until our current is the same as the end point
	while (current[0] !== end[0] || current[1] !== end[1]) {
		//are we tunneling in the positive or negative direction?

		// if direction is 0 we have hit the destination in one direction
		const direction = Math.sign(end[axisIndex] - current[axisIndex]);
		if (direction !== 0) {
			current[axisIndex] += direction;
			yield current;
		} else {
			// we've finished in this direction so switch to the other
			axisIndex = axisIndex === 0 ? 1 : 0;
			yield current;
		}
	}
}
*/

export const generateIslands = (
	mapWidth: number,
	mapHeight: number,
	maxIslands: number,
	minSize: number,
	maxSize: number,
	display: Display
): WorldMap => {
	const world = new WorldMap(mapWidth, mapHeight, display)
	const island = new Island(0, 0, mapWidth, mapHeight, 1.5, 3.5, 1, 1)
	world.setTiles(island.getTiles())

	const islands: any[] = []

	/*
	for (let count = 0; count < maxIslands; count++) {
		const exp = Math.random() * (4 - 0.5 + 1) + 0.5
		const scale = Math.random() * (6 - 4 + 1) + 2
		const factor1 = Math.random() * (3 - 1 + 1) + 1
		const factor2 = Math.random() * (3 - 1 + 1) + 1
		const width = generateRandomNumber(minSize, maxSize)
		//	const height = generateRandomNumber(minSize, maxSize)
		const height = width

		const x = generateRandomNumber(0, mapWidth - width - 1)
		const y = generateRandomNumber(0, mapHeight - height - 1)

		const newIsland = new Island(
			x,
			y,
			width,
			height,
			exp,
			scale,
			factor1,
			factor2
		)

		if (islands.some((r) => r.intersects(newIsland))) {
			continue
		}

		world.addRoom(x, y, newIsland.getTiles())
		islands.push(newIsland)
	}
	*/
	//const islandMap = new Island(mapWidth, mapHeight)
	//world.setTiles(islandMap.getTiles())

	return world
}
