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

export const addXY = (p1: Point, p2: Point): Point => {
	return { x: p1.x + p2.x, y: p1.y + p2.y }
}

export const isEqual = (p1: Point, p2: Point) => {
	return JSON.stringify(p1) === JSON.stringify(p2)
}

export const getDistance = (pos1: Point, pos2: Point) => {
	return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2)
}
