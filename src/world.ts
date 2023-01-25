import { WorldMap } from './overworld';
export class World {
	public static readonly MAP_WIDTH = 80 * 4;
	public static readonly MAP_HEIGHT = 43 * 4;
	public static readonly MAX_DEPTH = 5;
	public static readonly MAX_ISLANDS = 5;
	public static readonly MAX_ROOMS = 6;
	public static readonly MIN_ROOM_SIZE = 3;
	public static readonly MAX_ROOM_SIZE = 23;

	worldMap!: WorldMap;
}
