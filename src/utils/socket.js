import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_SOCKET_URL || 'https://api.wenamfood.com'
const token = () => localStorage.getItem('accessToken')

// Connexion temps reel authentifiee : le jeton est relu a chaque (re)connexion,
// et onConnect est rappele apres chaque reconnexion pour rejoindre ses salles.
export function connectSocket(onConnect) {
  const socket = io(URL, { withCredentials: true, auth: (cb) => cb({ token: token() }) })
  socket.on('connect', () => onConnect?.(socket, token()))
  return socket
}
