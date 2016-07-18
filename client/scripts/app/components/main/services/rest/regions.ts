let ls = require('local-storage');

export enum REGIONS {
	Carribean,
	CentralAmerica,
	NewEngland,
	PacificNorthwest,
	Alaska
}

export class Regions {
	private regions: Set<number>;
	constructor() {
		this.regions = ls('regions') ? new Set<number>(ls('regions')) : new Set<number>();
	}

	store() {
		let regions = [];
		this.regions.forEach((_) => {
			regions.push(_);
		});
		ls('regions', regions);
	}

	add(region: number) {
		this.regions.add(region);
		this.store();
	}

	delete(region: number) {
		this.regions.delete(region);
		this.store();
	}

	has(region: number) {
		return this.regions.has(region);
	}

	toggle(region: number) {
		if (this.regions.has(region)) {
			this.regions.delete(region);
		} else {
			this.regions.add(region);
		}
		this.store();
	}
}