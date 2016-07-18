import { Recommendation } from '../../services/rest/recommendations';
import { BASE_URL } from '../../services/rest/constants';

var $ = require('jquery');
var moment = require('moment');

exports.buildDetail = function(recommendation: Recommendation, cb) {
	let detail = $(`
		<div class="saltie-rec-itinerary-container" style="position: relative; top: -4px; padding-top: 30px;">
			<div>
				<img style="width: 100%; position: relative; top: -30px; margin-bottom: 7px; left: 5px;" src="${BASE_URL}/${recommendation.detail.iteneraryImage}"></div>
			<div class="saltie-itenerary">
			</div>
		</div>
	`);

	let detailList = detail.find('div.saltie-itenerary');
	let startingDate = moment(recommendation.detail.startingFrom);
	recommendation.detail.iteneraryDays.forEach((day, index, arr) => {
		let date = startingDate.add('days', index);
		let departureInfo = `<span class="saltie-iti-deptit">${day.portName}</span>`;
		let noBorder = '';

		if (index === 0) {
			departureInfo = `<span class="saltie-iti-deptit">EMBARK ${day.departure}</span> <span class='saltie-iti-depsub'>${day.portName}</span>`;
		} else if(index + 1 === arr.length) {
			departureInfo = `<span class="saltie-iti-deptit">DISEMBARK ${day.arrival}</span> <span class='saltie-iti-depsub'>${day.portName}</span>`;
			noBorder = 'no-left-border';
		}

		let portDesc = day.portDesc !== '---' ? day.portDesc : '';

		detailList.append($(`
			<div class="saltie-itinerary-detail-item ${noBorder}">
				<div class="saltie-itinerary-dot"></div>
				<div class="saltie-itinerary-repos-item color-gold"><span class="saltie-iti-title">${day.day.replace('d', 'D')}</span><span class="saltie-iti-subtitle">${date.format('ll')}</span></div>
				<div style="margin-bottom: 10px;" class="saltie-itinerary-repos-item">${departureInfo}</div>
				<div class="saltie-itinerary-repos-item saltie-itinerary-repos-item-content saltie-iti-portdesc">${portDesc}</div>
			</div>
		`));
	});

	let moreInfo = $(`
		<div style="text-align: center; margin-bottom: 40px;">
			<button class="saltie-button-o" style="margin-top: 15px; margin-bottom: 10px;">More Information</button>
		</div>
	`);

	detailList.append(moreInfo);

	moreInfo.on('click', () => {
		cb(recommendation.tripId);
	});

	return detail;
}

exports.buildRecommendationDetail = function (recommendation: Recommendation) {
	return `
			<div class="saltie-recommendation-list-item" style="overflow: hidden;">
				<div style="position:relative; height: 0px; width: 100%; margin-bottom: -5px;">
					<div style="height: 363px; overflow: hidden; width: 100%;">
						<img src="${BASE_URL}${recommendation.destinationImage}">
					</div>
				</div>
				<div class="saltie-recommendation-container" style="overflow: hidden;">
					<div class="saltie-rec-star">
						<img class="saltie-rec-star" src="${require('../../../../theme/imgs/saltie-starfish.svg')}">
					</div>
					<div class="row saltie-list-item-recommendations saltie-white">
						<div class="saltie-rec-region saltie-mlarge" style="text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);">
							${recommendation.tripName}
						</div>
						<div class="saltie-rec-descrip saltie-medium saltie-weight-300">
							${recommendation.tripDesc}
						</div>
						<div class="saltie-rec-company saltie-weight-300" style="margin-top: 10px;">
							${recommendation.cruiseLineName}
						</div>
						<div class="saltie-weight-300">
							<span>${recommendation.shipName}</span>
							<span style="float: right;">From <span class="saltie-weight-500">$${recommendation.priceFrom}</span></span>
						</div>

						<!-- Dev -->
						<div class="saltie-rec-footer" style="margin-top: 20px;">
							<div class="saltie-dark-blue">
							</div>
							<div class="saltie-rec-footer-content" style="height: 57px;">
								<div class="saltie-rec-match" style="float: left;">
									<span class="saltie-weight-500">${recommendation.matchPercent}%</span> match
								</div>
								<div class="saltie-rec-reviewed-as" style="top: 0px;">
									<div>
										Cruisers reviewed as:
									</div>
									<div class="saltie-smedium saltie-weight-300" style="width: 160px;">
										${recommendation.matchReason ? recommendation.matchReason : "No reviews yet."}
									</div>
								</div>
								<div class="saltie-rec-collapse">
									<img class="saltie-rec-downarrow" src="${require('../../../../theme/imgs/down-arrow.svg')}">
								</div>
							</div>
						</div>

						<!-- Detail -->
						<div class="saltie-rec-detail-container">

						</div>
			        </div>
		        </div>
	        </div>
		`;
}