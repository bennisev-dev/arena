import { clsx } from 'clsx';

export const cn = (...inputs: Array<string | false | null | undefined>): string => {
  return clsx(inputs);
};

export const currency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value
  );
};

export const number = (value: number): string => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
};

export const percentage = (value: number): string => {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}%`;
};
