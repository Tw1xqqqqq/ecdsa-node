const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;

app.use(cors());
app.use(express.json());

const balances = {
  "03b35628668e702304da5bdcf8efac1da3caf13840065a31c52cd18145255cf475": 100,
  "039ee3cdeb7f9c14cfb827a17969bce1adbf0844891c530f765d67dff1333fc147": 50,
  "03335cd813df1759212c8e41f6f964f446f078f2e481054c8cb28ac51c029dcf4b": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { transaction, signature } = req.body;
  const { sender, recipient, amount } = transaction;

  try {
    const msgBytes = utf8ToBytes(JSON.stringify(transaction));

    const sigObj = {
      r: BigInt("0x" + signature.r),
      s: BigInt("0x" + signature.s),
    };
    const publicKey = secp256k1.recoverPublicKey(msgBytes, sigObj, signature.recovery);

    const isValid = secp256k1.verify(sigObj, msgBytes, publicKey);
    if (!isValid) {
      return res.status(400).send({ error: "Invalid signature!" });
    }

    if (toHex(publicKey) !== sender) {
      return res.status(400).send({ error: "Sender mismatch!" });
    }

    if (balances[sender] < amount) {
      return res.status(400).send({ error: "Not enough funds!" });
    }
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + amount;

    res.send({ balance: balances[sender] });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;
  const senderHash = keccak256(Uint8Array.from(sender + amount + recipient));
  const isSigned = secp256k1.verify(hexSign, senderHash, sender);
  console.log("Is signed: ", isSigned);
  if (isSigned){
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
  else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}