// Fetch API sederhana untuk test GET users
const response = await fetch('http://localhost:3000/api/users')
const users = await response.json()

console.log('Users:', users)

export {}

