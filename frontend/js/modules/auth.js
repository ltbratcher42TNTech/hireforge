// modules/auth.js
// This holds rontend login, registration, logout, and recruiter guest mode helpers. Ai was used in some of this due to lack of confidence in auth knowledge

const strAuthTokenStorageName = 'strAuthToken'
const strAuthUserStorageName = 'objAuthUser'

const getAuthToken = () => localStorage.getItem(strAuthTokenStorageName) || ''

const getAuthUser = () => {
    const strUser = localStorage.getItem(strAuthUserStorageName)
    if (!strUser) return null
    try{
        return JSON.parse(strUser)
    } catch (err) {
        return null
    }
}

const saveAuthSession = (objAuthData) => {
    localStorage.setItem(strAuthTokenStorageName, objAuthData.token)
    localStorage.setItem(strAuthUserStorageName, JSON.stringify(objAuthData.user))
}

const clearAuthSession = () => {
    localStorage.removeItem(strAuthTokenStorageName)
    localStorage.removeItem(strAuthUserStorageName)
}

const isLoggedIn = () => !!getAuthToken()

const updateAuthDisplay = () => {
    const objUser = getAuthUser()
    const navMain = document.querySelector('#mainNavigation')
    const spnCurrentUser = document.querySelector('#spnCurrentUser')

    if (navMain) navMain.style.display = isLoggedIn() ? 'block' : 'none'

    if (spnCurrentUser) {
        spnCurrentUser.innerText = objUser ? `Signed in as ${objUser.Username}${objUser.IsGuest ? ' (Guest)' : ''}` : ''
    }
}

const showAuthSection = () => {
    showSection('auth')
    updateAuthDisplay()
}

const handleAuthResponse = async (objResponse) => {
    const objData = await objResponse.json()

    if (!objResponse.ok || !objData.success){
        throw new Error(objData.message || 'Authentication failed')
    }

    saveAuthSession(objData.data)
    updateAuthDisplay()
    showSection('dashboard')
}

const loginUser = async () => {
    const strUsername = document.querySelector('#txtLoginUsername').value.trim()
    const strPassword = document.querySelector('#txtLoginPassword').value.trim()
    const pAuthStatus = document.querySelector('#pAuthStatus')

    try{
        const objResponse = await fetch(`${strBaseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: strUsername, password: strPassword })
        })
        await handleAuthResponse(objResponse)
    } catch (err){
        pAuthStatus.innerText = err.message
    }
}

const registerUser = async () => {
    const strUsername = document.querySelector('#txtRegisterUsername').value.trim()
    const strPassword = document.querySelector('#txtRegisterPassword').value.trim()
    const pAuthStatus = document.querySelector('#pAuthStatus')

    try{
        const objResponse = await fetch(`${strBaseURL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: strUsername, password: strPassword })
        })
        await handleAuthResponse(objResponse)
    } catch (err){
        pAuthStatus.innerText = err.message
    }
}

const startGuestMode = async () => {
    const pAuthStatus = document.querySelector('#pAuthStatus')

    try{
        const objResponse = await fetch(`${strBaseURL}/api/auth/guest`, { method: 'POST' })
        await handleAuthResponse(objResponse)
    } catch (err){
        pAuthStatus.innerText = err.message
    }
}

const logoutUser = () => {
    clearAuthSession()
    updateAuthDisplay()
    showAuthSection()
}

const requireFrontendAuth = () => {
    updateAuthDisplay()

    if (!isLoggedIn()){
        showAuthSection()
    } else{
        showSection('dashboard')
    }
}

const objOriginalFetch = window.fetch.bind(window)
window.fetch = (objResource, objOptions = {}) => {
    const strToken = getAuthToken()
    const objHeaders = new Headers(objOptions.headers || {})

    if (strToken && !objHeaders.has('Authorization')){
        objHeaders.set('Authorization', `Bearer ${strToken}`)
    }

    return objOriginalFetch(objResource, { ...objOptions, headers: objHeaders }).then((objResponse) => {
        if (objResponse.status === 401 && isLoggedIn()) {
            const strURL = typeof objResource === 'string' ? objResource : objResource.url
            if (!strURL.includes('/api/auth/password')) {
                clearAuthSession()
                updateAuthDisplay()
                showAuthSection()
            }
        }
        return objResponse
})
}