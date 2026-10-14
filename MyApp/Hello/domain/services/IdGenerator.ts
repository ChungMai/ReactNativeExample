// Contract only: how ids are produced is an infrastructure detail (see data/services).
export interface IdGenerator {
  next(): string;
}
