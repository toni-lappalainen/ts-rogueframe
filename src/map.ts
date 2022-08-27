import * as ROT from 'rot-js'
import { Entity } from './entity'
import type { Tile } from './tiles'
import { WALL } from './tiles'
import { Display } from 'rot-js'
import { Colors } from './values'

export class GameMap {
	tiles: Tile[][]
	public static readonly FOV_RADIUS = 20

	constructor(
		public width: number,
		public height: number,
		public display: Display,
		public entities: [Entity]
	) {
		this.tiles = new Array(this.height)
		for (let y = 0; y < this.height; y++) {
			const row = new Array(this.width)
			for (let x = 0; x < this.width; x++) {
				row[x] = { ...WALL }
			}
			this.tiles[y] = row
		}
	}

	public get nonPlayerEntities(): Entity[] {
		return this.entities.filter((e) => e.name !== 'Player')
	}

	isInBounds(x: number, y: number) {
		return 0 <= x && x < this.width && 0 <= y && y < this.height
	}

	getBlockingEntityAtLocation(x: number, y: number): Entity | undefined {
		return this.entities.find((e) => e.blocksMovement && e.pos == { x, y }) //e.pos.x === x && e.pos.y === y)
	}

	addRoom(x: number, y: number, roomTiles: Tile[][]) {
		for (let curY = y; curY < y + roomTiles.length; curY++) {
			const mapRow = this.tiles[curY]
			const roomRow = roomTiles[curY - y]
			for (let curX = x; curX < x + roomRow.length; curX++) {
				mapRow[curX] = roomRow[curX - x]
			}
		}
	}

	lightPasses(x: number, y: number): boolean {
		if (this.isInBounds(x, y)) {
			return this.tiles[y][x].transparent
		}
		return false
	}

	updateFov(player: Entity) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.tiles[y][x].visible = false
			}
		}

		const fov = new ROT.FOV.PreciseShadowcasting(this.lightPasses.bind(this))
		fov.compute(
			player.pos.x,
			player.pos.y,
			GameMap.FOV_RADIUS,
			(x, y, _r, visibility) => {
				if (visibility === 1) {
					this.tiles[y][x].visible = true
					this.tiles[y][x].seen = true
				}
			}
		)
	}

	render() {
		for (let y = 0; y < this.tiles.length; y++) {
			const row = this.tiles[y]
			for (let x = 0; x < row.length; x++) {
				const tile = row[x]
				let char = ' '
				let fg: string = Colors.White
				let bg: string = Colors.Black

				if (tile.visible) {
					char = tile.light.char
					fg = tile.light.fg
					bg = tile.light.bg
				} else if (tile.seen) {
					char = tile.dark.char
					fg = tile.dark.fg
					bg = tile.dark.bg
				}

				this.display.draw(x, y, char, fg, bg)
			}
		}
		this.entities.forEach((e) => {
			if (this.tiles[e.pos.y][e.pos.x].visible) {
				this.display.draw(e.pos.x, e.pos.y, e.char, e.fg, e.bg)
			}
		})
	}
}
