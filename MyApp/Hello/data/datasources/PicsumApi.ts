import type { PhotoDto } from '../dto/PhotoDto';

const BASE_URL = 'https://picsum.photos';

export class PicsumApi {
  async fetchPhotos(page: number, limit: number): Promise<PhotoDto[]> {
    return this.get<PhotoDto[]>(`/v2/list?page=${page}&limit=${limit}`);
  }

  async fetchPhoto(id: string): Promise<PhotoDto> {
    return this.get<PhotoDto>(`/id/${id}/info`);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }
}
