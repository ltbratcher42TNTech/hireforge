// ===================================================
// Profile
// ===================================================

let strCurrentProfileID = ''

// AI assisted here, this is basically local key manager for Gemini API key save/clear usage in browser only.
const loadGeminiKeyStatus = async () => {
    const strSavedGeminiKey = localStorage.getItem(strGeminiKeyStorageName) || ''
    document.querySelector('#txtGeminiApiKey').value = strSavedGeminiKey

    let strStatus = ''
    if (strSavedGeminiKey) {
        strStatus = 'Gemini key loaded from browser storage.'
    } else {
        const objResponse = await fetch(`${strBaseURL}/api/ai/config`)
        const objData = await objResponse.json()
        if (objResponse.status === 200 && objData.data && objData.data.hasEnvKey) {
            strStatus = 'No local key saved. Server .env fallback key is available.'
        } else {
            strStatus = 'No local key saved.'
        }
    }

    document.querySelector('#pGeminiKeyStatus').innerText = strStatus
}

const loadProfile = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/profile`)

    if (objResponse.status === 404) {
        clearProfileForm()
        document.querySelector('#pProfileStatus').innerText = 'No profile saved yet.'
        return
    }

    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        alert(objData.message)
        return
    }

    const objProfile = objData.data && objData.data.profile ? objData.data.profile : null
    if (!objProfile) {
        alert('Profile data is missing from server response.')
        return
    }
    strCurrentProfileID = objProfile.ProfileID

    document.querySelector('#txtFullName').value = objProfile.FullName || ''
    document.querySelector('#txtEmail').value = objProfile.Email || ''
    document.querySelector('#txtPhone').value = objProfile.Phone || ''
    document.querySelector('#txtLocation').value = objProfile.Location || ''
    document.querySelector('#txtLinkedIn').value = objProfile.LinkedIn || ''
    document.querySelector('#txtGitHub').value = objProfile.GitHub || ''
    document.querySelector('#txtWebsite').value = objProfile.Website || ''
    document.querySelector('#pProfileStatus').innerText = 'Profile loaded.'
}

const clearProfileForm = () => {
    strCurrentProfileID = ''
    document.querySelector('#txtFullName').value = ''
    document.querySelector('#txtEmail').value = ''
    document.querySelector('#txtPhone').value = ''
    document.querySelector('#txtLocation').value = ''
    document.querySelector('#txtLinkedIn').value = ''
    document.querySelector('#txtGitHub').value = ''
    document.querySelector('#txtWebsite').value = ''
}

document.querySelector('#btnSaveProfile').addEventListener('click', async () => {
    let strFullName = document.querySelector('#txtFullName').value.trim()
    let strEmail = document.querySelector('#txtEmail').value.trim()
    let strPhone = document.querySelector('#txtPhone').value.trim()
    let strLocation = document.querySelector('#txtLocation').value.trim()
    let strLinkedIn = document.querySelector('#txtLinkedIn').value.trim()
    let strGitHub = document.querySelector('#txtGitHub').value.trim()
    let strWebsite = document.querySelector('#txtWebsite').value.trim()

    let blnError = false
    let strMessage = ''

    if (!strFullName) {
        blnError = true
        strMessage += '<p>Full name is required</p>'
    }

    if (!strEmail) {
        blnError = true
        strMessage += '<p>Email is required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    let strURL = `${strBaseURL}/api/profile`
    let strMethod = 'POST'

    if (strCurrentProfileID) {
        strURL = `${strBaseURL}/api/profile/${strCurrentProfileID}`
        strMethod = 'PUT'
    }

    const objResponse = await fetch(strURL, {
        method: strMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: strFullName,
            email: strEmail,
            phone: strPhone,
            location: strLocation,
            linkedIn: strLinkedIn,
            gitHub: strGitHub,
            website: strWebsite
        })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 200 && objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    // AI helped write this, basically helps handle missing data gracefully so it doesn't break. 
    // The commented out code was MUCH more brittle and could cause issues like crashes
    
    // strCurrentProfileID = objData.profile.ProfileID

    const objSavedProfile = objData.data && objData.data.profile ? objData.data.profile : null
    if (!objSavedProfile) {
        alert('Profile data is missing from server response.')
        return
    }
    strCurrentProfileID = objSavedProfile.ProfileID
    document.querySelector('#pProfileStatus').innerText = 'Profile saved successfully.'
})

// AI Assisted, button to change password
document.querySelector('#btnChangePassword').addEventListener('click', async () => {
    const strCurrentPassword = document.querySelector('#txtCurrentPassword').value.trim()
    const strNewPassword = document.querySelector('#txtNewPassword').value.trim()
    const strConfirmPassword = document.querySelector('#txtConfirmPassword').value.trim()

    if (!strCurrentPassword || !strNewPassword || !strConfirmPassword){
        document.querySelector('#pPasswordStatus').innerText = 'All password fields are required.'
        return
    }

    if (strNewPassword !== strConfirmPassword){
        document.querySelector('#pPasswordStatus').innerText = 'New passwords do not match.'
        return
    }

    if (strNewPassword.length < 8) {
        document.querySelector('#pPasswordStatus').innerText = 'New password must be at least 8 characters.'
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: strCurrentPassword, newPassword: strNewPassword })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        document.querySelector('#pPasswordStatus').innerText = objData.message
        return
    }

    document.querySelector('#txtCurrentPassword').value = ''
    document.querySelector('#txtNewPassword').value = ''
    document.querySelector('#txtConfirmPassword').value = ''
    document.querySelector('#pPasswordStatus').innerText = 'Password changed successfully.'
})
