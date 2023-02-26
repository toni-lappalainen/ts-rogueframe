import { Tile } from './tiles'
import * as tiles from './tiles'
import { Colors } from './values'
import { WorldMap } from './overworld'
import { Display, Noise } from 'rot-js'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import {
	generateRandomNumber,
	isEqual,
	generateRandomPoint,
	createMatrix,
} from './utils'

interface Bounds {
	x1: number
	y1: number
	x2: number
	y2: number
}

export class Island {
	locations: Point[]
	constructor() {
		this.locations = []
	}
}

class IslandWorld {
	tiles: Tile[][]
	islands: Island[]
	margin: number = 20
	grid: any
	islandAmount: number
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
		this.islandAmount = 0
		this.islands = new Array()
		this.tiles = new Array(this.width)
		this.grid = createMatrix(this.width, this.height, 0)
		while (this.islandAmount < 5) {
			this.createBiomes()
		}
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

	getBounds = (x: number, y: number, w: number, h: number): Bounds => {
		return {
			x1: x,
			y1: y,
			x2: x + w - 1,
			y2: y + h - 1,
		}
	}

	checkNeighbours = (tiles: any[], distance: Number = 1) => {
		tiles.forEach((tile) => {
			const connected = []

			for (let x = tile.x - 1; x < tile.x + 1; x++) {
				for (let y = tile.y; y < this.height; y++) {}
			}
		})
	}

	createBiomes = () => {
		this.islandAmount = 0
		this.grid = createMatrix(this.width, this.height, 0)
		this.islands = new Array()
		this.tiles = new Array(this.width)

		const elevationMap = this.generateElevationmap(
			this.exp,
			this.scale,
			this.factor1,
			this.factor2
		)
		const biomeMap = this.generateBiomeMap()
		console.log(this.grid.length, this.grid[0].length)
		console.log(this.width, this.height)

		let tile: Tile = tiles.WATER_DEEP
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				const elv = elevationMap[x][y]
				const bio = biomeMap[x][y]

				let temp = elv
				if (elv >= 0.56)
					temp =
						temp + Math.round(100 * Math.pow(1 - y / this.height, 2)) / 1000

				if (temp < 0.5) tile = tiles.WATER_DEEP
				else if (temp < 0.56) tile = tiles.WATER_SHALLOW
				else if (temp < 0.65) {
					if (bio < 0.2) tile = tiles.FOREST
					else if (bio < 0.7) tile = tiles.MEADOW
					else tile = tiles.SAND
				} else if (temp < 0.75) {
					if (bio < 0.2) tile = tiles.SAND
					//	else if (bio < 0.3)
					else if (bio < 0.5) tile = tiles.MEADOW
					else tile = tiles.FOREST
				} else if (temp < 0.8) {
					if (bio < 0.7) tile = tiles.MOUNTAIN
					else tile = tiles.FOREST
				} else if (temp < 1) {
					if (bio < 0.8) tile = tiles.MOUNTAIN
					else tile = tiles.SNOW
				}
				if (temp >= 0.5) this.grid[x][y] = 1

				col[y] = tile
			}
			this.tiles[x] = col
		}

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				if (this.grid[x][y] === 1) {
					let island = this.fill(x, y, 1)
					this.islands.push(island)
					if (island?.locations.length > 50) this.islandAmount++
				}
			}
		}
	}

	fill = (x: number, y: number, value: number = 1) => {
		let stack = [{ x, y, value }]

		const island: Island = {
			locations: [],
		}

		while (stack.length > 0) {
			let loc = stack.pop()
			if (!loc) return

			let lx = loc.x
			while (this.isValidSquare(lx, loc.y, loc.value)) {
				island.locations!.push({ x: lx, y: loc.y })
				this.grid[lx][loc.y] = 2
				lx--
			}

			let rx = loc.x + 1
			while (this.isValidSquare(rx, loc.y, loc.value)) {
				island.locations!.push({ x: rx, y: loc.y })
				this.grid[rx][loc.y] = 2
				rx++
			}

			this.scan(lx, rx - 1, loc.y + 1, stack, value)
			this.scan(lx, rx - 1, loc.y - 1, stack, value)
		}
		return island
	}

	isValidSquare = (x: number, y: number, isLand: number = 1) => {
		return (
			x >= 0 &&
			x < this.width &&
			y >= 0 &&
			y < this.height &&
			this.grid[x][y] === isLand
		)
	}

	scan(lx: number, rx: number, y: number, stack: any[], value: number = 1) {
		for (let i = lx; i < rx; i++) {
			if (this.isValidSquare(i, y, value)) {
				stack.push({ x: i, y, value })
			}
		}
	}

	calculateBlueNoise = (size: number) => {
		const seed = new Date().toISOString()
		console.log(seed)
		const prng = alea(seed)
		let noise = createNoise2D(prng)
		const bluenoise = []
		const locations: Point[] = []
		const R = 1
		const w = this.width
		const h = this.height
		for (let x = 0; x < w; x++) {
			const col = new Array(h)
			for (let y = 0; y < h; y++) {
				let nx = x / w - 0.5,
					ny = y / h - 0.5
				// blue noise is high frequency; try varying this
				col[y] = noise(1 * nx, 1 * ny)
			}
			bluenoise[x] = col
		}

		for (let xc = 0; xc < w; xc++) {
			for (let yc = 0; yc < h; yc++) {
				let max = 0
				// there are more efficient algorithms than this
				for (let xn = xc - R; xn <= xc + R; xn++) {
					for (let yn = yc - R; yn <= yc + R; yn++) {
						if (0 <= yn && yn < h && 0 <= xn && xn < w) {
							let e = bluenoise[xn][yn]
							if (e > max) {
								max = e
							}
						}
					}
				}
				// check overlaps and add islands that are apart from each other
				if (bluenoise[xc][yc] == max) {
					const overlap = locations.some((l) =>
						intersects({ x: xc, y: yc }, l, size * 2)
					)
					if (!overlap) locations.push({ x: xc, y: yc })
				}
			}
		}
		return locations
	}

	calculateNoise = (
		noise: any,
		scale: number,
		offsetX: number = 0,
		offsetY: number = 0,
		width: number = this.width,
		height: number = this.height
	) => {
		const noiseArray = []
		for (let x = 0; x < width; x++) {
			const col = new Array(height)
			for (let y = 0; y < height; y++) {
				const nx = x / width - 0.5
				const ny = y / height - 0.5
				let elevation =
					noise(nx * scale + offsetX, ny * scale + offsetY) / 2 + 0.5

				col[y] = elevation
			}
			noiseArray[x] = col
		}
		return noiseArray
	}

	shapeIsland = (
		x: number,
		y: number,
		elevation: any,
		factor = 1,
		width: number = this.width,
		height: number = this.height
	) => {
		const nx = (2 * x) / width - 1
		const ny = (2 * y) / height - 1

		let d = Math.min(1, (Math.pow(nx, 2) + Math.pow(ny, 2)) / Math.sqrt(2))
		d = d * factor

		return (elevation + (1 - d)) / 2
	}

	generateBiomeMap(exp: number = 1, scale: number = 4) {
		const prng = alea()
		let noise = createNoise2D(prng)
		// Simplex heightmap with different frequencies
		const biome = this.calculateNoise(noise, scale)
		const biome2 = this.calculateNoise(noise, scale * 3)
		const biome3 = this.calculateNoise(noise, scale * 6)

		const biomeSum = new Array(this.width)
		let noiseSum
		const a = 0.5
		const b = 0.25
		const c = 1.4

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				biomeSum[x] = col
				//	console.log(` ${elevation3[x][y]}`);
				//	elevation[x][y] = this.shapeIsland(x, y, elevation[x][y], shapeFactor1)
				noiseSum = (biome[x][y] + biome2[x][y] * a + biome3[x][y] * b) / c
				//console.log(noiseSum);
				biomeSum[x][y] = Math.pow(noiseSum, exp) // * 10;
			}
		}
		return biomeSum
	}

	generateElevationmap(
		exp: number = 2,
		scale: number = 6,
		shapeFactor1 = 1,
		shapeFactor2 = 1
	) {
		const elevationSum = new Array(this.width)

		const prng = alea()
		let noise = createNoise2D(prng)
		// Simplex heightmap with different frequencies
		const elevation = this.calculateNoise(noise, scale)
		const elevation2 = this.calculateNoise(noise, scale * 1)
		const elevation3 = this.calculateNoise(noise, scale * 4)
		let noiseSum

		// add the noises together
		// and do the powers
		const locations = this.calculateBlueNoise(this.margin)

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				elevationSum[x] = col
				//	console.log(` ${elevation3[x][y]}`);
				elevation[x][y] = this.shapeIsland(x, y, elevation[x][y], shapeFactor1)
				noiseSum =
					(elevation[x][y] + elevation2[x][y] * 0.5 + elevation3[x][y] * 0.25) /
					1.75
				//console.log(noiseSum);
				elevationSum[x][y] = Math.pow(noiseSum, exp * 1) // * 10;
			}
		}
		locations.forEach((location: any) => {
			const w =
				Math.random() * (this.margin - this.margin / 2) + this.margin / 2
			const h =
				Math.random() * (this.margin - this.margin / 2) + this.margin / 2

			const exp = Math.random() * (20 - 1) + 1
			const islandFactor = Math.random() * (3 - 1) + 1
			// for (let x = location.x; x < location.x + 20; x++) {
			for (let x = 0; x < w - this.margin; x++) {
				// for (let y = location.y; y < location.y + 20; y++) {
				for (let y = 0; y < h - this.margin; y++) {
					const lx = location.x + x
					const ly = location.y + y

					noiseSum =
						(elevation[lx][ly] +
							elevation2[lx][ly] * 0.5 +
							elevation3[lx][ly] * 0.25) /
						1.75

					elevationSum[lx][ly] = Math.pow(noiseSum, exp)

					elevationSum[lx][ly] = this.shapeIsland(
						x,
						y,
						elevationSum[lx][ly],
						islandFactor,
						w,
						h
					)
				}
			}
		})
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				elevationSum[x][y] = this.shapeIsland(
					x,
					y,
					elevationSum[x][y],
					0.9,
					this.width,
					this.height
				)
			}
		}

		return elevationSum
	}
	intersects(other: IslandWorld): boolean {
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
const intersects = (area1: Point, area2: Point, size: number) => {
	const a = { x1: area1.x, y1: area1.y, x2: area1.x + size, y2: area1.y + size }
	const b = { x1: area2.x, y1: area2.y, x2: area2.x + size, y2: area2.y + size }

	// no horizontal overlap
	if (a.x1 >= b.x2 || b.x1 >= a.x2) return false

	// no vertical overlap
	if (a.y1 >= b.y2 || b.y1 >= a.y2) return false

	return true
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
	const islandWorld = new IslandWorld(0, 0, mapWidth, mapHeight, 3.5, 3, 0, 0)
	world.setTiles(islandWorld.getTiles())
	world.setIslands(islandWorld.islands)

	return world
}
