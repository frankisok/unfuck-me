import { Injectable } from '@angular/core';
import { PlaybackContent } from '../interfaces/playback-content.interface';

@Injectable({
	providedIn: 'root'
})
export class LibraryAssetsService {
	public readonly commonIcons = 'assets/icons';
	public readonly commonImg = 'assets/img';

	constructor() { }

	public ampAudioPlaylistHiIcon = `${ this.commonIcons }/audioPlaylist.hi.svg`
	public ampVideoPlaylistHiIcon = `${ this.commonIcons }/videoPlaylist.hi.svg`
	public ampVideoPlaylistIcon = `${ this.commonIcons }/videoPlaylist.svg`
	public ampAudioPlaylistIcon = `${ this.commonIcons }/audioPlaylist.svg`

	public audioChannelIcon = `${ this.commonIcons }/audio-channel.svg`;
	public audioChannelHiIcon = `${ this.commonIcons }/audio-channel.hi.svg`;

	public attributeIcon = `${ this.commonIcons }/attribute.svg`;
	public attributeHiIcon = `${ this.commonIcons }/attribute.hi.svg`;

	public categoryIcon = `${ this.commonIcons }/category.svg`;
	public categoryHiIcon = `${ this.commonIcons }/category.hi.svg`;

	public channelIcon = `${ this.commonIcons }/channel.svg`;
	public channelHiIcon = `${ this.commonIcons }/channel.hi.svg`;

	public seriesIcon = `${ this.commonIcons }/series.svg`;
	public seriesHiIcon = `${ this.commonIcons }/series.hi.svg`;

	public recentIcon = `${ this.commonIcons }/recent.svg`;
	public recentHiIcon = `${ this.commonIcons }/recent.hi.svg`;

	public artistIcon = `${ this.commonIcons }/artist.svg`;
	public artistHiIcon = `${ this.commonIcons }/artist.hi.svg`;

	public vinylIcon = `${ this.commonIcons }/vinyl.svg`;
	public vinylHiIcon = `${ this.commonIcons }/vinyl.hi.svg`;

	public movieIcon = `${ this.commonIcons }/movie.svg`;
	public movieHiIcon = `${ this.commonIcons }/movie.hi.svg`;

	public musicNoteIcon = `${ this.commonIcons }/music-note.svg`;
	public musicNoteHiIcon = `${ this.commonIcons }/music-note.hi.svg`;

	public masterViewMenuIcon = `${ this.commonIcons }/masterviewMenu.svg`
	public downloadCloud = `${ this.commonIcons }/download-cloud.svg`

	public ampProductIconHi = `${ this.commonIcons }/AMPProduct.hi.svg`
	public ampProductIcon = `${ this.commonIcons }/AMPProduct.svg`
	public ellipsisIcon = `${ this.commonIcons }/ellipsis-icon.svg`
	public editIcon = `${ this.commonIcons }/edit-pen.svg`
	public deleteIcon = `${ this.commonIcons }/delete.svg`
	public minusIcon = `${ this.commonIcons }/minus.svg`
	public plusIcon = `${ this.commonIcons }/plus.svg`
	public moveIcon = `${ this.commonIcons }/move.svg`
	public backIcon = `${ this.commonIcons }/back.svg`
	public infoIcon = `${ this.commonIcons }/info.svg`


	public chevronRightIcon = `${ this.commonImg }/icons_chevron_right.svg`;
	public fastLeftArrowIcon = `${ this.commonImg }/fast-arrow-left.svg`;
	public closeIcon = `${ this.commonImg }/icons_ic_close.svg`

	public searchIcon = `${ this.commonImg }/ic_search.svg`;
	public searchHiIcon = `${ this.commonImg }/ic_search_selected.svg`;

	public missingIcon = `${ this.commonImg }/missing_image.jpg`
	public noteIcon = `${ this.commonImg }/icons_ic_note.png`
	public playCircleIcon = `${ this.commonImg }/play_circle.png`
	public gridDarkIcon = `${ this.commonImg }/ic_grid_view_dark.png`
	public gridLightIcon = `${ this.commonImg }/ic_grid_view_light.png`
	public listDarkIcon = `${ this.commonImg }/ic_list_view_dark.png`
	public listLightIcon = `${ this.commonImg }/ic_list_view_light.png`
	public audioArtistIcon = `${ this.commonImg }/icons_ic_audio_artist_dark.png`
	
	onImgError(event: Event, iconName?: string) {
		const imgElement = event.target as HTMLImageElement;
		imgElement.src = iconName ?? this.missingIcon;
	}

	getCardIcon(content: PlaybackContent): string {
		// this is hack until Ken migrate the image url to contain playback url in them
		if (!content.imageUrl) return '';
		if (content.imageUrl.includes('https://s3')) return content.imageUrl
		let url = content.imageUrl.replace(/^(\.\.\/|\.\/|\/)+/, '');
		if (!url.startsWith('assets/')) {
			url = 'assets/' + url;
		}
		return url
	}
}
