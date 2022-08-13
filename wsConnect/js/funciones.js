// Se invoca cuando se oprime el botón Enviar
function enviarTexto(event) {
  event.preventDefault();
  var campo = event.target.texto;
  // Enviamos el valor del campo al servidor
  doSend(campo.value);
  // Vaciamos el campo
  campo.value = "";
}

// La función init se ejecuta cuando termina de cargarse la página
function init() {
  // Conexión con el servidor de websocket
  console.info("❓WebSocket Client Connection request");
  wsConnect();
  const createCredentialDefaultArgs = {
    publicKey: {
      // Relying Party (a.k.a. - Service):
      rp: {
        name: "Acme",
      },

      // User:
      user: {
        id: new Uint8Array(16),
        name: "john.p.smith@example.com",
        displayName: "John P. Smith",
      },

      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7,
        },
      ],

      attestation: "direct",

      timeout: 60000,

      challenge: new Uint8Array([
        // must be a cryptographically random number sent from a server
        0x8c, 0x0a, 0x26, 0xff, 0x22, 0x91, 0xc1, 0xe9, 0xb9, 0x4e, 0x2e, 0x17,
        0x1a, 0x98, 0x6a, 0x73, 0x71, 0x9d, 0x43, 0x48, 0xd5, 0xa7, 0x6a, 0x15,
        0x7e, 0x38, 0x94, 0x52, 0x77, 0x97, 0x0f, 0xef,
      ]).buffer,
    },
  };

  // sample arguments for login
  const getCredentialDefaultArgs = {
    publicKey: {
      timeout: 60000,
      // allowCredentials: [newCredential] // see below
      challenge: new Uint8Array([
        // must be a cryptographically random number sent from a server
        0x79, 0x50, 0x68, 0x71, 0xda, 0xee, 0xee, 0xb9, 0x94, 0xc3, 0xc2, 0x15,
        0x67, 0x65, 0x26, 0x22, 0xe3, 0xf3, 0xab, 0x3b, 0x78, 0x2e, 0xd5, 0x6f,
        0x81, 0x26, 0xe2, 0xa6, 0x01, 0x7d, 0x74, 0x50,
      ]).buffer,
    },
  };

  // register / create a new credential
  navigator.credentials
    .create(createCredentialDefaultArgs)
    .then((cred) => {
      console.log("NEW CREDENTIAL", cred);

      // normally the credential IDs available for an account would come from a server
      // but we can just copy them from above…
      const idList = [
        {
          id: cred.rawId,
          transports: ["usb", "nfc", "ble"],
          type: "public-key",
        },
      ];
      getCredentialDefaultArgs.publicKey.allowCredentials = idList;
      return navigator.credentials.get(getCredentialDefaultArgs);
    })
    .then((assertion) => {
      console.log("ASSERTION", assertion);
    })
    .catch((err) => {
      console.log("ERROR", err);
    });
}

// Invoca esta función para conectar con el servidor de WebSocket
function wsConnect() {
  websocket = new WebSocket("ws://localhost:8000");
  websocket.onopen = function () {
    console.log("✅WebSocket Client Connected");
    // websocket.send(`Socket id: ${window.location.origin}`);
    // websocket.send(`Socket conectado: ${websocket.readyState}`);

    // function sendNumber() {
    //   if (websocket.readyState === websocket.OPEN) {
    //     var number = Math.round(Math.random() * 0xFFFFFF);
    //     websocket.send(number.toString());
    //     setTimeout(sendNumber, 1000);
    //   }
    // }
    // sendNumber();
  };

  websocket.onmessage = function (e) {
    if (typeof e.data === "string") {
      console.log("Received: '" + e.data + "'");
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
  // Agregamos al textarea el mensaje recibido
  var area = document.getElementById("mensajes");
  area.innerHTML += evt.data + "\n";
  var link = document.getElementById("link");
  link.href = evt.data.errorUri;
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
