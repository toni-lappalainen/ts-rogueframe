import { GameMap } from './map'
export class World {
	public static readonly MAP_WIDTH = 80
	public static readonly MAP_HEIGHT = 43
	public static readonly MAX_DEPTH = 5
	public static readonly MAX_ROOMS = 6
	public static readonly MIN_ROOM_SIZE = 3
	public static readonly MAX_ROOM_SIZE = 23
	public static readonly MAX_MONSTERS_PER_ROOM = 2
	public static readonly MAX_ITEMS_PER_ROOM = 2

	gameMap!: GameMap
}
