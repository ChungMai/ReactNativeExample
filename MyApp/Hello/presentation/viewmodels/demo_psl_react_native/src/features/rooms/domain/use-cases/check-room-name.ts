export class CheckRoomNameUseCase {
  execute(name: string) {
    return name.trim().length > 0
  }
}
