export const label = (enabled: boolean) => enabled ? "enabled" : "disabled";
export function classify(value: number) {
  if (value < 0) return "negative";
  if (value === 0) return "zero";
  return "positive";
}
export function makeSelector(seed = 0) {
  return (increment = 1) => {
    if (increment < 0) return seed;
    return seed + increment;
  };
}
export class Client {
  constructor(public seed = 0) {}
  get selected() { return this.seed; }
  compute(value: number) { return value > this.seed ? value : this.seed; }
}
export function empty() {}
export function overload(value: string): string;
export function overload(value: number): number;
export function overload(value: string | number) { return value; }
