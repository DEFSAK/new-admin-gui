// import { refresh_token, get_validated_players, ban_players, get_catalog } from '../auth/auth'
import { app, shell, BrowserWindow, ipcMain, clipboard, type IpcMainEvent } from 'electron'
import { GlobalKeyboardListener, type IGlobalKeyEvent } from 'node-global-key-listener'
import { Hardware, type Keyboard, type Mouse, type Workwindow } from 'keysender'
// import { isAccessTokenExpired, saveTokens, getTokens } from '../auth/tokens'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import clipboardWatcher from 'electron-clipboard-watcher'
import icon from '../../resources/icon.png?asset'
// import auth_controller from '../auth/controller'
import { autoUpdater } from 'electron-updater'
import settings from 'electron-settings'
import { join } from 'path'
// import fs from 'fs'

const KeyboardListener = new GlobalKeyboardListener()

// async function doAuthLogin(): Promise<void> {
//   return auth_login()
// }

// function hasTokens(): boolean {
//   return fs.existsSync(join(app.getPath('userData'), 'tokens.json'))
// }

// async function doAuthFlow(): Promise<void> {
//   if (!hasTokens()) {
//     await doAuthLogin()
//     return
//   }

//   const tokens = getTokens()
//   if (isAccessTokenExpired()) {
//     if (tokens?.refresh_token) {
//       const data = await refresh_token(tokens.refresh_token)
//       if (data) {
//         saveTokens(data)
//       } else {
//         await doAuthLogin()
//       }
//     } else {
//       await doAuthLogin()
//     }
//   }
// }

// async function doAuthFlow(): Promise<void> {
//   if (!fs.existsSync(join(app.getPath('userData'), 'tokens.json'))) {
//     await doAuthLogin()
//   } else if (isAccessTokenExpired()) {
//     const tokens = getTokens()
//     if (tokens?.access_token && tokens?.refresh_token) {
//       const data = await refresh_token(tokens.refresh_token)
//       if (data) {
//         saveTokens(data)
//       } else {
//         await doAuthLogin()
//       }
//     } else {
//       await doAuthLogin()
//     }
//   }
// }

let mainWindow: BrowserWindow
// let auth_login: () => Promise<void>
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
  })

  mainWindow.setTitle('Admin GooWee')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // const first_run = settings.getSync('console') === undefined

  // auth_login = auth_controller(ipcMain, mainWindow)
  // mainWindow.webContents.on('did-finish-load', async () => {
  //   doAuthFlow().then(async () => {
  //     const tokens = getTokens()
  //     if (!tokens) return
  //     const catalog = (await get_catalog(tokens.access_token)) as {
  //       result: { [key: string]: object }
  //     }
  //     if (!catalog) return

  //     mainWindow.webContents.send('auth-complete', first_run)
  //     mainWindow.webContents.send('catalog', catalog.result)
  //   })
  // })
}

type PlayerData = {
  serverName: string
  serverIP: string
  parsedData: Record<string, string>[]
}
const parsePlayerData = (text: string): PlayerData => {
  const lines = text.split('\n')

  const serverInfo = lines[0].replace('ServerName - ', '')
  const lastSpaceIndex = serverInfo.lastIndexOf(' ')
  const serverName = serverInfo.slice(0, lastSpaceIndex).trim()
  const serverIP = serverInfo.slice(lastSpaceIndex + 1).trim()

  const playerDataLines = lines.slice(2)
  const parsedData: Array<Record<string, string>> = []

  playerDataLines.forEach((line) => {
    const columns = line.split(' - ')
    columns.splice(-4)

    if (columns.length < 2) return
    if (columns.length > 2) {
      columns[0] = columns.slice(0, columns.length - 1).join(' - ')
      columns[1] = columns[columns.length - 1]
      columns.splice(2)
    }

    parsedData.push({ display_name: columns[0], playfab_id: columns[1] })
  })

  const filteredData = parsedData.filter((item) => item.playfab_id !== 'NULL')

  return {
    serverName,
    serverIP,
    parsedData: filteredData
  }
}

declare class Game {
  readonly keyboard: Keyboard
  readonly mouse: Mouse
  readonly workwindow: Workwindow
  constructor()
  constructor(handle: number)
  constructor(title: string | null, className?: string | null)
  constructor(parentHandle: number, childClassName: string | null, childTitle?: string | null)
  constructor(
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  )
}

const fetch_game_process = (): Game | null => {
  const game = new Hardware('Chivalry 2  ', 'UnrealWindow') as Game
  if (!game.workwindow.isOpen()) return null
  return game
}

const write_to_console = async (game: Game | null, message: string): Promise<void> => {
  if (!game) return
  clipboard.writeText(message)
  game.workwindow.setForeground()
  const console_key = settings.getSync('console.vKey') as number
  await game.keyboard.sendKeys([console_key, ['ctrl', 'v'], 'enter'])
}

const command_queue: { event: IpcMainEvent; command: string }[] = []
let is_processing = false

const process_command_queue = async (): Promise<void> => {
  console.log('===== Processing Commands =====')
  console.log(`Queue Length: ${command_queue.length}`)
  console.log(command_queue.filter((v) => v.command))  
  console.log('===== Processing Commands =====')

  if (is_processing || command_queue.length === 0) return
  is_processing = true
  const { event, command } = command_queue.shift()!


  if (command.length === 0) {
    event.reply('command-result', { status: false, message: 'Command is empty' })

    is_processing = false
    process_command_queue()
    return
  }

  const game = fetch_game_process()
  if (!game) {
    event.reply('command-result', { status: false, message: 'Game process not found' })

    is_processing = false
    process_command_queue()
    return
  }

  await write_to_console(game, command)
  mainWindow.show()

  if (command !== 'listplayers') {
    event.reply('command-result', { status: true, message: 'Command sent' })
  }

  is_processing = false
  process_command_queue()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  clipboardWatcher({
    onTextChange: (text: string) => {
      if (text.startsWith('ServerName - ')) {
        mainWindow.webContents.send('clipboard-loading')
        const { parsedData } = parsePlayerData(text)
        mainWindow.webContents.send('player-data', parsedData)

        // doAuthFlow().then(async () => {
        //   const tokens = getTokens()
        //   if (!tokens) return
        //   const data = await get_validated_players(tokens.access_token, parsedData, serverName)
        //   if (!data) return
        //   mainWindow.webContents.send('player-data', data[0].result.validated_players)
        //   mainWindow.webContents.send('catalog', data[1].result)
        // })
      }
    }
  })

  // ipcMain.on('validate-user', async (_, data) => {
  //   const { player_id, username } = data
  //   const validation_data = [
  //     {
  //       playfab_id: player_id,
  //       display_name: username
  //     }
  //   ]

  //   doAuthFlow().then(async () => {
  //     const tokens = getTokens()
  //     if (!tokens) return
  //     const data = await get_validated_players(tokens.access_token, validation_data, '')
  //     if (!data) return
  //     mainWindow.webContents.send('validation-result', data[0].result.validated_players)
  //     mainWindow.webContents.send('catalog', data[1].result)
  //   })
  // })

  ipcMain.on('command', async (event, command: string) => {
    command_queue.push({ event, command })
    process_command_queue()
  })

  ipcMain.on('get-console-key', () => {
    const console_key = settings.getSync('console')
    mainWindow.webContents.send('console-key-changed', console_key ? console_key : null)
  })

  ipcMain.on('change-console-key', () => {
    const listener = (event: IGlobalKeyEvent): void => {
      settings.setSync('console', event)
      mainWindow.webContents.send('console-key-changed', event)
      KeyboardListener.removeListener(listener)
    }
    KeyboardListener.addListener(listener)
  })

  ipcMain.on('run-tour', (event) => {
    event.reply('run-tour')
  })

  // TODO: come back to this
  // ipcMain.on('ban-players', async (event, args) => {
  //   doAuthFlow()
  //     .then(async () => {
  //       const tokens = getTokens()
  //       if (!tokens) return
  //       const { playfab_ids, ban_charges, ban_duration } = args

  //       const response = (await ban_players(
  //         tokens.access_token,
  //         playfab_ids,
  //         ban_charges,
  //         ban_duration ? ban_duration : null
  //       )) as { data: [{ result }, { result }]; message: string } | null

  //       if (response) {
  //         mainWindow.webContents.send('catalog', response.data[1].result)
  //         return event.reply('ban-players-result', {
  //           data: response.data[0].result,
  //           message: response.message
  //         })
  //       } else
  //         return event.reply('ban-players-result', { data: null, message: 'Failed to ban players' })
  //     })
  //     .catch(() =>
  //       event.reply('ban-players-result', { data: null, message: 'Failed to ban players' })
  //     )
  // })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
