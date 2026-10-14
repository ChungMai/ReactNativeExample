import type { CommentsViewModel } from './viewmodels/CommentsViewModel';
import type { PhotoDetailViewModel } from './viewmodels/PhotoDetailViewModel';
import type { PhotoListViewModel } from './viewmodels/PhotoListViewModel';

// What the UI needs from the outside world. The composition root (di/container.ts)
// implements it, so the presentation layer never imports concrete data classes.
export interface ViewModelFactory {
  createPhotoListViewModel(): PhotoListViewModel;
  createPhotoDetailViewModel(id: string): PhotoDetailViewModel;
  createCommentsViewModel(photoId: string): CommentsViewModel;
}
