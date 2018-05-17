import { AccountType } from "../account.model";

/**
 * Options to filter the list of accounts by type and sub-type
 */
export type AccountFilterOptions = {
  
  /**
   * The account type to filter
   */
  type?: AccountType;

  /**
   * The account sub-type to filter
   */
  subType?: string;
};
