import { Tag } from '../../ampngcore/models';

export interface AudioLibraryDelegate {
    getGenresFromTags(tags: Array<Tag>): string;
}