// Swift: handleFavorites (the "Add to Favourites" picker).
import { AppError } from '../../../../shared/domain/app-error'
import type { Room } from '../../../rooms'
import type { FavouriteIds } from '../entities/favourites'
import type { HomeRepository } from '../repositories/home-repository'

export type FavouriteSelection = FavouriteIds & { room: string[] }

export interface RoomFavourites {
  getRooms(): Room[]
  setFavourite(roomId: string, favourite: boolean): void
}

export class SaveFavouritesUseCase {
  constructor(private repository: HomeRepository, private rooms: RoomFavourites) {}

  /** Replaces all favourites with `selection`. Throws an AppError when the server is offline. */
  execute({ room, ...others }: FavouriteSelection): void {
    if (!this.repository.getState().serverOnline) throw new AppError('network', 'Server unreachable')
    for (const r of this.rooms.getRooms()) {
      const favourite = room.includes(r.id)
      if (r.favourite !== favourite) this.rooms.setFavourite(r.id, favourite)
    }
    this.repository.saveFavourites(others)
  }
}
