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

export const STAIRS_DOWN: Tile = {
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	dark: { char: '>', fg: Colors.Gray, bg: Colors.Black },
	light: { char: '>', fg: Colors.White, bg: Colors.Black },
}

export const FLOOR: Tile = {
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	dark: { char: '.', fg: Colors.Gray, bg: Colors.Black },
	light: { char: '.', fg: Colors.White, bg: Colors.Black },
}

export const WALL: Tile = {
	walkable: false,
	transparent: false,
	visible: false,
	seen: false,
	dark: { char: '#', fg: Colors.Gray, bg: Colors.Black },
	light: { char: '#', fg: Colors.White, bg: Colors.Black },
}
