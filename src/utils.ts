export const generateRandomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export const addXY = (p1: Point, p2: Point): Point => {
	return { x: p1.x + p2.x, y: p1.y + p2.y }
}
