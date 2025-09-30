import { keccak256 } from "ethereum-cryptography/keccak.js"
import * as secp from "ethereum-cryptography/secp256k1";
import { useState } from "react";
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
  evt.preventDefault();

  const transaction = {
    sender: address,
    recipient,
    amount,
  };

  const msgBytes = utf8ToBytes(JSON.stringify(transaction));

  const signature = await secp.secp256k1.sign(msgBytes, privateKey);

  const {
    data: { balance },
  } = await server.post(`send`, {
    transaction,
    signature: {
      r: toHex(signature.r),
      s: toHex(signature.s),
      recovery: signature.recovery,
    },
  });

  setBalance(balance);
}


  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;