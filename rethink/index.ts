import * as r from "rethinkdb";
import * as socketio from "socket.io";

const io = socketio(12000);

io.on("connection", socket => {
  console.log("user connected...");
  
  socket.on("disconnect", () => {
    console.log("user disconnected...");
  });
});

interface Student {
  firstName: string;
  lastName: string;
}

const connect = (): Promise<any> => {
  return r.connect({
    host: "localhost",
    port: 28015,
    db: "rlds"
  });
};

const start = async () => {
  try {
    let conn = await connect();
    console.log("Connected to rethink db!");
    
    let cursor = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      //.slice(3, 6)
      .pluck("firstName", "lastName", "grade")
      .run(conn);
    
    //console.log(cursor);

    cursor.each((err, row) => {
      console.log(row);
    });

    /*let group = await r.table("students")
      .group({ index: "gradeName" })
      .count()
      .run(conn);

    console.log(group);*/

    /*let accounts = await r.table("accounts").merge((account) => {
      return {
        subAccounts: r.table("accounts")
          .getAll(account("id"), { index: "parentAccountId" })
          .without("parentAccountId")
          .coerceTo("array")
      }
    })
    .run(conn);

    accounts.each((err, account) => {
      console.log(account);
    });*/

    /*let result = await r.table("transactions")
      .group("accountId")
      .ungroup()
      .map((groupTx) => {
        let debits = groupTx("reduction").hasFields("debit").map((tx) => tx("debit"));
        let credits = groupTx("reduction").hasFields("credit").map((tx) => tx("credit"));

        let totalDebits = r.sum(debits);
        let totalCredits = r.sum(credits);

        return {
          accountId: groupTx("group"),
          debits,
          credits,
          balance: totalDebits.sub(totalCredits)
        }
      })
      .run(conn);

    result.each((err, value) => {
      console.log(value);
    });*/

    /*let result = await r.table("accounts")
      .merge(account => {
        return {
          transactions: r.table("transactions")
            .getAll(account("id"), { index: "accountId" })
            .coerceTo("array")
            .setUnion(r.branch(account.hasFields("subAccounts"),
              r.table("transactions")
               .getAll(r.args(account("subAccounts")), { index: "accountId" })
               .coerceTo("array"),
              []))
        };
      })
      .merge(account => {
        var debits = account("transactions")
          .hasFields("debit")
          .map(tx => tx("debit"));
        
        var credits = account("transactions")
          .hasFields("credit")
          .map(tx => tx("credit"));
        
        var totalDebits = r.sum(debits);
        var totalCredits = r.sum(credits);
        var balance = totalDebits.sub(totalCredits);
        
        return {
          balance: r.branch(r.expr(["asset", "income"]).contains(account("type")),
            r.branch(r.expr(balance).ge(0),
              { debit: balance },
              { credit: r.expr(balance).mul(-1) }),
            r.branch(r.expr(balance).ge(0),
              { credit: balance },
              { debit: r.expr(balance).mul(-1) }))
        };
      })
      .pluck("id", "name", "balance")
      .run(conn);

    await result.eachAsync(row => {
      console.log(row);
    });*/

    

    let txChangeFeed = await r.table("transactions").changes().run(conn);

    txChangeFeed.each(async (err, change: Change<Tx>) => {
      let { accountId } = getNewValues(change, "accountId");
      let balance = await calculateBalance(accountId, conn);

      await updateAccountBalance(accountId, balance, conn);

      io.emit("balance", { balance });
    });
    
  } catch (err) {
    console.error(err);
  }
};

interface Change<T> {
  old_val?: T;
  new_val?: T;
}

interface Tx {
  id: string;
  accountId: string;
  debit?: number;
  credit?: number;
}

const pluck = <T, K extends keyof T>(obj: T, keys: K[]): T[K][] => {
  return keys.map(key => obj[key]);
}

const isInsert = <T>(change: Change<T>) => change.new_val && change.old_val === null;
const isDelete = <T>(change: Change<T>) => change.old_val && change.new_val === null;
const isUpdate = <T>(change: Change<T>) => change.old_val && change.new_val;

const hasValueChanged = <T, K extends keyof T>(change: Change<T>, key: K) => {
  if (isUpdate(change)) {
    return change.old_val[key] === change.new_val[key];
  }

  return true;  
}

type ChangeSet<T, K extends keyof T> = { [key in K]?: T[K] };

const getNewValues = <T, K extends keyof T>(change: Change<T>, ...keys: K[]): ChangeSet<T, K> => {
  let changeSet: ChangeSet<T, K> = {};

  keys.forEach(key => {
    let newValue = change.new_val;

    if (!newValue || !newValue[key]) {
      return;
    }

    changeSet[key] = change.new_val[key];
  });

  return changeSet;
};



const getAccount = (accountId: string) => {
  return r.table("accounts").get<Account>(accountId);
}

const calculateBalance = (accountId: string, conn): Promise<number> => {
  return r.table("transactions")
    .filter({ accountId })
    .map(tx => tx("debit").default(0).sub(tx("credit").default(0)))
    .sum()
    .run(conn);
}

const updateAccountBalance = (accountId: string, newBalance: number, conn) => {
  return getAccount(accountId)
    .update({ balance: newBalance })
    .run(conn);
}

const handleTxInsert = (newTx: Tx) => {
  return getAccount(newTx.accountId)
    .update(account => {
      return {
        balance: account("balance").default(0)
          .add(newTx.debit || 0)
          .sub(newTx.credit || 0)
      };
    });
}

const handleTxDelete = (oldTx: Tx) => {
  return getAccount(oldTx.accountId)
    .update(account => {
      return {
        balance: account("balance").default(0)
          .sub(oldTx.debit || 0)
          .add(oldTx.credit || 0)
      }
    });
}

start();