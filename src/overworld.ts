import * as ROT from 'rot-js';
import type { Tile } from './tiles';
import { WATER_SHALLOW } from './tiles';
import { Display } from 'rot-js';
import { Colors } from './values';
import { isEqual } from './utils';

export const serializeWorld = (map: WorldMap) => {
	const entityList: string[] = [];

	return JSON.stringify(map, (key, value) => {
		if (key === 'display') return;
		if (key === 'entities') return entityList;
		else return value;
	});
};

export class WorldMap {
	readonly id: string;
	tiles: Tile[][];
	public static readonly FOV_RADIUS = 20;

	constructor(
		public width: number,
		public height: number,
		public display: Display
	) {
		this.id = crypto.randomUUID();
		this.tiles = new Array(this.width);
		for (let x = 0; x < this.width; x++) {
			const col = new Array(this.height);
			for (let y = 0; y < this.height; y++) {
				col[y] = { ...WATER_SHALLOW };
			}
			this.tiles[x] = col;
		}
	}

	public setTiles = (tiles: Tile[][]) => {
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x][y] = tiles[x][y];
			}
		}
	};

	public get gameMap(): WorldMap {
		return this;
	}

	isInBounds(pos: Point) {
		return (
			0 <= pos.x && pos.x < this.width && 0 <= pos.y && pos.y < this.height
		);
	}

	isInRectangle(pos: Point, startPos: Point, width: number, height: number) {
		const endPos = { x: startPos.x + width, y: startPos.y + height };
		return (
			startPos.x <= pos.x &&
			pos.x < endPos.x &&
			startPos.y <= pos.y &&
			pos.y < endPos.y
		);
	}

	isInCircle(pos: Point, center: Point, radius: number) {
		const dist_points =
			(pos.x - center.x) * (pos.x - center.x) +
			(pos.y - center.y) * (pos.y - center.y);
		radius *= radius;
		if (dist_points <= radius) {
			return true;
		}
		return false;
	}

	addRoom(x: number, y: number, roomTiles: Tile[][]) {
		for (let curY = y; curY < y + roomTiles.length; curY++) {
			const mapRow = this.tiles[curY];
			const roomRow = roomTiles[curY - y];
			for (let curX = x; curX < x + roomRow.length; curX++) {
				mapRow[curX] = roomRow[curX - x];
			}
		}
	}

	lightPasses(x: number, y: number): boolean {
		if (this.isInBounds({ x, y })) {
			return this.tiles[y][x].transparent;
		}
		return false;
	}

	render() {
		for (let x = 0; x < this.tiles.length; x++) {
			const col = this.tiles[x];
			for (let y = 0; y < col.length; y++) {
				const tile = col[y];
				let char = ' ';
				let fg: string = Colors.White;
				let bg: string = Colors.Black;

				//	if (tile.visible) {
				char = tile.light.char;
				fg = tile.light.fg;
				bg = tile.light.bg;
				/*	} else if (tile.seen) {
					char = tile.dark.char;
					fg = tile.dark.fg;
					bg = tile.dark.bg;
				}
				*/

				this.display.draw(x, y, char, fg, bg);
			}
		}
	}
}
