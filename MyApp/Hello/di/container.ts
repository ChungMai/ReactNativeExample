import { PicsumApi } from '../data/datasources/PicsumApi';
import { PhotoRepositoryImpl } from '../data/repositories/PhotoRepositoryImpl';
import { StoredCommentRepository } from '../data/repositories/StoredCommentRepository';
import { StoredFavoriteRepository } from '../data/repositories/StoredFavoriteRepository';
import { RandomIdGenerator } from '../data/services/RandomIdGenerator';
import type { KeyValueStorage } from '../data/storage/KeyValueStorage';
import { AddComment } from '../domain/usecases/AddComment';
import { DeleteComment } from '../domain/usecases/DeleteComment';
import { EditComment } from '../domain/usecases/EditComment';
import { GetComments } from '../domain/usecases/GetComments';
import { GetFavorites } from '../domain/usecases/GetFavorites';
import { GetPhotoDetail } from '../domain/usecases/GetPhotoDetail';
import { GetPhotos } from '../domain/usecases/GetPhotos';
import { ToggleFavorite } from '../domain/usecases/ToggleFavorite';
import type { ViewModelFactory } from '../presentation/ViewModelFactory';
import { CommentsViewModel } from '../presentation/viewmodels/CommentsViewModel';
import { PhotoDetailViewModel } from '../presentation/viewmodels/PhotoDetailViewModel';
import { PhotoListViewModel } from '../presentation/viewmodels/PhotoListViewModel';

// Composition root: the only place that knows the concrete classes.
// The storage is injected, so production uses AsyncStorage and tests use memory.
export class Container implements ViewModelFactory {
  private readonly photos: PhotoRepositoryImpl;
  private readonly favorites: StoredFavoriteRepository;
  private readonly comments: StoredCommentRepository;
  private readonly ids = new RandomIdGenerator();

  constructor(storage: KeyValueStorage, api = new PicsumApi()) {
    this.photos = new PhotoRepositoryImpl(api, storage);
    this.favorites = new StoredFavoriteRepository(storage);
    this.comments = new StoredCommentRepository(storage);
  }

  createPhotoListViewModel(): PhotoListViewModel {
    return new PhotoListViewModel(
      new GetPhotos(this.photos),
      new GetFavorites(this.favorites),
      new ToggleFavorite(this.favorites),
    );
  }

  createPhotoDetailViewModel(id: string): PhotoDetailViewModel {
    return new PhotoDetailViewModel(new GetPhotoDetail(this.photos), id);
  }

  createCommentsViewModel(photoId: string): CommentsViewModel {
    return new CommentsViewModel(
      photoId,
      new GetComments(this.comments),
      new AddComment(this.comments, this.ids),
      new EditComment(this.comments),
      new DeleteComment(this.comments),
    );
  }
}
