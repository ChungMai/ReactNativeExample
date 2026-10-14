// One contract for every use case: generic over its input and output (slides 19, 22).
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
