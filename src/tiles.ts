import { Colors } from './values'

export interface Graphic {
	char: string
	fg: string
	bg: string
}

export interface Tile {
	walkable: boolean
	transparent: boolean
	visible: boolean
	seen: boolean
	dark: Graphic
	light: Graphic
}

export const FLOOR: Tile = {
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	dark: { char: ' ', fg: Colors.White, bg: Colors.Black },
	light: { char: ' ', fg: Colors.White, bg: Colors.Yellow },
}

export const WALL: Tile = {
	walkable: false,
	transparent: false,
	visible: false,
	seen: false,
	dark: { char: '#', fg: Colors.White, bg: Colors.Black },
	light: { char: ' ', fg: '#fff', bg: Colors.BrownLight },
}
