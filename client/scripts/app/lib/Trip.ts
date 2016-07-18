import {TripDay} from "./TripDay";

export class Trip {
	constructor(
		public region: string,
		public description: string,
		public company: string,
		public ship: string,
		public starting_price: number,
		public reviewed_by: Array<string>,
		public match: number,
		public map_url: string,
		public trip_days: Array<TripDay>
	) {

	}
}