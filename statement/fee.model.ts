
export interface Fee {
  [key: string]: any;
  name: string;
  amount: number | FeeAmount;
  type: FeeType;
}

interface FeeAmount {
  monthly: number;
  termly: number;
  annually: number;
}

export type FeeType =
  "class" |
  "costume" |
  "exam" |
  "festival" |
  "interest" |
  "preschool" |
  "private" |
  "registration";

export const FeeTypes: FeeType[] = [
  "class",
  "costume",
  "exam",
  "festival",
  "interest",
  "preschool",
  "private",
  "registration"
];