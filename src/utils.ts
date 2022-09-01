import { RNG } from 'rot-js'
import { DIR } from './input-handler'
export const generateRandomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export const generateRandomPoint = (
	minX: number,
	maxX: number,
	minY: number,
	maxY: number
): Point => {
	const x = Math.floor(Math.random() * (maxX - minX + 1) + minX)
	const y = Math.floor(Math.random() * (maxY - minY + 1) + minY)
	return { x: x, y: y }
}

export const getRandomDir = (): Point => {
	switch (generateRandomNumber(0, 3)) {
		case 0:
			return DIR.ArrowUp
		case 1:
			return DIR.ArrowDown
		case 2:
			return DIR.ArrowLeft
		case 3:
			return DIR.ArrowRight
		default:
			return { x: 0, y: 0 }
	}
}

export const addXY = (p1: Point, p2: Point): Point => {
	return { x: p1.x + p2.x, y: p1.y + p2.y }
}
export const multiplyXY = (pos: Point, modifier: number): Point => {
	return { x: pos.x * modifier, y: pos.y * modifier }
}

export const isEqual = (p1: Point, p2: Point) => {
	return JSON.stringify(p1) === JSON.stringify(p2)
}

export const getDistance = (pos1: Point, pos2: Point) => {
	return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2)
}

export const getCircle = (center: Point, radius: number): Point[] => {
	const coordsInCircle: Point[] = []
	const top = Math.ceil(center.y - radius)
	const bottom = Math.floor(center.y + radius)
	const left = Math.ceil(center.x - radius)
	const right = Math.floor(center.x + radius)

	const inside_circle = (center: Point, tile: Point, radius: number) => {
		const dx = center.x - tile.x
		const dy = center.y - tile.y
		const distance_squared = dx * dx + dy * dy
		return distance_squared <= radius * radius
	}

	for (let y = top; y <= bottom; y++) {
		for (let x = left; x <= right; x++) {
			if (inside_circle(center, { x: x, y: y }, radius)) {
				coordsInCircle.push({ x: x, y: y })
			}
		}
	}
	return coordsInCircle
}
