import type { PhotoDto } from '../data/dto/PhotoDto';
import { Photo } from '../domain/entities/Photo';

export const photo = (id: string, author: string, width = 400, height = 300): Photo =>
  new Photo(id, author, width, height, `https://unsplash.com/${id}`, `https://picsum.photos/id/${id}/${width}/${height}`);

export const photoDto = (id: string, author: string, width = 400, height = 300): PhotoDto => ({
  id,
  author,
  width,
  height,
  url: `https://unsplash.com/${id}`,
  download_url: `https://picsum.photos/id/${id}/${width}/${height}`,
});

export const samplePhotos: Photo[] = [
  photo('1', 'Zoe Adams', 400, 300),
  photo('2', 'Ann Lee', 300, 400),
  photo('3', 'Adam Smith', 500, 250),
];
