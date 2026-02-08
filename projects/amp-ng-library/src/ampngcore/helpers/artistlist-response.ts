import { Artist } from '../models';

export class ArtistListResponse {
  responseCode: string;
  responseData: Artist[];
}
