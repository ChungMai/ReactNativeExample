import type { Photo } from '../../domain/entities/Photo';
import type { UseCase } from '../../domain/usecases/UseCase';
import { BaseViewModel } from './BaseViewModel';

export class PhotoDetailViewModel extends BaseViewModel {
  photo: Photo | null = null;

  constructor(
    private readonly getPhotoDetail: UseCase<string, Photo>,
    private readonly id: string,
  ) {
    super();
  }

  override init(): Promise<void> {
    return this.load(
      () => this.getPhotoDetail.execute(this.id),
      photo => {
        this.photo = photo;
      },
    );
  }
}
