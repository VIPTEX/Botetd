const venom = require('venom-bot');
const fs = require('fs');

// Especifica el número específico desde el cual se activarán las funciones
const numeroEspecifico = '18098703796@c.us';

venom
  .create({
    session: 'session-name'
  })
  .then((client) => {
    // Programa la tarea para enviar el mensaje a las 5:55 PM
    scheduleMessage(client);
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

// Cargar mensajes desde el archivo JSON
const messages = loadMessages();

function start(client) {
  client.onMessage((message) => {
    // Verificar si el mensaje proviene del número específico
    if (message.from === numeroEspecifico) {
      console.log("fue ella")
      // Verificar si el mensaje tiene la estructura para agregar nuevos mensajes
      if (message.body.startsWith('!message') && message.isGroupMsg === false) {
        addNewMessage(message.body);
        client
          .sendText(message.from, 'Mensaje agregado correctamente.')
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      } else {
        // Buscar respuestas en el archivo JSON
        const matchedMessage = findMatchedMessage(message.body.toLowerCase());
        if (matchedMessage) {
          const respuesta = Array.isArray(matchedMessage.respuesta)
            ? getRandomResponse(matchedMessage.respuesta)
            : matchedMessage.respuesta;

          client
            .sendText(message.from, respuesta)
            .then((result) => {
              console.log('Result: ', result);
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro);
            });
        }
      }
    }
  });
}

function loadMessages() {
  try {
    const jsonData = fs.readFileSync('messages.json', 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}
function findMatchedMessage(message) {
  // Convertir el mensaje a minúsculas antes de la comparación
  const messageLower = message.toLowerCase();

  // Buscar una coincidencia exacta
  return messages.find(msg => msg.mensaje.toLowerCase() === messageLower);
}

function getRandomResponse(responses) {
  // Seleccionar una respuesta al azar del arreglo
  return responses[Math.floor(Math.random() * responses.length)];
}

function addNewMessage(message) {
  const lines = message.split('\n');
  const newMessage = {
    mensaje: lines.find(line => line.startsWith('Mensaje:')).replace('Mensaje:', '').trim(),
    respuesta: lines.find(line => line.startsWith('Respuesta:')).replace('Respuesta:', '').trim()
  };

  // Verificar si ya existe un mensaje con el mismo contenido
  if (!messages.some(msg => msg.mensaje.toLowerCase() === newMessage.mensaje.toLowerCase())) {
    messages.push(newMessage);

    // Guardar el archivo JSON actualizado
    fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));

    loadMessages();
  }
}

function scheduleMessage(client) {
  // Define la hora a la que deseas enviar el mensaje (5:55 PM)
  const scheduledHour = 17; // 24-hour format
  const scheduledMinute = 55;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Calcula el tiempo en milisegundos para la programación
  const delayMillis = (scheduledHour - currentHour) * 60 * 60 * 1000 + (scheduledMinute - currentMinute) * 60 * 1000;

  // Programa la tarea para enviar el mensaje a la hora deseada
  setTimeout(() => {
    client
      .sendText(numeroEspecifico, 'Deseo recuperar tu confianza')
      .then((result) => {
        console.log('Mensaje programado enviado:', result);
      })
      .catch((erro) => {
        console.error('Error al enviar el mensaje programado: ', erro);
      });
  }, delayMillis);
}







