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

interface Island {
	location: Point
	width: number
	height: number
	tiles?: {
		green: number
		darkGreen: number
		yellow: number
		brown: number
		gray: number
		mountain: number
	}
}

class IslandWorld {
	tiles: Tile[][]
	islands: Island[]
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
		this.islands = new Array()
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

	getBounds = (x: number, y: number, w: number, h: number): Bounds => {
		return {
			x1: x,
			y1: y,
			x2: x + w - 1,
			y2: y + h - 1,
		}
	}

	createBiomes = () => {
		const elevationMap = this.generateElevationmap(
			this.exp,
			this.scale,
			this.factor1,
			this.factor2
		)
		const biomeMap = this.generateBiomeMap()

		let color //= Colors.Black
		console.log(this.height)

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				const elv = elevationMap[x][y]
				const bio = biomeMap[x][y]
				const clr = Math.floor(biomeMap[x][y] * 255)

				let temp = elv
				if (elv >= 0.56)
					temp =
						temp + Math.round(100 * Math.pow(1 - y / this.height, 2)) / 1000

				if (temp < 0.5)
					//console.log(val)
					color = Colors.BlueDark
				else if (temp < 0.56) color = Colors.Blue
				else if (temp < 0.65) {
					console.log(bio)
					if (bio < 0.2) color = Colors.DarkGreen
					else if (bio < 0.7) color = Colors.Green
					else color = Colors.BrownYellow
				} else if (temp < 0.75) {
					if (bio < 0.2) color = Colors.BrownYellow
					else if (bio < 0.3) color = Colors.BrownLight
					else if (bio < 0.5) color = Colors.Green
					else color = Colors.DarkGreen
				} else if (temp < 0.8) {
					if (bio < 0.7) color = Colors.Gray
					else color = Colors.DarkGreen
					//	color = Colors.Black
				} else if (temp < 1) {
					if (bio < 0.8) color = Colors.Gray
					else color = Colors.GrayLight
				}

				//color = `rgb(${clr}, ${clr}, ${clr})`

				col[y] = createTile(color)
			}
			this.tiles[x] = col
		}

		this.islands.forEach((island) => {
			const loc = island.location
			const w = island.width
			const h = island.height
			for (let x = loc.x; x < loc.x + w; x++) {
				for (let y = loc.y; y < loc.y + h; y++) {
					//	if (this.tiles[x][y])
				}
			}
		})
	}

	calculateBlueNoise = (size: number) => {
		const seed = new Date().toISOString()
		console.log(seed)
		const prng = alea(seed)
		let noise = createNoise2D(prng)
		const bluenoise = []
		const locations: Point[] = []
		const R = 6
		const w = this.width - size
		const h = this.height - size
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
						intersects({ x: xc, y: yc }, l, size)
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
		const prng = alea('seed')
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
		shapeFactor2 = 1,
		margin = 120
	) {
		const elevationSum = new Array(this.width)

		const prng = alea('seed')
		let noise = createNoise2D(prng)
		// Simplex heightmap with different frequencies
		const elevation = this.calculateNoise(noise, scale)
		const elevation2 = this.calculateNoise(noise, scale * 4)
		const elevation3 = this.calculateNoise(noise, scale * 8)
		let noiseSum

		// add the noises together
		// and do the powers
		const locations = this.calculateBlueNoise(margin)
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height)
			for (let y = 0; y < this.height; y++) {
				elevationSum[x] = col
				//	console.log(` ${elevation3[x][y]}`);
				//	elevation[x][y] = this.shapeIsland(x, y, elevation[x][y], shapeFactor1)
				noiseSum =
					(elevation[x][y] + elevation2[x][y] * 0.5 + elevation3[x][y] * 0.25) /
					1.75
				//console.log(noiseSum);
				elevationSum[x][y] = Math.pow(noiseSum, exp) // * 10;
			}
		}
		locations.forEach((location: any) => {
			const w = Math.random() * (margin - margin / 2) + margin / 2
			const h = Math.random() * (margin - margin / 2) + margin / 2

			const exp = Math.random() * (3 - 1) + 1
			const islandFactor = Math.random() * (3 - 1.5) + 1
			let size = 0
			// for (let x = location.x; x < location.x + 20; x++) {
			for (let x = 0; x < w; x++) {
				// for (let y = location.y; y < location.y + 20; y++) {
				for (let y = 0; y < h; y++) {
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

					const val = Math.floor(elevationSum[lx][ly] * 10)
					//console.log(val)
					if (val >= 6) size++
				}
			}
			if (size >= 320) {
				const island: Island = {
					location,
					width: w,
					height: h,
				}
				this.islands.push(island)
			}
			console.log(size)
		})
		//this.calculateBlueNoise();
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
	const island = new IslandWorld(0, 0, mapWidth, mapHeight, 4, 10, 0, 0)
	world.setTiles(island.getTiles())

	const islands: any[] = []

	/*
	for (let count = 0; count < 0; count++) {
		const exp = Math.random() * (1 - 0.5 + 1) + 1;
		const scale = Math.random() * (1 - 1 + 1) + 1;
		const factor1 = Math.random() * (3 - 1 + 1) + 1;
		const factor2 = Math.random() * (3 - 1 + 1) + 1;
		const width = generateRandomNumber(minSize, maxSize);
		//	const height = generateRandomNumber(minSize, maxSize)
		const height = width;

		const x = generateRandomNumber(0, mapWidth - width - 1);
		const y = generateRandomNumber(0, mapHeight - height - 1);

		const newIsland = new Island(x, y, width, height, exp, scale, 1, 1);

		if (islands.some((r) => r.intersects(newIsland))) {
			continue;
		}

		world.addRoom(x, y, newIsland.getTiles());
		islands.push(newIsland);
	}
	*/

	//const islandMap = new Island(mapWidth, mapHeight)
	//world.setTiles(islandMap.getTiles())

	return world
}
