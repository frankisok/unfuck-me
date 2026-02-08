import { AMPObjectType } from "../enums/amp-object-type.enum";
import { ContentOwner } from "../enums/content-owner";
import { MediaType } from "../enums/media-type";

export class CacheUtils {
  private static readonly AMP_OBJECT_TYPE_URL_MEDIALS = new Map<AMPObjectType, string>([
    [AMPObjectType.AMP_PLAYLIST, 'playlists'],
    [AMPObjectType.AMP_PROGRAMME, 'programmes'],
    [AMPObjectType.AMP_SCHEDULE, 'schedules'],
  ]);


  public static generatePlaybackCacheKey(objectType: AMPObjectType, mediaType: MediaType, contentOwner: ContentOwner): string {
    return `/${CacheUtils.AMP_OBJECT_TYPE_URL_MEDIALS.get(objectType)}/${mediaType}/system/${contentOwner == ContentOwner.SYSTEM ? 'true' : 'false'}`;
  }

  // Remove all parts of the url upto and including the account number
  public static generateGenericCacheKey(url: string): string {
    return url.replace(/^.*\/AM\d+/, '');
  }

}
