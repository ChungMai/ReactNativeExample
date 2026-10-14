// Rich entity: data plus the behavior that belongs to it.
export class Photo {
  constructor(
    readonly id: string,
    readonly author: string,
    readonly width: number,
    readonly height: number,
    readonly pageUrl: string,
    readonly downloadUrl: string,
  ) {}

  get aspectRatio(): number {
    return this.width / this.height;
  }
}
