import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate',
    standalone: true
})
export class TruncatePipe implements PipeTransform {

	transform(value: string, limit: number, completeWords = false, ellipsis = '...') {
		if (completeWords) {
			limit = value.substr(0, limit).lastIndexOf(' ');
		}
		if (value && value.length > limit) {
			return `${ value.substr(0, limit) }${ ellipsis }`;
		} else {
			return value;
		}
	}

}
