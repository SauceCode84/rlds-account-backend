import * as r from "rethinkdb";

import { onConnect } from "./data-access";
import { getValueFromChange } from "./changefeed";

import { Account } from "./account.model";
import { AccountService } from "./account.service";

type ParentAccount = { parentAccountId: string };

onConnect(async (err, connection) => {
  const service = new AccountService(connection);

  let accountChangeFeed = await r.table("accounts")
    .pluck("id", "debit", "credit")
    .changes()
    .run(connection);
  
  accountChangeFeed.each(async (err, change: r.Change<Account>) => {
    let { id } = getValueFromChange(change);
    let account = await service.getAccount(id);
  
    let balance = AccountService.calculateBalance(account);
  
    console.log(`account change... new balance: ${balance}`);
  
    service.updateBalance(id, balance);
  });

  let parentAccountChangeFeed = await r.table("accounts")
    .pluck("id", "debit", "credit")
    .changes()
    .concatMap((change: r.Expression<r.Change<Account>>) => {
      let subAccountId = change("new_val")("id");
    
      return r.table("accounts")
        .filter(account => account("subAccounts").contains(subAccountId))
        .map(account => {
          return { left: change, right: { parentAccountId: account("id") } };
        });
    })
    .zip()
    .run(connection);

    parentAccountChangeFeed.each(async (err, change: r.Change<Account> & ParentAccount) => {
      let { parentAccountId } = change;
      let parentAccount = await service.getAccount(parentAccountId);
  
      if (parentAccount) {
        let { debit, credit } = AccountService.calculateAccountValues(parentAccount, change);

        console.log(`Parent Account '${parentAccount.name}' changefeed...`);
        console.log(`Debit: ${debit}, Credit: ${credit}`);
  
        service.updateAccountValues(parentAccountId, { debit, credit });
      }
    });
});

