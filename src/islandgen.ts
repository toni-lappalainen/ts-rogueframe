import { FLOOR, WALL, Tile, createTile } from './tiles';
import { Colors } from './values';
import { WorldMap } from './overworld';
import { Display, Noise } from 'rot-js';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { generateRandomNumber, isEqual, generateRandomPoint } from './utils';

interface Bounds {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

class Island {
	tiles: Tile[][];
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
		this.tiles = new Array(this.width);
		this.createBiomes();
	}

	getTiles(): Tile[][] {
		return this.tiles;
	}

	public get center(): [number, number] {
		const centerX = this.x + Math.floor(this.width / 2);
		const centerY = this.y + Math.floor(this.height / 2);
		return [centerX, centerY];
	}
	get bounds(): Bounds {
		return {
			x1: this.x,
			y1: this.y,
			x2: this.x + this.width - 1,
			y2: this.y + this.height - 1,
		};
	}

	getBounds = (x: number, y: number, w: number, h: number): Bounds => {
		return {
			x1: x,
			y1: y,
			x2: x + w - 1,
			y2: y + h - 1,
		};
	};

	createBiomes = () => {
		const elevationMap = this.generateElevationmap(
			this.exp,
			this.scale,
			this.factor1,
			this.factor2
		);

		let color = Colors.Black;

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				const val = Math.floor(elevationMap[x][y] * 10);
				//	console.log(elevationMap[x][y]);

				if (val < 5) color = Colors.BlueDark;
				else if (val < 6) color = Colors.Blue;
				else if (val < 7) color = Colors.Green;
				else if (val < 8) color = Colors.DarkGreen;
				else if (val < 9) color = Colors.Gray;
				else if (val < 10) color = Colors.GrayLight;

				col[y] = createTile(color);
				//col[y] = createTile(`rgb(${val},${val},${val})`)
			}
			this.tiles[x] = col;
		}
	};

	calculateBlueNoise = (size: number) => {
		const seed = new Date().toISOString();
		console.log(seed);
		const prng = alea('2023-01-27T12:37:29.720Z');
		let noise = createNoise2D(prng);
		const bluenoise = [];
		const locations: Point[] = [];
		const R = 6;
		const w = this.width - size;
		const h = this.height - size;
		let test = false;
		for (let x = 0; x < w; x++) {
			const col = new Array(h);
			for (let y = 0; y < h; y++) {
				let nx = x / w - 0.5,
					ny = y / h - 0.5;
				// blue noise is high frequency; try varying this
				col[y] = noise(1 * nx, 1 * ny);
			}
			bluenoise[x] = col;
		}

		for (let xc = 0; xc < w; xc++) {
			for (let yc = 0; yc < h; yc++) {
				let max = 0;
				// there are more efficient algorithms than this
				for (let xn = xc - R; xn <= xc + R; xn++) {
					for (let yn = yc - R; yn <= yc + R; yn++) {
						if (0 <= yn && yn < h && 0 <= xn && xn < w) {
							let e = bluenoise[xn][yn];
							if (e > max) {
								max = e;
							}
						}
					}
				}
				if (bluenoise[xc][yc] == max && !test) {
					// place tree at xc,yc
					//test = true;
					if (locations.some((l) => intersects({ x: xc, y: yc }, l, size))) {
						console.log('derp');
						continue;
					}
					locations.push({ x: xc, y: yc });
					console.log(xc, yc);
				}
			}
		}
		return locations;
	};

	calculateNoise = (
		noise: any,
		scale: number,
		offsetX: number = 0,
		offsetY: number = 0,
		width: number = this.width,
		height: number = this.height
	) => {
		const noiseArray = [];
		for (let x = 0; x < width; x++) {
			const col = new Array(height);
			for (let y = 0; y < height; y++) {
				const nx = x / width - 0.5;
				const ny = y / height - 0.5;
				let elevation =
					noise(nx * scale + offsetX, ny * scale + offsetY) / 2 + 0.5;

				col[y] = elevation;
			}
			noiseArray[x] = col;
		}
		return noiseArray;
	};

	shapeIsland = (
		x: number,
		y: number,
		elevation: any,
		factor = 1,
		width: number = this.width,
		height: number = this.height
	) => {
		const nx = (2 * x) / width - 1;
		const ny = (2 * y) / height - 1;

		let d = Math.min(1, (Math.pow(nx, 2) + Math.pow(ny, 2)) / Math.sqrt(2));
		d = d * factor;

		return (elevation + (1 - d)) / 2;
	};

	generateElevationmap(
		exp: number = 2,
		scale: number = 4,
		shapeFactor1 = 1,
		shapeFactor2 = 1,
		margin = 100
	) {
		const elevationSum = new Array(this.width);

		const prng = alea('seed');
		let noise = createNoise2D(prng);
		// Simplex heightmap with different frequencies
		const elevation = this.calculateNoise(noise, scale);
		const elevation2 = this.calculateNoise(noise, scale * 4);
		const elevation3 = this.calculateNoise(noise, scale * 8);
		let noiseSum;

		// add the noises together
		// and do the powers
		const locations = this.calculateBlueNoise(margin);
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				elevationSum[x] = col;
				//	console.log(` ${elevation3[x][y]}`);
				elevation[x][y] = this.shapeIsland(x, y, elevation[x][y], shapeFactor1);
				noiseSum =
					(elevation[x][y] + elevation2[x][y] * 0.5 + elevation3[x][y] * 0.25) /
					1.75;
				//console.log(noiseSum);
				elevationSum[x][y] = Math.pow(noiseSum, exp); // * 10;
			}
		}
		locations.forEach((location) => {
			const w = Math.random() * (margin - margin / 2 + 1) + margin / 2;
			const h = Math.random() * (margin - margin / 2 + 1) + margin / 2;

			// for (let x = location.x; x < location.x + 20; x++) {
			for (let x = 0; x < w; x++) {
				// for (let y = location.y; y < location.y + 20; y++) {
				for (let y = 0; y < h; y++) {
					const lx = location.x + x;
					const ly = location.y + y;
					noiseSum =
						(elevation[lx][ly] +
							elevation2[lx][ly] * 0.5 +
							elevation3[lx][ly] * 0.25) /
						1.75;
					elevationSum[lx][ly] = Math.pow(noiseSum, 2.5);
					elevationSum[lx][ly] = this.shapeIsland(
						x,
						y,
						elevationSum[lx][ly],
						2,
						w,
						h
					);
				}
			}
		});

		//this.calculateBlueNoise();
		return elevationSum;
	}
	intersects(other: Island): boolean {
		return (
			this.x <= other.x + other.width &&
			this.x + this.width >= other.x &&
			this.y <= other.y + other.height &&
			this.y + this.height >= other.y
		);
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
	const l1 = { x: area1.x, y: area1.y };
	const l2 = { x: area2.x, y: area2.y };
	const r1 = { x: area1.x + size, y: area1.y + size };
	const r2 = { x: area2.x + size, y: area2.y + size };
	if (l1.x > r2.x || l2.x > r1.x) return false;
	//	if (area1.x > r2.x || area2.x > r1.x) return false;
	if (r1.y > l2.y || r2.y > l1.y) return false;
	//	if (area1.y > r2.y || r2.y > area1.y) return false;

	return true;
};
export const generateIslands = (
	mapWidth: number,
	mapHeight: number,
	maxIslands: number,
	minSize: number,
	maxSize: number,
	display: Display
): WorldMap => {
	const world = new WorldMap(mapWidth, mapHeight, display);
	const island = new Island(0, 0, mapWidth, mapHeight, 4, 10, 0, 0);
	world.setTiles(island.getTiles());

	const islands: any[] = [];

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

	return world;
};
