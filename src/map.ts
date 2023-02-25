import * as ROT from 'rot-js'
import { Entity } from './entity'
import type { Tile } from './tiles'
import { MOUNTAIN as WALL } from './tiles'
import { Display } from 'rot-js'
import { Colors } from './values'
import { isEqual } from './utils'

export const serializeMap = (map: GameMap) => {
	const entityList: string[] = []
	map.entities.forEach((entity) => {
		entityList.push(entity.id)
	})

	return JSON.stringify(map, (key, value) => {
		if (key === 'display') return
		if (key === 'entities') return entityList
		else return value
	})
}

export class GameMap {
	readonly id: string
	tiles: Tile[][]
	downstairsLocation: Point
	public static readonly FOV_RADIUS = 20

	constructor(
		public width: number,
		public height: number,
		public display: Display,
		public entities: [Entity]
	) {
		this.id = crypto.randomUUID()
		this.tiles = new Array(this.height)
		for (let y = 0; y < this.height; y++) {
			const row = new Array(this.width)
			for (let x = 0; x < this.width; x++) {
				row[x] = { ...WALL }
			}
			this.tiles[y] = row
		}
		this.downstairsLocation = { x: 0, y: 0 }
	}

	public get nonPlayerEntities(): Entity[] {
		return this.entities.filter((e) => e.name !== 'Player')
	}
	public get gameMap(): GameMap {
		return this
	}

	public get actors(): Entity[] {
		return this.entities.filter((e) => e.canAct)
	}

	public get items(): Entity[] {
		return this.entities.filter((e) => e.has('item')) //.map((e) => e)
	}

	removeEntity(entity: Entity) {
		const index = this.entities.indexOf(entity)
		if (index >= 0) {
			this.entities.splice(index, 1)
		}
	}

	isNotBlocked(pos: Point) {
		if (
			this.isInBounds(pos) &&
			this.tiles[pos.y][pos.x].walkable &&
			!this.getBlockingEntityAtLocation(pos)
		)
			return true
		else return false
	}

	isInBounds(pos: Point) {
		return 0 <= pos.x && pos.x < this.width && 0 <= pos.y && pos.y < this.height
	}

	isInRectangle(pos: Point, startPos: Point, width: number, height: number) {
		const endPos = { x: startPos.x + width, y: startPos.y + height }
		return (
			startPos.x <= pos.x &&
			pos.x < endPos.x &&
			startPos.y <= pos.y &&
			pos.y < endPos.y
		)
	}

	isInCircle(pos: Point, center: Point, radius: number) {
		const dist_points =
			(pos.x - center.x) * (pos.x - center.x) +
			(pos.y - center.y) * (pos.y - center.y)
		radius *= radius
		if (dist_points <= radius) {
			return true
		}
		return false
	}

	entitiesInsideCircle(center: Point, radius: number) {
		console.log(center)
		return this.entities.filter((e) => this.isInCircle(e.pos, center, radius))
	}

	getBlockingEntityAtLocation(pos: Point): Entity | undefined {
		return this.entities.find((e) => e.blocksMovement && isEqual(e.pos, pos)) //e.pos.x === x && e.pos.y === y)
	}
	getEntityAtLocation(pos: Point): Entity | undefined {
		return this.entities.find((e) => isEqual(e.pos, pos))
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
		if (this.isInBounds({ x, y })) {
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
		const sortedEntities = this.entities
			.slice()
			.sort((a, b) => a.renderOrder - b.renderOrder)

		sortedEntities.forEach((e) => {
			if (this.tiles[e.pos.y][e.pos.x].visible) {
				this.display.draw(
					e.pos.x,
					e.pos.y,
					e.char,
					e.fg,
					this.tiles[e.pos.y][e.pos.x].light.bg
				)
			}
		})
	}
}
