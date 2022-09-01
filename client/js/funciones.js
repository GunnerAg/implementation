// Se invoca cuando se oprime el botón Enviar

function enviarTransaccion(event) {
  event.preventDefault();
  console.log("????", event.target);
  var { destinatario, cantidad } = event.target;
  // Enviamos el valor del campo al servidor
  doSend(
    JSON.stringify({
      type: "ADD_TRANSACTION",
      to: destinatario.value,
      amount: cantidad.value,
    })
  );
}

// Se invoca cuando se oprime el botón Enviar
// function mineBlock(event) {
//   event.preventDefault();
//   document.getElementById("mine").innerHTML = "Mining...";

//   doSend(
//     JSON.stringify({
//       type: "MINE_BLOCK",
//     })
//   );
// }

function pendingBlock(event) {
  event.preventDefault();

  doSend(
    JSON.stringify({
      type: "PENDING_BLOCK",
    })
  );
}

async function _mineBlock(block) {
  let hash = "";
  let nonce = 0;

  console.log(
    "MINING CONDITION",
    hash.substring(0, block.difficulty) !== Array(block.difficulty + 1).join("0")
  );

  while (
    hash.substring(0, block.difficulty) !==
    Array(block.difficulty + 1).join("0")
  ) {
    nonce++;
    const jsonTransactions = JSON.stringify(block.transactions);

    hash = await calculateHash(
      block.prevHash + block.version + await calculateHash(
      block.timestamp + block.version + jsonTransactions
    ) + nonce
    );
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

// async function validateBlock(block, nonce) {
//   const {prevHash, version, transactionsHash, difficulty} = block;

//   const hash = await calculateHash(
//     prevHash + version + transactionsHash + nonce
//   );

//   console.log("ACA", hash.substring(0, difficulty), Array(difficulty + 1).join("0"));
//   return (
//     hash.substring(0, difficulty) ===
//     Array(difficulty + 1).join("0")
//   );
// }

async function calculateHash(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// La función init se ejecuta cuando termina de cargarse la página
function init() {
  // Conexión con el servidor de websocket
  console.info("❓WebSocket Client Connection request");
  wsConnect();
}

// Invoca esta función para conectar con el servidor de WebSocket
function wsConnect() {
  websocket = new WebSocket("ws://localhost:8000");
  websocket.onopen = function () {
    console.log("✅WebSocket Client Connected");
  };

  websocket.onmessage = function (e) {
    if (typeof e.data === "string") {
      console.log("Received: '" + e.data.data + "'");
      onMessage(e);
    }
  };
}

// Se ejecuta cuando se establece la conexión Websocket con el servidor
function onOpen(evt) {
  // Habilitamos el botón Enviar
  document.getElementById("enviar").disabled = false;
  // Enviamos el saludo inicial al servidor
  doSend("Hola");
}

// Se ejecuta cuando la conexión con el servidor se cierra
function onClose(evt) {
  // Deshabilitamos el boton
  document.getElementById("enviar").disabled = true;

  // Intenta reconectarse cada 2 segundos
  setTimeout(function () {
    wsConnect();
  }, 2000);
}

// Se invoca cuando se recibe un mensaje del servidor
function onMessage(evt) {
  var mensaje = evt.data;
  // Parse de JSON to access the key-value pairs
  const data = JSON.parse(mensaje);
  console.log("MESSAGE IS", data);

  if (data.type === "PENDING_BLOCK") {
    console.log("PENDING_BLOCK", data);
    mineBlock(data.data);
  }

  // if (data.type === "VALIDATE_BLOCK") {
  
  //   validateBlock(data.data.block, data.data.nonce).then((res)=>{
  //     console.log('res', res)
  //   })
  // }

  if (data.type === "MINING") {
    document.getElementById("mine").disabled = true;
  }

  if (data.type === "NEW_CHAIN") {
    const area = document.getElementById("blockchain");
    window.localStorage.setItem("CHAIN", JSON.stringify(data.data));
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
    document.getElementById("mine").innerHTML = "Mine Block";
    document.getElementById("mine").disabled = false;
  }

  if (data.type === "NEW_TRANSACTION") {
    const area = document.getElementById("transactions");
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
  }

  if (data.type === "NEW_PEER") {
    const area = document.getElementById("peers");
    area.innerHTML = JSON.stringify(data.data, undefined, 2) + "\n";
  }

  if (data.type === "CONNECTED") {
    const id = document.getElementById("client-id");
    id.innerHTML += data.privateData.id + "\n";

    const public = document.getElementById("public-key");
    public.innerHTML += data.privateData.publicKey + "\n";

    const private = document.getElementById("private-key");
    private.innerHTML += data.privateData.privateKey + "\n";

    const balance = document.getElementById("balance");
    balance.innerHTML = data.privateData.balance + "\n";
  }

  if (data.type === "NEW_BALANCE") {
    console.log(data);
    const balance = document.getElementById("balance");
    balance.innerHTML = `${data.data}` + "\n";
  }
}

// Se invoca cuando se presenta un error en el WebSocket
function onError(evt) {
  console.log("ERROR: " + evt.data);
}

// Envía un mensaje al servidor (y se imprime en la consola)
function doSend(message) {
  console.log(message);
  websocket.send(message);
}

// Se invoca la función init cuando la página termina de cargarse
window.addEventListener("load", init, false);
