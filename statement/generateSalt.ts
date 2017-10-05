
import * as crypto from "crypto";

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateSalt = (letterCount: number = 64) => {
  let salt: string = "";

  for (let i = 0; i < letterCount; i++) {
    let r = Math.floor(Math.random() * letters.length);
    salt += letters[r];
  }

  return salt;
}

export default generateSalt;

const generateUserId = (username: string) => {
  const idSalt = "TtiQcmiCBTKvKiwVTI7ULmkkYil4VNt60tGUFFyjmQNcJdxrM2UGiBo6eXIguhMU";

  let usernameSalt = username + idSalt;
  let hashHex = crypto.createHash("sha512").update(usernameSalt).digest("hex");
  let result = new Buffer(hashHex).toString("base64");
  
  return result.slice(5, 11);
}
