
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
})

// ===================================================
// Profile
// ===================================================

let strCurrentProfileID = ''

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
                <small>${objJob.StartDate} to ${objJob.EndDate}</small>
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
                <span class="text-danger btnDeleteDetail" style="cursor:pointer; font-size:0.8rem;" data-id="${objDetail.DetailID}">remove</span>
            </div>
        `
    })
}

// Allows you to delete the details
document.querySelector('#divDetailList').addEventListener('click', async function(objEvent) {
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

document.querySelector('#btnAddJob').addEventListener('click', async () => {

    let strTitle = document.querySelector('#txtTitle').value.trim()
    let strCompany = document.querySelector('#txtCompany').value.trim()
    let strStartDate = document.querySelector('#txtStartDate').value
    let strEndDate = document.querySelector('#txtEndDate').value

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
    if (!strEndDate) {
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
            endDate: strEndDate
        })
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
