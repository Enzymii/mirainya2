export type RequireAtLeastOne<T, keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, keys>
> &
  {
    [K in keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keys, K>>>;
  }[keys];

// export type RequireOnlyOne<T, keys extends keyof T = keyof T> =
