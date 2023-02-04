+++++++++++++++++++++++++++++++++++++  INICIO  +++++++++++++++++++++++++++++++++++++++
HORA:4:55:56 PM FROM:5215519561677@c.us, BODY:/Guna, HASMEDIA:false
NUEVA RESPUESTA= Mensaje de getGunaCats
#############    Encontramos Funcion, ejecutamos funcion getGunaCats
1 { id: 'CHOCOLATE', title: 'CHOCOLATE' }
2 { id: 'DULCES', title: 'DULCES' }
lasOpciones=[object Object]
List {
  description: 'Buenas tardes, selecciona una categoría 👇🏽',
  buttonText: 'Ver las categorías',
  title: 'Categorías',
  footer: 'Selecciona',
  sections: [ { title: 'Categorías', rows: [Array] } ]
}
<ref *1> Client {
  _events: [Object: null prototype] {
    qr: [Function (anonymous)],
    ready: [Function (anonymous)],
    auth_failure: [Function (anonymous)],
    authenticated: [Function (anonymous)],
    message: [AsyncFunction (anonymous)],
    message_create: [AsyncFunction (anonymous)]
  },
  _eventsCount: 6,
  _maxListeners: undefined,
  options: {
    authStrategy: LocalAuth {
      dataPath: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\.wwebjs_auth',
      clientId: undefined,
      client: [Circular *1],
      userDataDir: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\.wwebjs_auth\\session'
    },
    puppeteer: {
      headless: true,
      args: [Array],
      defaultViewport: null,
      userDataDir: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\.wwebjs_auth\\session'
    },
    authTimeoutMs: 0,
    qrMaxRetries: 0,
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
    ffmpegPath: 'ffmpeg',
    bypassCSP: false
  },
  authStrategy: LocalAuth {
    dataPath: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\.wwebjs_auth',
    clientId: undefined,
    client: [Circular *1],
    userDataDir: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\.wwebjs_auth\\session'
  },
  pupBrowser: <ref *2> Browser {
    eventsMap: Map(2) { 'targetcreated' => [], 'targetchanged' => [] },
    emitter: {
      all: [Map],
      on: [Function: on],
      off: [Function: off],
      emit: [Function: emit]
    },
    _ignoredTargets: Set(0) {},
    _ignoreHTTPSErrors: false,
    _defaultViewport: null,
    _process: ChildProcess {
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      _closesNeeded: 2,
      _closesGot: 0,
      connected: false,
      signalCode: null,
      exitCode: null,
      killed: false,
      spawnfile: 'C:\\Users\\cheve\\Documents\\GitHub\\botDemoGuna\\node_modules\\puppeteer\\.local-chromium\\win64-982053\\chrome-win\\chrome.exe',      
      _handle: [Process],
      spawnargs: [Array],
      pid: 7188,
      stdin: [Socket],
      stdout: null,
      stderr: [Socket],
      stdio: [Array],
      [Symbol(kCapture)]: false
    },
    _screenshotTaskQueue: TaskQueue { _chain: [Promise] },
    _connection: Connection {
      eventsMap: [Map],
      emitter: [Object],
      _lastId: 372,
      _sessions: [Map],
      _closed: false,
      _callbacks: Map(0) {},
      _url: 'ws://127.0.0.1:49386/devtools/browser/8ba98a74-7751-45aa-8256-8f82b8312e65',
      _delay: 0,
      _transport: [NodeWebSocketTransport]
    },
    _closeCallback: [Function: bound close],
    _targetFilterCallback: [Function (anonymous)],
    _defaultContext: BrowserContext {
      eventsMap: Map(0) {},
      emitter: [Object],
      _connection: [Connection],
      _browser: [Circular *2],
      _id: undefined
    },
    _contexts: Map(0) {},
    _targets: Map(5) {
      '4904d96d-4dec-4069-95d8-fe7d70f62b06' => [Target],
      '71cc8c5e-8516-49de-9387-b2940074aea5' => [Target],
      'C7071524BC87DF4C8E9569AD3FBB7348' => [Target],
      '1D7791C3C62A14FB306A0ABD1CD86677' => [Target],
      '969B67293789E4A52B827E4619DF58D7' => [Target]
    }
  },
  pupPage: <ref *3> Page {
    eventsMap: Map(1) { 'framenavigated' => [Array] },
    emitter: {
      all: [Map],
      on: [Function: on],
      off: [Function: off],
      emit: [Function: emit]
    },
    _closed: false,
    _timeoutSettings: TimeoutSettings {
      _defaultTimeout: null,
      _defaultNavigationTimeout: null
    },
    _pageBindings: Map(12) {
      'loadingScreen' => [AsyncFunction (anonymous)],
      'qrChanged' => [AsyncFunction (anonymous)],
      'onAddMessageEvent' => [Function (anonymous)],
      'onChangeMessageTypeEvent' => [Function (anonymous)],
      'onChangeMessageEvent' => [Function (anonymous)],
      'onRemoveMessageEvent' => [Function (anonymous)],
      'onMessageAckEvent' => [Function (anonymous)],
      'onMessageMediaUploadedEvent' => [Function (anonymous)],
      'onAppStateChangedEvent' => [AsyncFunction (anonymous)],
      'onBatteryStateChangedEvent' => [Function (anonymous)],
      'onIncomingCall' => [Function (anonymous)],
      'onReaction' => [Function (anonymous)]
    },
    _javascriptEnabled: true,
    _workers: Map(1) { '96E97F3B444D00EB81EFEFDBC3128749' => [WebWorker] },
    _fileChooserInterceptors: Set(0) {},
    _userDragInterceptionEnabled: false,
    _handlerMap: WeakMap { <items unknown> },
    _client: CDPSession {
      eventsMap: [Map],
      emitter: [Object],
      _callbacks: Map(0) {},
      _connection: [Connection],
      _targetType: 'page',
      _sessionId: '44F15C73737F3B036CBCBE340984F10E'
    },
    _target: Target {
      _targetInfo: [Object],
      _browserContext: [BrowserContext],
      _targetId: 'C7071524BC87DF4C8E9569AD3FBB7348',
      _sessionFactory: [Function (anonymous)],
      _ignoreHTTPSErrors: false,
      _defaultViewport: null,
      _screenshotTaskQueue: [TaskQueue],
      _pagePromise: [Promise],
      _workerPromise: null,
      _initializedCallback: [Function (anonymous)],
      _initializedPromise: [Promise],
      _closedCallback: [Function (anonymous)],
      _isClosedPromise: [Promise],
      _isInitialized: true
    },
    _keyboard: Keyboard {
      _modifiers: 0,
      _pressedKeys: Set(0) {},
      _client: [CDPSession]
    },
    _mouse: Mouse {
      _x: 0,
      _y: 0,
      _button: 'none',
      _client: [CDPSession],
      _keyboard: [Keyboard]
    },
    _touchscreen: Touchscreen { _client: [CDPSession], _keyboard: [Keyboard] },
    _accessibility: Accessibility { _client: [CDPSession] },
    _frameManager: FrameManager {
      eventsMap: [Map],
      emitter: [Object],
      _frames: [Map],
      _contextIdToContext: [Map],
      _isolatedWorlds: [Set],
      _client: [CDPSession],
      _page: [Circular *3],
      _networkManager: [NetworkManager],
      _timeoutSettings: [TimeoutSettings],
      _mainFrame: [Frame]
    },
    _emulationManager: EmulationManager {
      _emulatingMobile: false,
      _hasTouch: false,
      _client: [CDPSession]
    },
    _tracing: Tracing { _recording: false, _path: '', _client: [CDPSession] },
    _coverage: Coverage { _jsCoverage: [JSCoverage], _cssCoverage: [CSSCoverage] },
    _screenshotTaskQueue: TaskQueue { _chain: [Promise] },
    _viewport: null
  },
  info: ClientInfo {
    pushname: 'Omega',
    wid: {
      server: 'c.us',
      user: '5215527026728',
      _serialized: '5215527026728@c.us'
    },
    me: {
      server: 'c.us',
      user: '5215527026728',
      _serialized: '5215527026728@c.us'
    },
    phone: undefined,
    platform: 'android'
  },
  interface: InterfaceController {
    pupPage: <ref *3> Page {
      eventsMap: [Map],
      emitter: [Object],
      _closed: false,
      _timeoutSettings: [TimeoutSettings],
      _pageBindings: [Map],
      _javascriptEnabled: true,
      _workers: [Map],
      _fileChooserInterceptors: Set(0) {},
      _userDragInterceptionEnabled: false,
      _handlerMap: [WeakMap],
      _client: [CDPSession],
      _target: [Target],
      _keyboard: [Keyboard],
      _mouse: [Mouse],
      _touchscreen: [Touchscreen],
      _accessibility: [Accessibility],
      _frameManager: [FrameManager],
      _emulationManager: [EmulationManager],
      _tracing: [Tracing],
      _coverage: [Coverage],
      _screenshotTaskQueue: [TaskQueue],
      _viewport: null
    }
  },
  theMsg: Message {
    _data: {
      id: [Object],
      body: '/Guna',
      type: 'chat',
      t: 1675378555,
      notifyName: 'Alfredo',
      from: '5215519561677@c.us',
      to: '5215527026728@c.us',
      self: 'in',
      ack: 1,
      isNewMsg: true,
      star: false,
      kicNotified: false,
      recvFresh: true,
      isFromTemplate: false,
      pollInvalidated: false,
      isSentCagPollCreation: false,
      latestEditMsgKey: null,
      latestEditSenderTimestampMs: null,
      broadcast: false,
      mentionedJidList: [],
      isVcardOverMmsDocument: false,
      isForwarded: false,
      hasReaction: false,
      productHeaderImageRejected: false,
      lastPlaybackProgress: 0,
      isDynamicReplyButtonsMsg: false,
      isMdHistoryMsg: false,
      stickerSentTs: 0,
      isAvatar: false,
      requiresDirectConnection: false,
      pttForwardedFeaturesEnabled: true,
      isEphemeral: false,
      isStatusV3: false,
      links: []
    },
    mediaKey: undefined,
    id: {
      fromMe: false,
      remote: '5215519561677@c.us',
      id: '3A98BA96F6922B404213',
      _serialized: 'false_5215519561677@c.us_3A98BA96F6922B404213'
    },
    ack: 1,
    hasMedia: false,
    body: '/Guna',
    type: 'chat',
    timestamp: 1675378555,
    from: '5215519561677@c.us',
    to: '5215527026728@c.us',
    author: undefined,
    deviceType: 'ios',
    isForwarded: false,
    forwardingScore: 0,
    isStatus: false,
    isStarred: false,
    broadcast: false,
    fromMe: false,
    hasQuotedMsg: false,
    duration: undefined,
    location: undefined,
    vCards: [],
    inviteV4: undefined,
    mentionedIds: [],
    orderId: undefined,
    token: undefined,
    isGif: false,
    isEphemeral: false,
    links: [],
    numero: '5215519561677@c.us',
    key: 'gunaCats',
    lastStep: null,
    step: 'gunaCats',
    trigger: null,
    replyMessage: 'Mensaje de getGunaCats'
  },
  [Symbol(kCapture)]: false
}
+++++++++++++++++++++++++++++++++++++  INICIO  +++++++++++++++++++++++++++++++++++++++
HORA:4:56:00 PM FROM:5215519561677@c.us, BODY:DULCES, HASMEDIA:false
=======  KEY ES NULO USAMOS REGEXP  =======
KEY=|doblemensaje|
Esta Key=doblemensaje - pasoReq=menu - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=menu - PasoAnt=undefined
KEY=|recibenombre|
Esta Key=recibenombre - pasoReq=opcion3 - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=opcion3 - PasoAnt=undefined
KEY=|gRevisaCliente|
Esta Key=gRevisaCliente - pasoReq=gallina - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=gallina - PasoAnt=undefined
KEY=|gGuardainfo|
Esta Key=gGuardainfo - pasoReq=gRevisaCliente - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=gRevisaCliente - PasoAnt=undefined
KEY=|paq3|
Esta Key=paq3 - pasoReq=menu - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=menu - PasoAnt=undefined
KEY=|Desbloqueo|
Esta Key=Desbloqueo - pasoReq=soporte - PasoAnt=undefined|gunaCats
NO CUMPLE PASO REQ
pasoReq=soporte - PasoAnt=undefined
KEY=|gunaCats2|
Esta Key=gunaCats2 - pasoReq=gunaCats - PasoAnt=undefined|gunaCats
NUEVA RESPUESTA= Mensaje de getGunaCats2
#############    Encontramos Funcion, ejecutamos funcion getGunaSubtipo
1 { id: 'KINDER', title: 'KINDER' }
2 { id: 'CHOCOLATE', title: 'CHOCOLATE' }
lasOpciones=undefined
+++++++++++++++++++++++++++++++++++++  INICIO  +++++++++++++++++++++++++++++++++++++++
HORA:4:56:05 PM FROM:5215519561677@c.us, BODY:CHOCOLATE, HASMEDIA:false
=======  KEY ES NULO USAMOS REGEXP  =======
KEY=|doblemensaje|
Esta Key=doblemensaje - pasoReq=menu - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=menu - PasoAnt=undefined
KEY=|recibenombre|
Esta Key=recibenombre - pasoReq=opcion3 - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=opcion3 - PasoAnt=undefined
KEY=|gRevisaCliente|
Esta Key=gRevisaCliente - pasoReq=gallina - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=gallina - PasoAnt=undefined
KEY=|gGuardainfo|
Esta Key=gGuardainfo - pasoReq=gRevisaCliente - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=gRevisaCliente - PasoAnt=undefined
KEY=|paq3|
Esta Key=paq3 - pasoReq=menu - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=menu - PasoAnt=undefined
KEY=|Desbloqueo|
Esta Key=Desbloqueo - pasoReq=soporte - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=soporte - PasoAnt=undefined
KEY=|gunaCats2|
Esta Key=gunaCats2 - pasoReq=gunaCats - PasoAnt=undefined|gunaCats2
NO CUMPLE PASO REQ
pasoReq=gunaCats - PasoAnt=undefined
KEY=|gunaProds|
Esta Key=gunaProds - pasoReq=gunaCats2 - PasoAnt=undefined|gunaCats2
NUEVA RESPUESTA= Mensaje de getGunaCats2
#############    Encontramos Funcion, ejecutamos funcion getGunaProds
