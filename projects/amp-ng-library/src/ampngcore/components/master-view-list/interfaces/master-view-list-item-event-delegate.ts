
export interface MasterViewListItemEventDelegate {
    listItemSelected(evPayload: {event, nestedDepth: number}, listItem);
    updateSearchTerm?(searchTerm): void;
}
