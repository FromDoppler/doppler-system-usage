export function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createPromiseWrapperWithDelay<T = void>(
  ms: number,
  f: () => T
): { promise: () => Promise<T> };
export function createPromiseWrapperWithDelay(ms: number): {
  promise: () => Promise<void>;
};
export function createPromiseWrapperWithDelay(
  ms: number,
  f = () => {
    /* NOOP */
  }
): { promise: () => Promise<unknown> } {
  return {
    promise: async () => {
      await timeout(ms);
      return f();
    },
  };
}

export function createPromiseWrapper<T = void>(
  f: () => T
): { promise: () => Promise<T> };
export function createPromiseWrapper(): {
  promise: () => Promise<void>;
};
export function createPromiseWrapper(
  f = () => {
    /* NOOP */
  }
): { promise: () => Promise<unknown> } {
  return createPromiseWrapperWithDelay(0, f);
}
