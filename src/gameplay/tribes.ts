import { Island } from '../islandgen'
export class Tribe {
	name: string
	island: Island
	constructor(name: string, island: Island) {
		this.name = name
		this.island = island
	}
}

export const generateTribes = (
	islands: Island[],
	limit: number = 4
): Tribe[] => {
	const tribes: Tribe[] = []

	for (let i = 0; i < islands.length; i++) {
		console.log(islands[i].locations.length)
		if (islands[i].locations.length > 50 && tribes.length <= limit)
			tribes.push(new Tribe(`Tribe ${i}`, islands[i]))
	}
	return tribes
}
