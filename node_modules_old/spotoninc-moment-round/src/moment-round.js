export function round(precision, rawKey, direction = 'round') {
	const methods = {
		hours: {
			name: 'Hours',
			maxValue: 24,
		},
		minutes: {
			name: 'Minutes',
			maxValue: 60,
		},
		seconds: {
			name: 'Seconds',
			maxValue: 60,
		},
		milliseconds: {
			name: 'Milliseconds',
			maxValue: 1000,
		},
	};

	const keys = {
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
		Hours: methods.hours.name,
	};

	let maxValue;
	let value = 0;
	let rounded = false;
	let subRatio = 1;

	const needsPluralized = (k) => k.length > 1 && k !== 'mm' && k.slice(-1) !== 's';
	const key = keys[needsPluralized(rawKey) ? `${rawKey}s` : rawKey].toLowerCase();

	if (!methods[key]) {
		throw new Error(`Invalid method ${key}. Try one of: ${Object.keys(methods).join()}`);
	}

	const get = `get${methods[key].name}`;
	const set = `set${methods[key].name}`;

	Object.keys(methods).forEach((k) => {
		if (k === key) {
			value = this._d[get]();
			maxValue = methods[k].maxValue;
			rounded = true;
		} else if (rounded) {
			subRatio *= methods[k].maxValue;
			value += this._d[`get${methods[k].name}`]() / subRatio;
			this._d[`set${methods[k].name}`](0);
		}
	});

	value = Math[direction](value / precision) * precision;
	value = Math.min(value, maxValue);
	this._d[set](value);

	return this;
}

export function ceil(precision, key) {
	return this.round(precision, key, 'ceil');
}

export function floor(precision, key) {
	return this.round(precision, key, 'floor');
}

export function monkey(moment) {
	moment.fn.round = round;
	moment.fn.ceil = ceil;
	moment.fn.floor = floor;

	return moment;
}
