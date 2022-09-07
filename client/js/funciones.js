function enviarTransaccion(event){
  event.preventDefault();
  var { destinatario, cantidad} = event.target;

  doSend(
    JSON.stringify({
      type: "ADD_TRANSACTION",
      to: destinatario.value,
      amount: cantidad.value,
    })
  )
}

function pendingBlock(event) {
  event.preventDefault();

  doSend(
    JSON.stringify({
      type: "PENDING_BLOCK"
    })
  )
}

async function calculateHash(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

async function _mineBlock(block) {
  let hash = "";
  let nonce = 0;

  while (
    hash.substring(0, block.difficulty) !==
    Array(block.difficulty + 1).join("0")
  ) {
    nonce++;
    const jsonTransactions = JSON.stringify(block.transactions);

    hash = await calculateHash(
      block.previousHash + block.version + await calculateHash(
      block.timestamp + block.version + jsonTransactions
    ) + nonce
    );
    console.log('HASHING', block.previousHash + block.version + await calculateHash(
      block.timestamp + block.version + jsonTransactions
    ) + nonce);
  }
  return {hash, nonce};
}

async function mineBlock(block) {
  // We need this block-data to mine the block -> previousHash, version, timestamp, transactions
  // On mine Block request, send the block data (with pending transactions and reward transaction added)
  // If mined successfully then send the result back and broadcast it to all peers.
  console.log("PENDING BLOCK DATA IS", block);
  const mineButton = document.getElementById("mine");
  mineButton.innerHTML = "Mining...";
  mineButton.disabled = 'true';

  const { hash, nonce } = await _mineBlock(block);

  console.log(`Block mined: ${hash}, ${nonce}, ${JSON.stringify(block)}`);

  doSend(
    JSON.stringify({
      type: "MINED_BLOCK",
      data: { hash, nonce, block },
    })
  );
}

function init() {
  console.info("Websocket client connetion request")
  wsConnect()
}

function wsConnect() {
  websocket = new WebSocket("ws://localhost:8000")
  websocket.onopen = function () {
    console.log("✅WebSocket Client Connected")
  };

  websocket.onmessage = function (e) {
    if (typeof e.data === "string") {
      console.log('Recived Msg: ' + JSON.stringify(e.data) )
      onMessage(e)
    }
  }
}

function onOpen() {
  document.getElementById("enviar").disabled = false;

  doSend("Hola")
}


function onClose() {
  document.getElementById("enviar").disabled = true;

  setTimeout(function () {
    wsConnect();
  }, 2000);
}

async function onMessage (evt) {
  let mensaje = evt.data;

  const data = JSON.parse(mensaje)
  console.log('DATA 2', data)
  if (data.type === "PENDING_BLOCK"){
    await mineBlock(data.data)
  }

  if (data.type === "MINING"){
    document.getElementById("mine").disabled = true;
  }

  if (data.type === "NEW_CHAIN") {
    const area = document.getElementById("blockchain")
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
    document.getElementById("mine").innerHTML = "Mine Block";
    document.getElementById("mine").disabled = false;
  }

  if (data.type === "NEW_TRANSACTION") {
    const area = document.getElementById("transactions")
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
  }

  if (data.type === "NEW_PEER") {
    const area = document.getElementById("peers")
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
  }

  if (data.type === "CONNECTED") {
    console.log('INSIDE CONNECTED', data)
    const id = document.getElementById("client-id")
    id.innerHTML += data.privateData.id + "\n";

    const public = document.getElementById("public-key")
    public.innerHTML += data.privateData.publicKey + "\n";

    const private = document.getElementById("private-key")
    private.innerHTML += data.privateData.privateKey + "\n";  

    const balance = document.getElementById("balance")
    balance.innerHTML = data.privateData.balance + "\n";
  }

  if (data.type === "NEW_BALANCE") {
    const balance = document.getElementById("balance")
    balance.innerHTML = `${data.data}` + "\n";
  }
}

function onError(evt) {
  console.log("ERROR"+ evt.data)
}

function doSend(message) {
  console.log('SENDING: ', message)
  websocket.send(message)
}

window.addEventListener("load", init, false);