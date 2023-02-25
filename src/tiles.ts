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
	water: boolean
	dark: Graphic
	light: Graphic
	name?: string
	location?: Point
}

export const createTile = (
	bg: string = Colors.Transparent,
	fg: string = Colors.Transparent,
	name: string = ''
): Tile => {
	return {
		walkable: true,
		transparent: false,
		visible: false,
		seen: false,
		water: false,
		dark: { char: ' ', fg: fg, bg: bg },
		light: { char: ' ', fg: fg, bg: bg },
		name: name,
	}
}

export const TEST: Tile = {
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.White },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.White },
}

export const MOUNTAIN: Tile = {
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.Gray },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.Gray },
}

export const SNOW: Tile = {
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.GrayLight },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.GrayLight },
}

export const FOREST: Tile = {
	name: 'forest',
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.DarkGreen },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.DarkGreen },
}

export const MEADOW: Tile = {
	name: 'meadow',
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.Green },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.Green },
}

export const SAND: Tile = {
	name: 'sand',
	walkable: true,
	transparent: false,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.Transparent, bg: Colors.BrownYellow },
	light: { char: ' ', fg: Colors.Transparent, bg: Colors.BrownYellow },
}

export const WATER_DEEP: Tile = {
	name: 'water_deep',
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	water: false,
	dark: { char: ' ', fg: Colors.BlueDark, bg: Colors.BlueDark },
	light: { char: ' ', fg: Colors.BlueDark, bg: Colors.BlueDark },
}
export const WATER_SHALLOW: Tile = {
	name: 'water_shallow',
	walkable: true,
	transparent: true,
	visible: false,
	seen: false,
	water: true,
	dark: { char: ' ', fg: Colors.Blue, bg: Colors.Blue },
	light: { char: ' ', fg: Colors.Blue, bg: Colors.Blue },
}
/*
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

*/
