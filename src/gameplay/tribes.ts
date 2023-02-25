import { Island } from '../islandgen'
import { generateRandomNumber, getRandomFromArray } from '../utils'
export class Tribe {
	name: string
	island: Island
	population!: number
	resources!: Resources
	center!: Point
	constructor(name: string, island: Island) {
		this.name = name
		this.island = island
		this.population = generateRandomNumber(4, 8)
		this.resources = new Resources()
		this.center = getRandomFromArray(this.island.locations)
	}
}

export const generateTribes = (
	islands: Island[],
	limit: number = 4
): Tribe[] => {
	const tribes: Tribe[] = []

	for (let i = 0; i < islands.length; i++) {
		if (islands[i].locations.length > 50 && tribes.length < limit)
			tribes.push(new Tribe(`Tribe ${i}`, islands[i]))
	}
	return tribes
}

export class Resources {
	wood = generateRandomNumber(3, 12)
	stone = generateRandomNumber(2, 4)
	fish = generateRandomNumber(15, 20)
	animals = generateRandomNumber(2, 5)
	iron = generateRandomNumber(2, 4)
	tools = generateRandomNumber(2, 4)
	weapons = generateRandomNumber(0, 1)
	boats = generateRandomNumber(2, 3)
	ships = 0
}
