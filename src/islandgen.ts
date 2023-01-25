import { FLOOR, WALL, Tile, createTile } from './tiles';
import { Colors } from './values';
import { WorldMap } from './overworld';
import { Display, Noise } from 'rot-js';
import { generateRandomNumber, isEqual, generateRandomPoint } from './utils';

interface Bounds {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

class Island {
	tiles: Tile[][];
	noise: any;
	constructor(
		//public x: number,
		//public y: number,
		public width: number,
		public height: number
	) {
		this.tiles = new Array(this.width);
		this.noise = new Noise.Simplex();
		this.createBiomes();
	}

	getTiles(): Tile[][] {
		return this.tiles;
	}

	/*
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
	*/

	createBiomes = () => {
		const elevationMap = this.generateElevationmap();

		let color = Colors.Black;

		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				//	console.log(elevationMap[x][y]);
				/*
				switch (Math.floor(elevationMap[x][y])) {
					case 0:
						color = Colors.BlueDark;
						break;
					case 1:
						color = Colors.Blue;
						break;
					case 2:
						color = Colors.Green;
						break;
					case 5:
						color = Colors.BrownLight;
						break;
					case 8:
						color = Colors.Gray;
						break;
					case 10:
						color = Colors.GrayLight;
						break;
				}
				*/
				const val = elevationMap[x][y] * 255;
				//console.log(val);
				col[y] = createTile(`rgb(${val},${val}, ${val})`);
			}
			this.tiles[x] = col;
		}
		//createTile(`rgb(255,255,${val})`);
	};

	calculateNoise = (
		scale: number,
		offsetX: number = 0,
		offsetY: number = 0
	) => {
		const noiseArray = [];
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				const nx = x / this.width - 0.5;
				const ny = y / this.height - 0.5;
				let val =
					(this.noise.get(nx * scale + offsetX, ny * scale + offsetY) + 1) / 2;
				col[y] = val;
			}
			noiseArray[x] = col;
		}
		return noiseArray;
	};

	generateElevationmap(exp: number = 1, scale: number = 3) {
		const elevationSum = new Array(this.width);
		// Simplex heightmap with different frequencies
		const elevation = this.calculateNoise(scale);
		const elevation2 = this.calculateNoise(scale * 2);
		const elevation3 = this.calculateNoise(scale * 4);

		// add the noises together
		// and do the powers
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				elevationSum[x] = col;
				//	console.log(` ${elevation3[x][y]}`);
				const noiseSum =
					(elevation[x][y] + elevation2[x][y] * 0.5 + elevation3[x][y] * 0.25) /
					1.75;
				//console.log(noiseSum);
				elevationSum[x][y] = Math.pow(noiseSum, exp); // * 10;
				//console.log(elevationSum[x][y]);
			}
		}
		return elevationSum;
	}
	/*
	intersects(other: Island): boolean {
		return (
			this.x <= other.x + other.width &&
			this.x + this.width >= other.x &&
			this.y <= other.y + other.height &&
			this.y + this.width >= other.y
		);
	}
	*/
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
	const world = new WorldMap(mapWidth, mapHeight, display);
	const islandMap = new Island(mapWidth, mapHeight);
	world.setTiles(islandMap.getTiles());

	return world;
};
