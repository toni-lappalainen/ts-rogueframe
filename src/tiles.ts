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

export const createTile = (
	bg: string = Colors.Transparent,
	fg: string = Colors.Transparent
): Tile => {
	return {
		walkable: true,
		transparent: false,
		visible: false,
		seen: false,
		dark: { char: ' ', fg: fg, bg: bg },
		light: { char: ' ', fg: fg, bg: bg },
	}
}

export const LAND: Tile = {
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	dark: { char: ' ', fg: Colors.Gray, bg: Colors.Transparent },
	light: { char: ' ', fg: Colors.White, bg: Colors.Transparent },
}

export const WATER_DEEP: Tile = {
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	dark: { char: '~', fg: Colors.BlueDark, bg: Colors.Black },
	light: { char: '~', fg: Colors.BlueDark, bg: Colors.Black },
}
export const WATER_SHALLOW: Tile = {
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	dark: { char: '~', fg: Colors.Blue, bg: Colors.Black },
	light: { char: '~', fg: Colors.Blue, bg: Colors.Black },
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
