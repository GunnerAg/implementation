export interface IMessageData {
  loginUri?: string
  errorUri?: string
  token?: string
  apiKey?: string
  error?: string
}

export interface IMessage {
  type: 'INIT' | 'TOKEN' | 'ERROR'
  data: IMessageData
}
