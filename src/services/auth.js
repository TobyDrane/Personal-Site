export const isBrowser = () => typeof window !== 'undefined'

// Gets the user stored within browsers local storage
export const getUser = () =>
  isBrowser() && window.localStorage.getItem('user')
    ? JSON.parse(window.localStorage.getItem('user'))
    : {}

// Set the user to local browser storage
export const setUser = user =>
  isBrowser() && window.localStorage.setItem('user', JSON.stringify(user))

// Is the user logged in?
export const isLoggedIn = () => {
  const user = getUser()
  return !!user.email
}
