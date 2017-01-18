'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.round = round;
exports.ceil = ceil;
exports.floor = floor;
exports.monkey = monkey;
function round(precision, rawKey) {
	var _this = this;

	var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'round';

	var methods = {
		hours: {
			name: 'Hours',
			maxValue: 24
		},
		minutes: {
			name: 'Minutes',
			maxValue: 60
		},
		seconds: {
			name: 'Seconds',
			maxValue: 60
		},
		milliseconds: {
			name: 'Milliseconds',
			maxValue: 1000
		}
	};

	var keys = {
		mm: methods.milliseconds.name,
		milliseconds: methods.milliseconds.name,
		Milliseconds: methods.milliseconds.name,
		s: methods.seconds.name,
		seconds: methods.seconds.name,
		Seconds: methods.seconds.name,
		m: methods.minutes.name,
		minutes: methods.minutes.name,
		Minutes: methods.minutes.name,
		H: methods.hours.name,
		h: methods.hours.name,
		hours: methods.hours.name,
		Hours: methods.hours.name
	};

	var maxValue = void 0;
	var value = 0;
	var rounded = false;
	var subRatio = 1;

	var needsPluralized = function needsPluralized(k) {
		return k.length > 1 && k !== 'mm' && k.slice(-1) !== 's';
	};
	var key = keys[needsPluralized(rawKey) ? rawKey + 's' : rawKey].toLowerCase();

	if (!methods[key]) {
		throw new Error('Invalid method ' + key + '. Try one of: ' + Object.keys(methods).join());
	}

	var get = 'get' + methods[key].name;
	var set = 'set' + methods[key].name;

	Object.keys(methods).forEach(function (k) {
		if (k === key) {
			value = _this._d[get]();
			maxValue = methods[k].maxValue;
			rounded = true;
		} else if (rounded) {
			subRatio *= methods[k].maxValue;
			value += _this._d['get' + methods[k].name]() / subRatio;
			_this._d['set' + methods[k].name](0);
		}
	});

	value = Math[direction](value / precision) * precision;
	value = Math.min(value, maxValue);
	this._d[set](value);

	return this;
}

function ceil(precision, key) {
	return this.round(precision, key, 'ceil');
}

function floor(precision, key) {
	return this.round(precision, key, 'floor');
}

function monkey(moment) {
	moment.fn.round = round;
	moment.fn.ceil = ceil;
	moment.fn.floor = floor;

	return moment;
}