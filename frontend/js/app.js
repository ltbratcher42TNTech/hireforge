
//const strBaseURL = 'http://localhost:8000'
const strBaseURL = ''

// ===================================================
// Navigation of the site (basically open forms)
// ===================================================

const showSection = (strSectionName) => {
    document.getElementById('dashboardSection').style.display = 'none'
    document.getElementById('profileSection').style.display = 'none'
    document.getElementById('jobsSection').style.display = 'none'
    document.getElementById('skillsSection').style.display = 'none'
    document.getElementById('certsSection').style.display = 'none'
    document.getElementById('awardsSection').style.display = 'none'
    document.getElementById('resumeSection').style.display = 'none'
    document.getElementById(strSectionName + 'Section').style.display = 'block'
}

document.querySelector('#btnNavDashboard').addEventListener('click', () => {
    showSection('dashboard')
})

document.querySelector('#btnNavProfile').addEventListener('click', () => {
    showSection('profile')
    loadProfile()
    loadGeminiKeyStatus()
})

document.querySelector('#btnNavJobs').addEventListener('click', () => {
    showSection('jobs')
    loadJobs()
})

document.querySelector('#btnNavSkills').addEventListener('click', () => {
    showSection('skills')
    loadCategories()
})

document.querySelector('#btnNavCerts').addEventListener('click', () => {
    showSection('certs')
    loadCerts()
})

document.querySelector('#btnNavAwards').addEventListener('click', () => {
    showSection('awards')
    loadAwards()
})

document.querySelector('#btnNavResume').addEventListener('click', () => {
    showSection('resume')
    loadResumeBuilderData()
})

// ===================================================
// Profile
// ===================================================

let strCurrentProfileID = ''
let strCurrentJobTitle = ''
let strCurrentJobCompany = ''

const objResumeDataCache = {
    objProfile: null,
    arrJobs: [],
    arrCategories: [],
    arrSkills: [],
    arrCerts: [],
    arrAwards: [],
    objDetailsByJobID: {}
}

const strGeminiKeyStorageName = 'strGeminiApiKey'

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

    const objProfile = objData.profile
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

    strCurrentProfileID = objData.profile.ProfileID
    document.querySelector('#pProfileStatus').innerText = 'Profile saved successfully.'
})

// ===================================================
// Jobs (Steve Jobs)
// ===================================================

const loadJobs = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/jobs`)
    const objData = await objResponse.json()
    const arrJobs = objData.jobs

    const divJobs = document.querySelector('#divJobs')
    divJobs.innerHTML = ''

    arrJobs.forEach(function(objJob) {
        // Used AI here as well to help me edit jobs
        divJobs.innerHTML += `
            <div class="card p-3 mb-2 btnSelectJob" style="cursor:pointer;" data-id="${objJob.JobID}" data-title="${objJob.Title}" data-company="${objJob.Company}">
                <strong>${objJob.Title}</strong> ${objJob.Company}
                <br>
                <small>${formatResumeDateRange(objJob.StartDate, objJob.EndDate)}</small>
                <br>

                <button 
                    class="btn btn-danger btn-sm mt-2 btnDeleteJob"
                    data-id="${objJob.JobID}">
                    Delete
                </button>
            </div>
        `
    })
}

// Load jobs details, had to move this ABOVE divjobs listener, and kept having issues before I did
const loadDetails = async (strJobID) => {
    console.log('loadDetails called with:', strJobID)
    const objResponse = await fetch(`${strBaseURL}/api/jobs/${strJobID}/details`)
    const objData = await objResponse.json()
    const arrDetails = objData.data
    console.log(arrDetails)

    const divDetailList = document.querySelector('#divDetailList')
    divDetailList.innerHTML = ''

    // I used a little AI just to make the delete button, the big red one I know how to make looked awful, 
    // I wanted something more subtle, and now its a tiny button on the bottom left
    arrDetails.forEach(function(objDetail) {
        divDetailList.innerHTML += `
            <div class="card p-2 mb-1">
                - ${objDetail.Detail}
                <div class="d-flex flex-column mt-2" style="width: fit-content;">
                    <span class="text-primary btnImproveDetail btn btn-outline-dark py-0 px-1" style="cursor:pointer; font-size:0.8rem;" data-id="${objDetail.DetailID}" data-detail="${objDetail.Detail}">ai improve</span>
                    <span class="text-danger btnDeleteDetail" style="cursor:pointer; font-size:0.8rem;" data-id="${objDetail.DetailID}">remove</span>
                </div>
            </div>
        `
    })
}

// Allows you to delete the details
document.querySelector('#divDetailList').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnImproveDetail')) {
        const strOriginalDetail = objEvent.target.dataset.detail ? objEvent.target.dataset.detail.trim() : ''
        const strGeminiApiKey = localStorage.getItem(strGeminiKeyStorageName) || ''

        if (!strOriginalDetail) {
            alert('Bullet detail is required for AI improvement.')
            return
        }

        document.querySelector('#pJobAiStatus').innerText = 'Improving bullet with AI...'

        const objResponse = await fetch(`${strBaseURL}/api/ai/improve-bullet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                detail: strOriginalDetail,
                jobTitle: strCurrentJobTitle,
                company: strCurrentJobCompany,
                geminiApiKey: strGeminiApiKey
            })
        })

        const objData = await objResponse.json()
        if (objResponse.status !== 200) {
            document.querySelector('#pJobAiStatus').innerText = ''
            alert(objData.message || 'AI improvement failed.')
            return
        }

        document.querySelector('#txtDetail').value = objData.data.improvedBullet
        document.querySelector('#pJobAiStatus').innerText = 'Improved bullet added to input box. Review, then click "Add Bullet" to save.'
        return
    }

    
    if (objEvent.target.classList.contains('btnDeleteDetail')) {
        const strDetailID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/details/${strDetailID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadDetails(strCurrentJobID)
    }
})

// Utilized AI a bit here because navigating this delete button proved difficult as the way I 
// was thinkig about it required dynamically adding it and I could not make it work without 
// some help
document.querySelector('#divJobs').addEventListener('click', async function(objEvent) {
    // Handle the delete here
    if (objEvent.target.classList.contains('btnDeleteJob')) {
        const strJobID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/jobs/${strJobID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadJobs()
        return
    }

    // Handle selecting a job to edit
    const divJob = objEvent.target.closest('.btnSelectJob')
    if (divJob) {
        const strJobID = divJob.dataset.id
        const strTitle = divJob.dataset.title
        const strCompany = divJob.dataset.company

        strCurrentJobID = strJobID
        strCurrentJobTitle = strTitle
        strCurrentJobCompany = strCompany

        document.querySelector('#txtSelectedJob').innerText = `${strTitle} — ${strCompany}`
        document.querySelector('#divJobs').style.display = 'none'
        document.querySelector('#divJobDetailsView').style.display = 'block'
        loadDetails(strJobID)
    }
})

// Simple button after opening edit menu
document.querySelector('#btnBackToJobs').addEventListener('click', function() {
    document.querySelector('#divJobDetailsView').style.display = 'none'
    document.querySelector('#divJobs').style.display = 'block'
    document.querySelector('#pJobAiStatus').innerText = ''
    loadJobs()
})

let strCurrentJobID = ''

document.querySelector('#btnAddDetail').addEventListener('click', async function() {
    const strDetail = document.querySelector('#txtDetail').value.trim()

    if (!strDetail) {
        alert('Please enter a detail')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/jobs/${strCurrentJobID}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail: strDetail })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtDetail').value = ''
    loadDetails(strCurrentJobID)
})

// AI assisted: toggles end date input when present/current job is selected.
document.querySelector('#chkJobPresent').addEventListener('change', function() {
    const blnIsPresent = document.querySelector('#chkJobPresent').checked
    document.querySelector('#txtEndDate').disabled = blnIsPresent

    if (blnIsPresent) {
        document.querySelector('#txtEndDate').value = ''
    }
})



document.querySelector('#btnAddJob').addEventListener('click', async () => {

    let strTitle = document.querySelector('#txtTitle').value.trim()
    let strCompany = document.querySelector('#txtCompany').value.trim()
    let strStartDate = document.querySelector('#txtStartDate').value
    let strEndDate = document.querySelector('#txtEndDate').value
    let blnIsPresent = document.querySelector('#chkJobPresent').checked

    if (blnIsPresent) {
        strEndDate = ''
    }

    let blnError = false
    let strMessage = ''

    if (!strTitle) {
        blnError = true
        strMessage += '<p>Title required</p>'
    }
    if (!strCompany) {
        blnError = true
        strMessage += '<p>Company required</p>'
    }
    if (!strStartDate) {
        blnError = true
        strMessage += '<p>Start date required</p>'
    }
    if (!strEndDate && !blnIsPresent) {
        blnError = true
        strMessage += '<p>End date required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: strTitle,
            company: strCompany,
            startDate: strStartDate,
            endDate: strEndDate,
            isPresent: blnIsPresent        })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    // Clear form
    document.querySelector('#txtTitle').value = ''
    document.querySelector('#txtCompany').value = ''
    document.querySelector('#txtStartDate').value = ''
    document.querySelector('#txtEndDate').value = ''
    document.querySelector('#chkJobPresent').checked = false
    document.querySelector('#txtEndDate').disabled = false

    loadJobs() // refresh list
})

// ===================================================
// Skills
// ===================================================

// init
let strCurrentCategoryID = ''


const loadCategories = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/skillcategories`)
    const objData = await objResponse.json()
    const arrCategories = objData.data

    const divCategories = document.querySelector('#divCategories')
    divCategories.innerHTML = ''

    arrCategories.forEach(function(objCategory) {
        divCategories.innerHTML += `
            <div class="card p-3 mb-2 btnSelectCategory" style="cursor:pointer;" data-id="${objCategory.CategoryID}" data-name="${objCategory.Name}">
                <strong>${objCategory.Name}</strong>
                <button class="btn btn-danger btn-sm mt-2 btnDeleteCategory" data-id="${objCategory.CategoryID}">Delete</button>
            </div>
        `
    })
}

const loadSkills = async (strCategoryID) => {
    const objResponse = await fetch(`${strBaseURL}/api/skills?categoryId=${strCategoryID}`)
    const objData = await objResponse.json()
    const arrSkills = objData.data

    const divSkillList = document.querySelector('#divSkillList')
    divSkillList.innerHTML = ''

    arrSkills.forEach(function(objSkill) {
        divSkillList.innerHTML += `
            <div class="card p-2 mb-1">
                - ${objSkill.Name}
                <span class="text-danger btnDeleteSkill" style="cursor:pointer; font-size:0.8rem;" data-id="${objSkill.SkillID}">remove</span>
            </div>
        `
    })
}
// Handles deleting (and subsequently refreshing) and selecting skills categories
document.querySelector('#divCategories').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteCategory')) {
        const strCategoryID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/skillcategories/${strCategoryID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadCategories()
        return
    }

    const divCategory = objEvent.target.closest('.btnSelectCategory')
    if (divCategory) {
        strCurrentCategoryID = divCategory.dataset.id
        const strName = divCategory.dataset.name

        document.querySelector('#txtSelectedCategory').innerText = strName
        document.querySelector('#divCategoryView').style.display = 'none'
        document.querySelector('#divSkillView').style.display = 'block'
        loadSkills(strCurrentCategoryID)
    }
})

// Simply handles a back button
document.querySelector('#btnBackToCategories').addEventListener('click', function() {
    document.querySelector('#divSkillView').style.display = 'none'
    document.querySelector('#divCategoryView').style.display = 'block'
    loadCategories()
})

// Handles deletion of skills
document.querySelector('#divSkillList').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteSkill')) {
        const strSkillID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/skills/${strSkillID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadSkills(strCurrentCategoryID)
    }
})

// To POST Categories
document.querySelector('#btnAddCategory').addEventListener('click', async function() {
    const strName = document.querySelector('#txtCategoryName').value.trim()

    if (!strName) {
        alert('Category name is required')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/skillcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtCategoryName').value = ''
    loadCategories()
})

// POST method for skill
document.querySelector('#btnAddSkill').addEventListener('click', async function() {
    const strName = document.querySelector('#txtSkillName').value.trim()

    if (!strName) {
        alert('Skill name is required')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName, categoryId: strCurrentCategoryID })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtSkillName').value = ''
    loadSkills(strCurrentCategoryID)
})

// ===================================================
// Certifications
// ===================================================

const loadCerts = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/certifications`)
    const objData = await objResponse.json()
    const arrCerts = objData.data

    const divCerts = document.querySelector('#divCerts')
    divCerts.innerHTML = ''

    arrCerts.forEach(function(objCert) {
        divCerts.innerHTML += `
            <div class="card p-3 mb-2">
                <strong>${objCert.Name}</strong> — ${objCert.Issuer}
                <br>
                <small>${objCert.DateEarned}</small>
                <span class="text-danger btnDeleteCert" style="cursor:pointer; font-size:0.8rem;" data-id="${objCert.CertID}">remove</span>
            </div>
        `
    })
}

document.querySelector('#divCerts').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteCert')) {
        const strCertID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/certifications/${strCertID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadCerts()
    }
})

document.querySelector('#btnAddCert').addEventListener('click', async function() {
    const strName = document.querySelector('#txtCertName').value.trim()
    const strIssuer = document.querySelector('#txtCertIssuer').value.trim()
    const strDate = document.querySelector('#txtCertDate').value

    let blnError = false
    let strMessage = ''

    if (!strName) {
        blnError = true
        strMessage += '<p>Certification name is required</p>'
    }
    if (!strIssuer) {
        blnError = true
        strMessage += '<p>Issuer is required</p>'
    }
    if (!strDate) {
        blnError = true
        strMessage += '<p>Date is required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/certifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName, issuer: strIssuer, dateEarned: strDate })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtCertName').value = ''
    document.querySelector('#txtCertIssuer').value = ''
    document.querySelector('#txtCertDate').value = ''

    loadCerts()
})

// ===================================================
// Awards
// ===================================================

const loadAwards = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/awards`)
    const objData = await objResponse.json()
    const arrAwards = objData.data

    const divAwards = document.querySelector('#divAwards')
    divAwards.innerHTML = ''

    arrAwards.forEach(function(objAward) {
        divAwards.innerHTML += `
            <div class="card p-3 mb-2">
                <strong>${objAward.Name}</strong> — ${objAward.Issuer}
                <br>
                <small>${objAward.DateEarned}</small>
                <br>
                ${objAward.Description}
                <span class="text-danger btnDeleteAward" style="cursor:pointer; font-size:0.8rem;" data-id="${objAward.AwardID}">remove</span>
            </div>
        `
    })
}

document.querySelector('#divAwards').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteAward')) {
        const strAwardID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/awards/${strAwardID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadAwards()
    }
})

document.querySelector('#btnAddAward').addEventListener('click', async function() {
    const strName = document.querySelector('#txtAwardName').value.trim()
    const strIssuer = document.querySelector('#txtAwardIssuer').value.trim()
    const strDate = document.querySelector('#txtAwardDate').value
    const strDescription = document.querySelector('#txtAwardDescription').value.trim()

    let blnError = false
    let strMessage = ''

    if (!strName) {
        blnError = true
        strMessage += '<p>Award name is required</p>'
    }
    if (!strDate) {
        blnError = true
        strMessage += '<p>Date is required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/awards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName, issuer: strIssuer, dateEarned: strDate, description: strDescription })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtAwardName').value = ''
    document.querySelector('#txtAwardIssuer').value = ''
    document.querySelector('#txtAwardDate').value = ''
    document.querySelector('#txtAwardDescription').value = ''

    loadAwards()
})


// AI assisted here. Gemini key save/clear controls for profile AI settings.
document.querySelector('#btnSaveGeminiKey').addEventListener('click', function() {
    const strGeminiApiKey = document.querySelector('#txtGeminiApiKey').value.trim()

    if (!strGeminiApiKey) {
        alert('Please enter a Gemini API key to save.')
        return
    }

    localStorage.setItem(strGeminiKeyStorageName, strGeminiApiKey)
    document.querySelector('#pGeminiKeyStatus').innerText = 'Gemini key saved in browser storage.'
})

document.querySelector('#btnClearGeminiKey').addEventListener('click', function() {
    localStorage.removeItem(strGeminiKeyStorageName)
    document.querySelector('#txtGeminiApiKey').value = ''
    document.querySelector('#pGeminiKeyStatus').innerText = 'Saved Gemini key cleared.'
})

// ===================================================================
// Resume Builder (This part was almost entirely AI generated)
// ===================================================================


// AI assisted: helper functions to format stored ISO dates only for resume preview display.
const formatResumeMonthYear = (strISODate, blnUseShortMonth = true) => {
    if (!strISODate) return ''

    const objDate = new Date(strISODate)
    if (Number.isNaN(objDate.getTime())) return strISODate

    const strMonth = objDate.toLocaleString('en-US', { month: blnUseShortMonth ? 'short' : 'long' })
    const strYear = objDate.getFullYear()
    return `${strMonth} ${strYear}`
}

// AI assisted: turns job start/end ISO strings into resume-friendly date ranges.
const formatResumeDateRange = (strStartDate, strEndDate) => {
    const strFormattedStartDate = formatResumeMonthYear(strStartDate, true)
    const strFormattedEndDate = strEndDate ? formatResumeMonthYear(strEndDate, true) : 'Present'

    if (!strFormattedStartDate && !strFormattedEndDate) return ''
    if (!strFormattedStartDate) return strFormattedEndDate
    if (!strFormattedEndDate) return strFormattedStartDate

    return `${strFormattedStartDate} – ${strFormattedEndDate}`
}



// AI assisted: loads all resume-related source data so users can select what to include.
const loadResumeBuilderData = async () => {
    document.querySelector('#pResumeStatus').innerText = 'Loading resume data...'

    try {
        const objProfileResponse = await fetch(`${strBaseURL}/api/profile`)
        if (objProfileResponse.status === 200) {
            const objProfileData = await objProfileResponse.json()
            objResumeDataCache.objProfile = objProfileData.profile || null
        } else {
            objResumeDataCache.objProfile = null
        }

        const objJobsResponse = await fetch(`${strBaseURL}/api/jobs`)
        const objJobsData = await objJobsResponse.json()
        objResumeDataCache.arrJobs = objJobsData.jobs || []

        const objCategoryResponse = await fetch(`${strBaseURL}/api/skillcategories`)
        const objCategoryData = await objCategoryResponse.json()
        objResumeDataCache.arrCategories = objCategoryData.data || []

        const objSkillsResponse = await fetch(`${strBaseURL}/api/skills`)
        const objSkillsData = await objSkillsResponse.json()
        objResumeDataCache.arrSkills = objSkillsData.data || []

        const objCertResponse = await fetch(`${strBaseURL}/api/certifications`)
        const objCertData = await objCertResponse.json()
        objResumeDataCache.arrCerts = objCertData.data || []

        const objAwardResponse = await fetch(`${strBaseURL}/api/awards`)
        const objAwardData = await objAwardResponse.json()
        objResumeDataCache.arrAwards = objAwardData.data || []

        objResumeDataCache.objDetailsByJobID = {}
        for (const objJob of objResumeDataCache.arrJobs) {
            const objDetailResponse = await fetch(`${strBaseURL}/api/jobs/${objJob.JobID}/details`)
            const objDetailData = await objDetailResponse.json()
            objResumeDataCache.objDetailsByJobID[objJob.JobID] = objDetailData.data || []
        }

        renderResumeSelectionUI()
        document.querySelector('#pResumeStatus').innerText = 'Resume data loaded. Select items and click Generate Resume.'
    } catch (objError) {
        console.error('Resume data load failed:', objError)
        document.querySelector('#pResumeStatus').innerText = 'Failed to load resume data.'
    }
}

const renderResumeSelectionUI = () => {
    renderResumeProfileSelection()
    renderResumeJobsSelection()
    renderResumeSkillsSelection()
    renderResumeCertSelection()
    renderResumeAwardSelection()
}

const renderResumeProfileSelection = () => {
    const divProfileFields = document.querySelector('#divResumeProfileFields')
    const objProfile = objResumeDataCache.objProfile

    if (!objProfile) {
        divProfileFields.innerHTML = '<p class="text-muted mb-0">No profile data found.</p>'
        return
    }

    const arrFields = [
        { strField: 'FullName', strLabel: 'Full Name' },
        { strField: 'Email', strLabel: 'Email' },
        { strField: 'Phone', strLabel: 'Phone' },
        { strField: 'Location', strLabel: 'Location' },
        { strField: 'LinkedIn', strLabel: 'LinkedIn' },
        { strField: 'GitHub', strLabel: 'GitHub' },
        { strField: 'Website', strLabel: 'Website' }
    ]

    divProfileFields.innerHTML = arrFields.map((objField) => {
        const strValue = objProfile[objField.strField] || ''
        return `
            <div class="form-check">
                <input class="form-check-input chkResumeProfileField" type="checkbox" id="chkProfile${objField.strField}" data-field="${objField.strField}" ${strValue ? 'checked' : ''} aria-label="${objField.strLabel}">
                <label class="form-check-label" for="chkProfile${objField.strField}">
                    ${objField.strLabel}${strValue ? '' : ' (empty)'}
                </label>
            </div>
        `
    }).join('')
}

const renderResumeJobsSelection = () => {
    const divJobs = document.querySelector('#divResumeJobs')
    const arrJobs = objResumeDataCache.arrJobs

    if (!arrJobs.length) {
        divJobs.innerHTML = '<p class="text-muted mb-0">No jobs found.</p>'
        return
    }

    let strJobsHTML = ''
    arrJobs.forEach((objJob) => {
        const arrDetails = objResumeDataCache.objDetailsByJobID[objJob.JobID] || []
        strJobsHTML += `
            <div class="border rounded p-2 mb-2">
                <div class="form-check mb-2">
                    <input class="form-check-input chkResumeJob" type="checkbox" id="chkJob${objJob.JobID}" data-job-id="${objJob.JobID}" checked aria-label="Select job ${objJob.Title}">
                    <label class="form-check-label fw-bold" for="chkJob${objJob.JobID}">
                        ${objJob.Title} — ${objJob.Company}
                    </label>
                </div>
                ${arrDetails.map((objDetail) => `
                    <div class="form-check ms-3">
                        <input class="form-check-input chkResumeDetail" type="checkbox" id="chkDetail${objDetail.DetailID}" data-job-id="${objJob.JobID}" data-detail-id="${objDetail.DetailID}" checked aria-label="Select detail ${objDetail.Detail}">
                        <label class="form-check-label" for="chkDetail${objDetail.DetailID}">
                            ${objDetail.Detail}
                        </label>
                    </div>
                `).join('')}
            </div>
        `
    })

    divJobs.innerHTML = strJobsHTML
}

const renderResumeSkillsSelection = () => {
    const divSkills = document.querySelector('#divResumeSkills')
    const arrCategories = objResumeDataCache.arrCategories
    const arrSkills = objResumeDataCache.arrSkills

    if (!arrSkills.length) {
        divSkills.innerHTML = '<p class="text-muted mb-0">No skills found.</p>'
        return
    }

    let strHTML = ''
    arrCategories.forEach((objCategory) => {
        const arrCategorySkills = arrSkills.filter((objSkill) => objSkill.CategoryID === objCategory.CategoryID)
        if (!arrCategorySkills.length) return

        strHTML += `<h6 class="mt-2">${objCategory.Name}</h6>`
        strHTML += arrCategorySkills.map((objSkill) => `
            <div class="form-check">
                <input class="form-check-input chkResumeSkill" type="checkbox" id="chkSkill${objSkill.SkillID}" data-skill-id="${objSkill.SkillID}" checked aria-label="Select skill ${objSkill.Name}">
                <label class="form-check-label" for="chkSkill${objSkill.SkillID}">${objSkill.Name}</label>
            </div>
        `).join('')
    })

    divSkills.innerHTML = strHTML
}

const renderResumeCertSelection = () => {
    const divCerts = document.querySelector('#divResumeCerts')
    const arrCerts = objResumeDataCache.arrCerts

    if (!arrCerts.length) {
        divCerts.innerHTML = '<p class="text-muted mb-0">No certifications found.</p>'
        return
    }

    divCerts.innerHTML = arrCerts.map((objCert) => `
        <div class="form-check">
            <input class="form-check-input chkResumeCert" type="checkbox" id="chkCert${objCert.CertID}" data-cert-id="${objCert.CertID}" checked aria-label="Select certification ${objCert.Name}">
            <label class="form-check-label" for="chkCert${objCert.CertID}">
                ${objCert.Name} — ${objCert.Issuer}
            </label>
        </div>
    `).join('')
}

const renderResumeAwardSelection = () => {
    const divAwards = document.querySelector('#divResumeAwards')
    const arrAwards = objResumeDataCache.arrAwards

    if (!arrAwards.length) {
        divAwards.innerHTML = '<p class="text-muted mb-0">No awards found.</p>'
        return
    }

    divAwards.innerHTML = arrAwards.map((objAward) => `
        <div class="form-check">
            <input class="form-check-input chkResumeAward" type="checkbox" id="chkAward${objAward.AwardID}" data-award-id="${objAward.AwardID}" checked aria-label="Select award ${objAward.Name}">
            <label class="form-check-label" for="chkAward${objAward.AwardID}">
                ${objAward.Name} — ${objAward.Issuer}
            </label>
        </div>
    `).join('')
}

const generateResumePreview = () => {
    const objProfile = objResumeDataCache.objProfile
    const arrSelectedProfileFields = Array.from(document.querySelectorAll('.chkResumeProfileField:checked')).map((objElement) => objElement.dataset.field)
    const arrSelectedJobs = Array.from(document.querySelectorAll('.chkResumeJob:checked')).map((objElement) => objElement.dataset.jobId)
    const arrSelectedDetailIDs = Array.from(document.querySelectorAll('.chkResumeDetail:checked')).map((objElement) => objElement.dataset.detailId)
    const arrSelectedSkillIDs = Array.from(document.querySelectorAll('.chkResumeSkill:checked')).map((objElement) => objElement.dataset.skillId)
    const arrSelectedCertIDs = Array.from(document.querySelectorAll('.chkResumeCert:checked')).map((objElement) => objElement.dataset.certId)
    const arrSelectedAwardIDs = Array.from(document.querySelectorAll('.chkResumeAward:checked')).map((objElement) => objElement.dataset.awardId)

    const arrSelectedSkills = objResumeDataCache.arrSkills.filter((objSkill) => arrSelectedSkillIDs.includes(objSkill.SkillID))
    const arrSelectedCerts = objResumeDataCache.arrCerts.filter((objCert) => arrSelectedCertIDs.includes(objCert.CertID))
    const arrSelectedAwards = objResumeDataCache.arrAwards.filter((objAward) => arrSelectedAwardIDs.includes(objAward.AwardID))

    let strHTML = ''

    if (objProfile) {
        strHTML += '<section>'
        if (arrSelectedProfileFields.includes('FullName') && objProfile.FullName) {
            strHTML += `<h2>${objProfile.FullName}</h2>`
        }

        let arrContact = []
        if (arrSelectedProfileFields.includes('Email') && objProfile.Email) arrContact.push(objProfile.Email)
        if (arrSelectedProfileFields.includes('Phone') && objProfile.Phone) arrContact.push(objProfile.Phone)
        if (arrSelectedProfileFields.includes('Location') && objProfile.Location) arrContact.push(objProfile.Location)
        if (arrSelectedProfileFields.includes('LinkedIn') && objProfile.LinkedIn) arrContact.push(objProfile.LinkedIn)
        if (arrSelectedProfileFields.includes('GitHub') && objProfile.GitHub) arrContact.push(objProfile.GitHub)
        if (arrSelectedProfileFields.includes('Website') && objProfile.Website) arrContact.push(objProfile.Website)
        strHTML += `<p>${arrContact.join(' | ')}</p>`
        strHTML += '</section>'
    }



    strHTML += '<section class="resume-preview-section"><h3>Experience</h3>'
    const arrJobs = objResumeDataCache.arrJobs.filter((objJob) => arrSelectedJobs.includes(objJob.JobID))
    arrJobs.forEach((objJob) => {
        const arrDetails = (objResumeDataCache.objDetailsByJobID[objJob.JobID] || []).filter((objDetail) => arrSelectedDetailIDs.includes(objDetail.DetailID))
        strHTML += `
            <div class="mb-2">
                <div class="resume-job-header">
                    <strong>${objJob.Title} — ${objJob.Company}</strong>
                    <small>${formatResumeDateRange(objJob.StartDate, objJob.EndDate)}</small>
                </div>
                <ul>
        `
        arrDetails.forEach((objDetail) => {
            strHTML += `<li class="resume-bullet-item">${objDetail.Detail}</li>`
        })
        strHTML += '</ul></div>'
    })
    strHTML += '</section>'



    strHTML += '<section class="resume-preview-section"><h3>Skills</h3>'
    objResumeDataCache.arrCategories.forEach((objCategory) => {
        const arrCategorySkills = arrSelectedSkills.filter((objSkill) => objSkill.CategoryID === objCategory.CategoryID)
        if (!arrCategorySkills.length) return
        const strSkillNames = arrCategorySkills.map((objSkill) => objSkill.Name).join(', ')
        strHTML += `<p><span class="fw-bold">${objCategory.Name}:</span> ${strSkillNames}</p>`
    })
    strHTML += '</section>'



    strHTML += '<section class="resume-preview-section"><h3>Certifications</h3><ul>'
    arrSelectedCerts.forEach((objCert) => {
        strHTML += `<li><span class="fw-bold">${objCert.Name}</span> — ${objCert.Issuer} (${formatResumeMonthYear(objCert.DateEarned, false)})</li>`    })
    strHTML += '</ul></section>'


    
    strHTML += '<section class="resume-preview-section"><h3>Awards</h3><ul>'
    arrSelectedAwards.forEach((objAward) => {
        strHTML += `<li><span class="fw-bold">${objAward.Name}</span> — ${objAward.Issuer} (${formatResumeMonthYear(objAward.DateEarned, false)})${objAward.Description ? `: ${objAward.Description}` : ''}</li>`    })
    strHTML += '</ul></section>'

    document.querySelector('#divResumePreview').innerHTML = strHTML
    document.querySelector('#pResumeStatus').innerText = 'Resume preview generated.'
}

// AI assisted: optional polish pass for generated bullet points in preview.
const aiPolishResumeBullets = async () => {
    const arrBulletElements = Array.from(document.querySelectorAll('.resume-bullet-item'))
    const strGeminiApiKey = localStorage.getItem(strGeminiKeyStorageName) || ''

    if (!arrBulletElements.length) {
        alert('Generate resume first so there are bullets to polish.')
        return
    }

    document.querySelector('#pResumeStatus').innerText = 'AI polishing selected resume bullets...'

    for (const objBulletElement of arrBulletElements) {
        const strBullet = objBulletElement.innerText.trim()
        if (!strBullet) continue

        const objResponse = await fetch(`${strBaseURL}/api/ai/improve-bullet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                detail: strBullet,
                geminiApiKey: strGeminiApiKey
            })
        })

        const objData = await objResponse.json()
        if (objResponse.status === 200 && objData.data && objData.data.improvedBullet) {
            objBulletElement.innerText = objData.data.improvedBullet
        }
    }

    document.querySelector('#pResumeStatus').innerText = 'AI polish complete. Please review content for accuracy.'
}

document.querySelector('#btnGenerateResume').addEventListener('click', generateResumePreview)
document.querySelector('#btnAiPolishResume').addEventListener('click', aiPolishResumeBullets)
document.querySelector('#btnPrintResume').addEventListener('click', () => {
    window.print()
})
