import { Photo } from '../../domain/entities/Photo';
import type { PhotoDto } from '../dto/PhotoDto';

export const toPhoto = (dto: PhotoDto): Photo =>
  new Photo(dto.id, dto.author, dto.width, dto.height, dto.url, dto.download_url);

export const toPhotoDto = (photo: Photo): PhotoDto => ({
  id: photo.id,
  author: photo.author,
  width: photo.width,
  height: photo.height,
  url: photo.pageUrl,
  download_url: photo.downloadUrl,
});
