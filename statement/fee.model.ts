
export interface Fee {
  [key: string]: any;
  id?: string;
  name: string;
  amount: number | FeeAmount;
  type: FeeType;
  accountId: string;
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