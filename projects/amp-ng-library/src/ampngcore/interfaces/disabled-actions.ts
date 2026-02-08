export interface DisableActions {
    audioLibPlay?: boolean;
    videoLibPlay?: boolean;
    audioPlaylistPlay?: boolean;
    videoPlaylistPlay?: boolean;
    disableCardActions?: boolean; // on playlist card only
    disableSelect?: boolean; // used to disable select based on media type
    disableDirectDetailView?: boolean; // if this true it disables card click which results in seeing detail view, default is false, a click shows card detail view
}
