## Chatbot Whatsapp (OpenSource)
#### Actualizado Febrero 2023

Este proyecto es un clon de la **version 1** (legacy) de [Leifer Mendez](https://github.com/leifermendez/bot-whatsapp) y tiene las siguientes modificaciones:

 - Permite **submenus**.
    - Un submenú es un paso que **sólo se dispara** cuando el paso anterior es el especificado, los submenus se definen agregando el parametro "```pasoRequerido```" en el **response.json**, entonces si queremos que el paso **zapatos** solo se muestre cuando antes pasamos por el **menú inicial**, agregamos el parámetro "pasoRequerido" a la regla "zapatos", de esta forma si alguien pone el número **1** sin estar en el menú principal, **no** los va a mandar a **zapatos**.
    
    ```json
    "menu":{
        "replyMessage":[
            "%saludo%",
            "Escribe 1 para zapatos.",
            "Escribe 2 para bolsos."
        ],
        "media":null,
        "trigger":null
    },
    "zapatos":{
        "replyMessage":[
            "Esta es la lista de nuestros zapatos."
        ],
        "media":null,
        "trigger":null,
        "pasoRequerido":"menu"
    },
    "bolsos":{
        "replyMessage":[
            "Esta es la lista de nuestros bolsos."
        ],
        "media":null,
        "trigger":null,
        "pasoRequerido":"menu"
    }
    ```
 - Permite **expresiones regulares** en las palabras predefinidas en el **initial.json**.
    - Si queremos usar RegExp, en los "keywords" de **inital.json**, en lugar de un arreglo, debemos usar un string ( quitamos los [] )
      y en él usamos "*" para significar cualquier texto y "|" para significar "OR", esto nos permite ser mas flexibles
      con los "keywords", por ejemplo, si queremos que el mensaje pueda decir:

           "Hola quiero info del paquete" o "Requiero más información"

      Ponemos ```*info*``` y la regla se va a disparar porque los dos contienen "info".
      
      Si queremos que se dispare con:


           "Quiero info del paquete numero 3" o "Me gustó el paquete de Angular"
      
          
      Ponemos ```*paquete*3*|*paquete*angular*``` y la regla se va a disparar porque contiene "paquete" y "3" -O- "paquete" y "angular".
      
    ```json
    {
        "keywords": "*pak*3*|*pak*angular*|*paquete*3*|*paquete*angular*",
        "key": "paq3"
    }
    ```
 - Permite **remplazos** en el texto de los mensajes por ejemplo:
    - Ponemos __%saludo%__ para que aparezca "Buenos días, tardes o noches" dependiendo de la hora.
    - Ponemos __%primer_nombre%__ para que aparezca el nombre (hasta el primer espacio) del remitente.
    - Ponemos __%dia_semana%__ para que aparezca "lunes, martes, miercoles, etc" dependiendo del día de la semana.
    - Ponemos __%msjant_XX%__ para que aparezca el mensaje xx anterior, es decir, si quieres mostrar el texto de 2 mensajes anteriores se pone %msjant_2%.
    - etc, etc, se pueden agregar mas remplazos en la funcion "remplazos" en el archivo "adapter\index.js".
 - Permite el envío de **multiples mensajes** definidos en la **misma respuesta** del **response.json**. (Esta modificación se la robe por completo a [KJoaquin](https://github.com/KJoaquin), el lo solucionó [aquí](https://github.com/codigoencasa/bot-whatsapp/issues/111#issuecomment-1353504575) 🙌🏽 y yo solo lo adapté a mi repositorio!.)

    Antes:
     ```json
    {
        "ejemploViejo":{
            "replyMessage":["¿Hola como estas?"],
            "media":null,
            "trigger":null
        }
    }
    ```
    Ahora "```replyMessage```" debe de contener un arreglo con los mensajes que se van a enviar:
     ```json
    {
        "ejemploNuevo":{
            "replyMessage":[
                {   "mensaje":["¿Hola como estas?"]},
                {   "mensaje":["Este es el *segundo* mensaje.","Contiene dos lineas 🤪"]},
                {   "mensaje":["Este es el *tercer* mensaje"]}
             ],
            "media":null,
            "trigger":null
        }
    }
    ```
 - Permite conectarse a **APIs**, por ejemplo: Google Sheets, Excel y cualquier otra API que se pueda llamar desde una función, esto se hace agregando el parametro "```funcion```" al **response.json**.
 ```
  "Desbloqueo":{
        "keywords": "desbloqueo",
        "replyMessage":[
            "Mensaje de desbloqueo de usuarios."
        ],
        "funcion":"getFakeHTTP",  //esta linea ejecuta la funcion.
        "media":null,
        "trigger":null,
        "pasoRequerido":"soporte"
    }
 
 ```
 - Los archivos **initial.json** y **response.json** se unificaron y ya solo se usa el **response.json**, para esto solo se agrega el parametro "```keywords```" del **initial.json** al **response.json**

 - Se puede especificar que al terminar un paso, el flujo se **vaya automaticamente** a otro, por ejemplo, si tenemos un flujo de tres pasos, y queremos que al terminar el tercer paso se regrese automaticamente al primero, agregamos el parametro "```goto```" al **response.json** del tercer paso y ponemos el nombre del paso 1.
 ```
  "paso3":{
        "keywords": ["zapatos"],
        "replyMessage":["Gracias por tu compra"],
        "media":null,
        "trigger":null,
        "goto":"paso1"
    },
 ```
 - Las modificaciones están enfocadas al uso de los archivos __initial.json__ y __response.json__, yo no uso MySQL o DialogFlow, así que no sé si las modificaciones funcionen con esos modulos, en particular el __remplazo %msjant_XX%__ depende de los archivos __JSON__ que se crean en el directorio "chats".
 - Tiene agregado el parche de **botones y listas**, así que funcionan sin problema (las listas no funcionan si el bot esta **ligado** a un número que use **Whatsapp Business**).
 - Tiene los ultimos parches de **DialogFlow** (27-dic-2022) (When Dialogflow asks for an Image, then **Upload it to Google Drive** and then generate Shared Link)

 ## INICIA DOCUMENTACION DEL PROYECTO ORIGINAL

El siguiente proyecto se realizó con fines educativos para el canal de [Youtube (Leifer Mendez)](https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw?sub_confirmation=1) donde aprendemos a crear y implementar un chatbot increíble usando [node.js](https://codigoencasa.com/tag/nodejs/) además le agregamos inteligencia artificial gracias al servicio de __dialogflow__.

[![Video](https://i.giphy.com/media/OBDi3CXC83WkNeLEZP/giphy.webp)](https://youtu.be/5lEMCeWEJ8o) 

### ATENCION 🔴
> 💥💥 Si te aparece el Error Multi-device es porque tienes la cuenta de whatsapp afiliada al modo "BETA de Multi dispositivo" por el momento no se tiene soporte para esas personas si tu quieres hacer uso de este __BOT__ debes de salir del modo BETA y intentarlo de la manera tradicional

> El core de whatsapp esta en constante actualizaciones por lo cual siempre revisa la ultima fecha de la actualizacion 
> [VER](https://github.com/leifermendez/bot-whatsapp/commits/main)

### Busco colaboradores ⭐
Hola amigos me gusta mucho este proyecto pero por cuestiones de tiempo se me dificulta mantener las actualizaciones si alguno quiere participar en el proyecto escribanme a leifer.contacto@gmail.com

#### Acceso rápido 
> Si tienes una cuenta en __heroku__ puedes desplegar este proyecto con (1 click)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/leifermendez/bot-whatsapp) 

> Comprarme un cafe!

[![Comprar](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/leifermendez)

#### Actualización

| Feature  | Status |
| ------------- | ------------- |
| Dialogflow  | ✅  |
| MySQL  | ✅  |
| JSON File  | ✅  |
| QR Scan (route) | ✅ |
| Easy deploy heroku  | ✅  |
| Buttons | ✅ℹ️  (No funciona en multi-device)|
| Send Voice Note | ✅ |
| Add support ubuntu/linux | ✅ |

## Requisitos
- node v14 o superior
- VSCode (Editor de codigo) [Descargar](https://code.visualstudio.com/download)
- MySql (opcional) solo aplica si vas a usar el modo 'mysql'  [sql-bot.sql migración](https://github.com/leifermendez/bot-whatsapp/blob/main/sql-bot.sql)
- Dialogflow (opcional) solo aplica si vas a usar el modo 'dialogflow'

### (Nuevo) Botones

[![btn](https://i.imgur.com/W7oYlSu.png)](https://youtu.be/5lEMCeWEJ8o) 

> Implementar los botones solo necesitas hacer uso del metodo __sendMessageButton__ que se encuentra dentro `./controllers/send` dejo un ejemplo de como usarlo.
[Ver implementación](https://github.com/leifermendez/bot-whatsapp/blob/main/app.js#L123)

``` javascript
const { sendMessageButton } = require('./controllers/send')

await sendMessageButton(
    {
        "title":"¿Que te interesa ver?",
        "message":"Recuerda todo este contenido es gratis y estaria genial que me siguas!",
        "footer":"Gracias",
        "buttons":[
            {"body":"😎 Cursos"},
            {"body":"👉 Youtube"},
            {"body":"😁 Telegram"}
        ]
    }
)

```

## Notas de Voz
[![voice note](https://i.imgur.com/zq6xYDp.png)](https://i.imgur.com/zq6xYDp.png) 

> Se pueden enviar notas de voz con formato nativo para que no se vea como reenviado. En este ejemplo enviare el archivo __PTT-20220223-WA0000.opus__ que se encuentra dentro de la carpeta de __/mediaSend__

``` javascript
const { sendMediaVoiceNote } = require('./controllers/send')

await sendMediaVoiceNote(client, from, 'PTT-20220223-WA0000.opus')

```

## Instruciones
__Descargar o Clonar repositorio__
![](https://i.imgur.com/dSpUbFz.png)

__Usas ¿Ubuntu / Linux?__
> Asegurate de instalar los siguientes paquetes
```
sudo apt-get install -y libgbm-dev
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

__Instalar dependencias (npm install)__
> Ubicate en le directorio que descargaste y via consola o terminal ejecuta el siguiente comando

`npm install` 

![](https://i.imgur.com/BJuMjGR.png)

__Configurar .env__
> Con el editor de texto crea un archivo `.env` el cual debes de guiarte del archivo `.env.example`
[Ver video explicando](https://youtu.be/5lEMCeWEJ8o?t=381)
```
######DATABASE: none, mysql, dialogflow

DEFAULT_MESSAGE=true
SAVE_MEDIA=true
PORT=3000
DATABASE=none
LANGUAGE=es
SQL_HOST=
SQL_USER=
SQL_PASS=
SQL_DATABASE=
```

![](https://i.imgur.com/9poNnW0.png)

__Ejecutar el script__
> Ubicate en le directorio que descargaste y via consola o terminal ejecuta el siguiente comando
`npm run start`

![](https://i.imgur.com/eMkBkuJ.png)

__Whatsapp en tu celular__
> Ahora abre la aplicación de Whatsapp en tu dispositivo y escanea el código QR
<img src="https://i.imgur.com/RSbPtat.png" width="500"  />
Visitar la pagina 
`http://localhost:3000/qr` 

![](https://i.imgur.com/Q3JEDlP.png)

__Listo 😎__
> Cuando sale este mensaje tu BOT está __listo__ para trabajar!
![](https://i.imgur.com/eoJ4Ruk.png)

# ¿Quieres ver como se creó? 🤖
- [Ver Video 1](https://www.youtube.com/watch?v=A_Xu0OR_HkE)
- [¿Como instalarlo? (Actulización)](https://youtu.be/5lEMCeWEJ8o)

## ¿Como usarlo el chatbot de whatsapp?
> Escribe un mensaje al whatsapp que vinculaste con tu BOT

![](https://i.imgur.com/OSUgljQ.png)

> Ahora deberías  obtener una respuesta por parte del BOT como la siguiente, ademas de esto tambien se crea un archivo excel
con el historial de conversación  con el número de tu cliente

![](https://i.imgur.com/lrMLgR8.png)
![](https://i.imgur.com/UYcoUSV.png)

## Preguntar al BOT
> Puedes interactuar con el bot ejemplo escribele __hola__ y el bot debe responderte!

![](https://i.imgur.com/cNAS51I.png)
