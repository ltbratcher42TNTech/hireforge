
//const strBaseURL = 'http://localhost:8000'
const strBaseURL = ''

// ===================================================
// Navigation of the site (basically open forms)
// ===================================================

const showSection = (strSectionName) => {
    document.getElementById('dashboardSection').style.display = 'none'
    document.getElementById('profileSection').style.display = 'none'
    document.getElementById('jobsSection').style.display = 'none'
    document.getElementById('educationSection').style.display = 'none'
    document.getElementById('skillsSection').style.display = 'none'
    document.getElementById('certsSection').style.display = 'none'
    document.getElementById('awardsSection').style.display = 'none'
    document.getElementById('summarySection').style.display = 'none'
    document.getElementById('resumeSection').style.display = 'none'
    document.getElementById('coverLetterSection').style.display = 'none'
    document.getElementById('thankYouSection').style.display = 'none'
    document.getElementById('aboutDevSection').style.display = 'none'
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

document.querySelector('#btnNavEducation').addEventListener('click', () => {
    showSection('education')
    loadEducation()
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

document.querySelector('#btnNavSummary').addEventListener('click', () => {
    showSection('summary')
    loadSummary()
})

document.querySelector('#btnNavResume').addEventListener('click', () => {
    showSection('resume')
    loadResumeBuilderData()
})

document.querySelector('#btnNavCoverLetter').addEventListener('click', () => {
    showSection('coverLetter')
    loadCoverLetterData() 
})

document.querySelector('#btnNavThankYou').addEventListener('click', () => {
    showSection('thankYou')
})

document.querySelector('#btnAboutDev').addEventListener('click', () => {
    showSection('aboutDev')
})

// ===================================================
// Profile
// ===================================================

let strCurrentProfileID = ''
let strCurrentJobTitle = ''
let strCurrentJobCompany = ''

const objResumeDataCache = {
    objProfile: null,
    objSummary: null,
    arrJobs: [],
    arrEducation: [],
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

// ===================================================
// Jobs (Steve Jobs)
// ===================================================

const loadJobs = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/jobs`)
    const objData = await objResponse.json()
    // Same thing here, old code could crash, AI recommended this since it handles missing data gracefullt
    // const arrJobs = objData.jobs

    const arrJobs = objData.data && objData.data.jobs ? objData.data.jobs : []

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
    const arrDetails = objData.data && objData.data.details ? objData.data.details : []
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
// Education
// ===================================================

const loadEducation = async () => {
    document.querySelector('#divEducationEditView').style.display = 'none'
    document.querySelector('#divEducation').style.display = 'block'
    const objResponse = await fetch(`${strBaseURL}/api/education`)
    const objData = await objResponse.json()
    const arrEducation = objData.data && objData.data.education ? objData.data.education : []

    const divEducation = document.querySelector('#divEducation')
    divEducation.innerHTML = ''

    arrEducation.forEach(function(objEducation){
        // Heavily AI with this specific part
        divEducation.innerHTML += `
            <div class="card p-3 mb-2 btnSelectEducation" style="cursor:pointer;" data-id="${objEducation.EducationID}" data-institution="${objEducation.Institution}" data-degree="${objEducation.Degree}" data-fieldofstudy="${objEducation.FieldOfStudy || ''}" data-startdate="${objEducation.StartDate}" data-enddate="${objEducation.EndDate || ''}" data-gpa="${objEducation.GPA || ''}">
                <strong>${objEducation.Institution}</strong>
                <br>
                ${objEducation.Degree}${objEducation.FieldOfStudy ? ' — ' + objEducation.FieldOfStudy : ''}
                <br>
                <small>${formatResumeDateRange(objEducation.StartDate, objEducation.EndDate)}</small>
                ${objEducation.GPA ? '<br><small>GPA: ' + objEducation.GPA + '</small>' : ''}<br>
                <button class="btn btn-danger btn-sm mt-2 btnDeleteEducation" data-id="${objEducation.EducationID}">Delete</button>
            </div>
        `
    })
}

let strCurrentEducationID = ''

document.querySelector('#chkEduPresent').addEventListener('change', function(){
    const blnIsPresent = document.querySelector('#chkEduPresent').checked
    document.querySelector('#txtEduEndDate').disabled = blnIsPresent

    if (blnIsPresent) {
        document.querySelector('#txtEduEndDate').value = ''
    }
})

document.querySelector('#divEducation').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteEducation')){
        const strEducationID = objEvent.target.dataset.id

        const objResponse = await fetch(`${strBaseURL}/api/education/${strEducationID}`, {
            method: 'DELETE'
        })
        const objData = await objResponse.json()

        if (objResponse.status !== 200){
            alert(objData.message)
            return
        }

        loadEducation()
        return
    }

    const divEducation = objEvent.target.closest('.btnSelectEducation')
    if (divEducation) {
        strCurrentEducationID = divEducation.dataset.id
        document.querySelector('#txtSelectedEducation').innerText = `${divEducation.dataset.institution} — ${divEducation.dataset.degree}`
        document.querySelector('#txtEditInstitution').value = divEducation.dataset.institution || ''
        document.querySelector('#txtEditDegree').value = divEducation.dataset.degree || ''
        document.querySelector('#txtEditFieldOfStudy').value = divEducation.dataset.fieldofstudy || ''
        document.querySelector('#txtEditEduStartDate').value = divEducation.dataset.startdate || ''
        document.querySelector('#txtEditEduEndDate').value = divEducation.dataset.enddate || ''
        document.querySelector('#chkEditEduPresent').checked = !divEducation.dataset.enddate
        document.querySelector('#txtEditEduEndDate').disabled = !divEducation.dataset.enddate
        document.querySelector('#txtEditGPA').value = divEducation.dataset.gpa || ''

        document.querySelector('#divEducation').style.display = 'none'
        document.querySelector('#divEducationEditView').style.display = 'block'
    }
})

document.querySelector('#chkEditEduPresent').addEventListener('change', function(){
    const blnIsPresent = document.querySelector('#chkEditEduPresent').checked
    document.querySelector('#txtEditEduEndDate').disabled = blnIsPresent

    if (blnIsPresent) {
        document.querySelector('#txtEditEduEndDate').value = ''
    }
})

document.querySelector('#btnBackToEducation').addEventListener('click', function() {
    document.querySelector('#divEducationEditView').style.display = 'none'
    document.querySelector('#divEducation').style.display = 'block'
    loadEducation()
})

document.querySelector('#btnUpdateEducation').addEventListener('click', async function() {
    const strInstitution = document.querySelector('#txtEditInstitution').value.trim()
    const strDegree = document.querySelector('#txtEditDegree').value.trim()
    const strFieldOfStudy = document.querySelector('#txtEditFieldOfStudy').value.trim()
    const strStartDate = document.querySelector('#txtEditEduStartDate').value
    let strEndDate = document.querySelector('#txtEditEduEndDate').value
    const blnIsPresent = document.querySelector('#chkEditEduPresent').checked
    const strGPA = document.querySelector('#txtEditGPA').value.trim()

    if (blnIsPresent){
        strEndDate = ''
    }

    let blnError = false
    let strMessage = ''

    if (!strInstitution){
        blnError = true
        strMessage += '<p>Institution is required</p>'
    }
    if (!strDegree){
        blnError = true
        strMessage += '<p>Degree is required</p>'
    }
    if (!strStartDate){
        blnError = true
        strMessage += '<p>Start date is required</p>'
    }
    if (!strEndDate && !blnIsPresent){
        blnError = true
        strMessage += '<p>End date is required</p>'
    }

    if (blnError){
        alert(strMessage)
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/education/${strCurrentEducationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            institution: strInstitution,
            degree: strDegree,
            fieldOfStudy: strFieldOfStudy,
            startDate: strStartDate,
            endDate: strEndDate,
            isPresent: blnIsPresent,
            gpa: strGPA
        })
    })

    const objData = await objResponse.json()
    if (objResponse.status !== 200){
        alert(objData.message)
        return
    }

    document.querySelector('#divEducationEditView').style.display = 'none'
    document.querySelector('#divEducation').style.display = 'block'
    loadEducation()
})

document.querySelector('#btnAddEducation').addEventListener('click', async function() {
    const strInstitution = document.querySelector('#txtInstitution').value.trim()
    const strDegree = document.querySelector('#txtDegree').value.trim()
    const strFieldOfStudy = document.querySelector('#txtFieldOfStudy').value.trim()
    const strStartDate = document.querySelector('#txtEduStartDate').value
    let strEndDate = document.querySelector('#txtEduEndDate').value
    const blnIsPresent = document.querySelector('#chkEduPresent').checked
    const strGPA = document.querySelector('#txtGPA').value.trim()

    if (blnIsPresent){
        strEndDate = ''
    }

    let blnError = false
    let strMessage = ''

    if (!strInstitution){
        blnError = true
        strMessage += '<p>Institution is required</p>'
    }
    if (!strDegree){
        blnError = true
        strMessage += '<p>Degree is required</p>'
    }
    if (!strStartDate){
        blnError = true
        strMessage += '<p>Start date is required</p>'
    }
    if (!strEndDate && !blnIsPresent){
        blnError = true
        strMessage += '<p>End date is required</p>'
    }

    if (blnError){
        alert(strMessage)
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            institution: strInstitution,
            degree: strDegree,
            fieldOfStudy: strFieldOfStudy,
            startDate: strStartDate,
            endDate: strEndDate,
            isPresent: blnIsPresent,
            gpa: strGPA
        })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 201){
        alert(objData.message)
        return
    }

    document.querySelector('#txtInstitution').value = ''
    document.querySelector('#txtDegree').value = ''
    document.querySelector('#txtFieldOfStudy').value = ''
    document.querySelector('#txtEduStartDate').value = ''
    document.querySelector('#txtEduEndDate').value = ''
    document.querySelector('#chkEduPresent').checked = false
    document.querySelector('#txtEduEndDate').disabled = false
    document.querySelector('#txtGPA').value = ''

    loadEducation()
})



// ===================================================
// Skills
// ===================================================

// init
let strCurrentCategoryID = ''


const loadCategories = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/skillcategories`)
    const objData = await objResponse.json()
    const arrCategories = objData.data && objData.data.categories ? objData.data.categories : []

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
    const arrSkills = objData.data && objData.data.skills ? objData.data.skills : []

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
    const arrCerts = objData.data && objData.data.certifications ? objData.data.certifications : []

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
    const arrAwards = objData.data && objData.data.awards ? objData.data.awards : []

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


// ===================================================
// Summary
// ===================================================

// Disclosure, I was aided in this creation with AI
let strCurrentSummaryID = ''

const loadSummary = async () => {
    const objResponse = await fetch(`${strBaseURL}/api/summary`)

    if (objResponse.status === 404) {
        document.querySelector('#txtSummaryContent').value = ''
        document.querySelector('#pSummaryStatus').innerText = 'No summary saved yet.'
        strCurrentSummaryID = ''
        return
    }

    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        alert(objData.message)
        return
    }

    const objSummary = objData.data && objData.data.summary ? objData.data.summary : null
    if (!objSummary) {
        alert('Summary data is missing from server response.')
        return
    }

    strCurrentSummaryID = objSummary.SummaryID
    document.querySelector('#txtSummaryContent').value = objSummary.Content || ''
    document.querySelector('#pSummaryStatus').innerText = 'Summary loaded.'
}

document.querySelector('#btnSaveSummary').addEventListener('click', async () => {
    const strContent = document.querySelector('#txtSummaryContent').value.trim()

    if (!strContent) {
        alert('Summary content is required.')
        return
    }

    let strURL = `${strBaseURL}/api/summary`
    let strMethod = 'POST'

    if (strCurrentSummaryID) {
        strMethod = 'PUT'
    }

    const objResponse = await fetch(strURL, {
        method: strMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: strContent })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 200 && objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    const objSavedSummary = objData.data && objData.data.summary ? objData.data.summary : null
    if (objSavedSummary && objSavedSummary.SummaryID) {
        strCurrentSummaryID = objSavedSummary.SummaryID
    }

    document.querySelector('#pSummaryStatus').innerText = 'Summary saved successfully.'
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
            objResumeDataCache.objProfile = objProfileData.data && objProfileData.data.profile ? objProfileData.data.profile : null
        } else {
            objResumeDataCache.objProfile = null
        }

        const objSummaryResponse = await fetch(`${strBaseURL}/api/summary`)
        if (objSummaryResponse.status === 200) {
            const objSummaryData = await objSummaryResponse.json()
            objResumeDataCache.objSummary = objSummaryData.data && objSummaryData.data.summary ? objSummaryData.data.summary : null
        } else {
            objResumeDataCache.objSummary = null
}

        const objJobsResponse = await fetch(`${strBaseURL}/api/jobs`)
        const objJobsData = await objJobsResponse.json()
        objResumeDataCache.arrJobs = objJobsData.data && objJobsData.data.jobs ? objJobsData.data.jobs : []

        const objCategoryResponse = await fetch(`${strBaseURL}/api/skillcategories`)
        const objCategoryData = await objCategoryResponse.json()
        objResumeDataCache.arrCategories = objCategoryData.data && objCategoryData.data.categories ? objCategoryData.data.categories : []

        const objSkillsResponse = await fetch(`${strBaseURL}/api/skills`)
        const objSkillsData = await objSkillsResponse.json()
        objResumeDataCache.arrSkills = objSkillsData.data && objSkillsData.data.skills ? objSkillsData.data.skills : []

        const objCertResponse = await fetch(`${strBaseURL}/api/certifications`)
        const objCertData = await objCertResponse.json()
        objResumeDataCache.arrCerts = objCertData.data && objCertData.data.certifications ? objCertData.data.certifications : []

        const objAwardResponse = await fetch(`${strBaseURL}/api/awards`)
        const objAwardData = await objAwardResponse.json()
        objResumeDataCache.arrAwards = objAwardData.data && objAwardData.data.awards ? objAwardData.data.awards : []

        objResumeDataCache.objDetailsByJobID = {}
        for (const objJob of objResumeDataCache.arrJobs) {
            const objDetailResponse = await fetch(`${strBaseURL}/api/jobs/${objJob.JobID}/details`)
            const objDetailData = await objDetailResponse.json()
            objResumeDataCache.objDetailsByJobID[objJob.JobID] = objDetailData.data && objDetailData.data.details ? objDetailData.data.details : []
        }

        const objEducationResponse = await fetch(`${strBaseURL}/api/education`)
        const objEducationData = await objEducationResponse.json()
        objResumeDataCache.arrEducation = objEducationData.data && objEducationData.data.education ? objEducationData.data.education : []

        renderResumeSelectionUI()
        document.querySelector('#pResumeStatus').innerText = 'Resume data loaded. Select items and click Generate Resume.'
    } catch (objError) {
        console.error('Resume data load failed:', objError)
        document.querySelector('#pResumeStatus').innerText = 'Failed to load resume data.'
    }
}

const renderResumeSelectionUI = () => {
    renderResumeSummarySelection()
    renderResumeProfileSelection()
    renderResumeJobsSelection()
    renderResumeEducationSelection()
    renderResumeSkillsSelection()
    renderResumeCertSelection()
    renderResumeAwardSelection()
}

const renderResumeSummarySelection = () => {
    const divResumeSummary = document.querySelector('#divResumeSummary')
    const objSummary = objResumeDataCache.objSummary

    if (!objSummary || !objSummary.Content) {
        divResumeSummary.innerHTML = '<p class="text-muted mb-0">No summary saved yet.</p>'
        return
    }

    divResumeSummary.innerHTML = `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="chkResumeSummary" checked aria-label="Include professional summary">
            <label class="form-check-label" for="chkResumeSummary">
                ${objSummary.Content.substring(0, 80)}${objSummary.Content.length > 80 ? '...' : ''}
            </label>
        </div>
    `
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

const renderResumeEducationSelection = () => {
    const divResumeEducation = document.querySelector('#divResumeEducation')
    const arrEducation = objResumeDataCache.arrEducation

    if (!arrEducation.length) {
        divResumeEducation.innerHTML = '<p class="text-muted mb-0">No education found.</p>'
        return
    }

    divResumeEducation.innerHTML = arrEducation.map((objEducation) => `
        <div class="form-check">
            <input class="form-check-input chkResumeEducation" type="checkbox" id="chkEdu${objEducation.EducationID}" data-edu-id="${objEducation.EducationID}" checked aria-label="Select ${objEducation.Institution}">
            <label class="form-check-label" for="chkEdu${objEducation.EducationID}">
                ${objEducation.Degree}${objEducation.FieldOfStudy ? ' — ' + objEducation.FieldOfStudy : ''} at ${objEducation.Institution}
            </label>
        </div>
    `).join('')
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
    const arrSelectedEduIDs = Array.from(document.querySelectorAll('.chkResumeEducation:checked')).map((objElement) => objElement.dataset.eduId)
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

    // Summary
    const blnIncludeSummary = document.querySelector('#chkResumeSummary') && document.querySelector('#chkResumeSummary').checked
    if (blnIncludeSummary && objResumeDataCache.objSummary && objResumeDataCache.objSummary.Content) {
        strHTML += `
            <section class="resume-preview-section">
                <h3>Professional Summary</h3>
                <p>${objResumeDataCache.objSummary.Content}</p>
            </section>
        `
    }

    //Education
    const arrSelectedEducation = objResumeDataCache.arrEducation.filter((objEdu) => arrSelectedEduIDs.includes(objEdu.EducationID))
    if (arrSelectedEducation.length) {
        strHTML += '<section class="resume-preview-section"><h3>Education</h3>'
        arrSelectedEducation.forEach((objEdu) => {
            strHTML += `
                <div class="mb-2">
                    <div class="resume-job-header">
                        <strong>${objEdu.Institution}</strong>
                        <small>${formatResumeDateRange(objEdu.StartDate, objEdu.EndDate)}</small>
                    </div>
                    <div>${objEdu.Degree}${objEdu.FieldOfStudy ? ' — ' + objEdu.FieldOfStudy : ''}${objEdu.GPA ? ' | GPA: ' + objEdu.GPA : ''}</div>
                </div>
            `
        })
        strHTML += '</section>'
    }

    // Exp
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



    //Skills
    strHTML += '<section class="resume-preview-section"><h3>Skills</h3>'
    objResumeDataCache.arrCategories.forEach((objCategory) => {
        const arrCategorySkills = arrSelectedSkills.filter((objSkill) => objSkill.CategoryID === objCategory.CategoryID)
        if (!arrCategorySkills.length) return
        const strSkillNames = arrCategorySkills.map((objSkill) => objSkill.Name).join(', ')
        strHTML += `<p><span class="fw-bold">${objCategory.Name}:</span> ${strSkillNames}</p>`
    })
    strHTML += '</section>'



    //Certs
    strHTML += '<section class="resume-preview-section"><h3>Certifications</h3><ul>'
    arrSelectedCerts.forEach((objCert) => {
        strHTML += `<li><span class="fw-bold">${objCert.Name}</span> — ${objCert.Issuer} (${formatResumeMonthYear(objCert.DateEarned, false)})</li>`    })
    strHTML += '</ul></section>'


    
    //Awards
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

// ========================================================
// Cover letter
// ========================================================

// This will essentially be a copy paste of whats done for resume
const objCoverLetterDataCache = {
    objProfile: null,
    arrJobs: [],
    arrCategories: [],
    arrSkills: [],
    arrCerts: [],
    arrAwards: [],
    objDetailsByJobID: {}
}

// Loads all data needed to populate cover letter selection UI
const loadCoverLetterData = async () => {
    document.querySelector('#pCLStatus').innerText = 'Loading data...'

    try {
        const objProfileResponse = await fetch(`${strBaseURL}/api/profile`)
        if (objProfileResponse.status === 200) {
            const objProfileData = await objProfileResponse.json()
            objCoverLetterDataCache.objProfile = objProfileData.data && objProfileData.data.profile ? objProfileData.data.profile : null
        } else {
            objCoverLetterDataCache.objProfile = null
        }

        const objJobsResponse = await fetch(`${strBaseURL}/api/jobs`)
        const objJobsData = await objJobsResponse.json()
        objCoverLetterDataCache.arrJobs = objJobsData.data && objJobsData.data.jobs ? objJobsData.data.jobs : []

        const objCategoryResponse = await fetch(`${strBaseURL}/api/skillcategories`)
        const objCategoryData = await objCategoryResponse.json()
        objCoverLetterDataCache.arrCategories = objCategoryData.data && objCategoryData.data.categories ? objCategoryData.data.categories : []

        const objSkillsResponse = await fetch(`${strBaseURL}/api/skills`)
        const objSkillsData = await objSkillsResponse.json()
        objCoverLetterDataCache.arrSkills = objSkillsData.data && objSkillsData.data.skills ? objSkillsData.data.skills : []

        const objCertResponse = await fetch(`${strBaseURL}/api/certifications`)
        const objCertData = await objCertResponse.json()
        objCoverLetterDataCache.arrCerts = objCertData.data && objCertData.data.certifications ? objCertData.data.certifications : []

        const objAwardResponse = await fetch(`${strBaseURL}/api/awards`)
        const objAwardData = await objAwardResponse.json()
        objCoverLetterDataCache.arrAwards = objAwardData.data && objAwardData.data.awards ? objAwardData.data.awards : []

        objCoverLetterDataCache.objDetailsByJobID = {}
        for (const objJob of objCoverLetterDataCache.arrJobs) {
            const objDetailResponse = await fetch(`${strBaseURL}/api/jobs/${objJob.JobID}/details`)
            const objDetailData = await objDetailResponse.json()
            objCoverLetterDataCache.objDetailsByJobID[objJob.JobID] = objDetailData.data && objDetailData.data.details ? objDetailData.data.details : []
        }

        renderCoverLetterSelectionUI()
        document.querySelector('#pCLStatus').innerText = 'Ready. Fill in the fields and click Generate.'
    } catch (objError) {
        console.error('Cover letter data load failed:', objError)
        document.querySelector('#pCLStatus').innerText = 'Failed to load data.'
    }
}

const renderCoverLetterSelectionUI = () => {
    renderCLJobsSelection()
    renderCLSkillsSelection()
    renderCLCertSelection()
    renderCLAwardSelection()
}

const renderCLJobsSelection = () => {
    const divCLJobs = document.querySelector('#divCLJobs')
    const arrJobs = objCoverLetterDataCache.arrJobs

    if (!arrJobs.length) {
        divCLJobs.innerHTML = '<p class="text-muted mb-0">No jobs found.</p>'
        return
    }

    let strHTML = ''
    arrJobs.forEach((objJob) => {
        strHTML += `
            <div class="form-check">
                <input class="form-check-input chkCLJob" type="checkbox" id="chkCLJob${objJob.JobID}" data-job-id="${objJob.JobID}" checked aria-label="Include job ${objJob.Title}">
                <label class="form-check-label" for="chkCLJob${objJob.JobID}">
                    ${objJob.Title} — ${objJob.Company} (${formatResumeDateRange(objJob.StartDate, objJob.EndDate)})
                </label>
            </div>
        `
    })

    divCLJobs.innerHTML = strHTML
}

const renderCLSkillsSelection = () => {
    const divCLSkills = document.querySelector('#divCLSkills')
    const arrCategories = objCoverLetterDataCache.arrCategories
    const arrSkills = objCoverLetterDataCache.arrSkills

    if (!arrSkills.length) {
        divCLSkills.innerHTML = '<p class="text-muted mb-0">No skills found.</p>'
        return
    }

    let strHTML = ''
    arrCategories.forEach((objCategory) => {
        const arrCategorySkills = arrSkills.filter((objSkill) => objSkill.CategoryID === objCategory.CategoryID)
        if (!arrCategorySkills.length) return

        strHTML += `<h6 class="mt-2">${objCategory.Name}</h6>`
        strHTML += arrCategorySkills.map((objSkill) => `
            <div class="form-check">
                <input class="form-check-input chkCLSkill" type="checkbox" id="chkCLSkill${objSkill.SkillID}" data-skill-id="${objSkill.SkillID}" checked aria-label="Include skill ${objSkill.Name}">
                <label class="form-check-label" for="chkCLSkill${objSkill.SkillID}">${objSkill.Name}</label>
            </div>
        `).join('')
    })

    divCLSkills.innerHTML = strHTML
}

const renderCLCertSelection = () => {
    const divCLCerts = document.querySelector('#divCLCerts')
    const arrCerts = objCoverLetterDataCache.arrCerts

    if (!arrCerts.length) {
        divCLCerts.innerHTML = '<p class="text-muted mb-0">No certifications found.</p>'
        return
    }

    divCLCerts.innerHTML = arrCerts.map((objCert) => `
        <div class="form-check">
            <input class="form-check-input chkCLCert" type="checkbox" id="chkCLCert${objCert.CertID}" data-cert-id="${objCert.CertID}" checked aria-label="Include certification ${objCert.Name}">
            <label class="form-check-label" for="chkCLCert${objCert.CertID}">
                ${objCert.Name} — ${objCert.Issuer}
            </label>
        </div>
    `).join('')
}

const renderCLAwardSelection = () => {
    const divCLAwards = document.querySelector('#divCLAwards')
    const arrAwards = objCoverLetterDataCache.arrAwards

    if (!arrAwards.length) {
        divCLAwards.innerHTML = '<p class="text-muted mb-0">No awards found.</p>'
        return
    }

    divCLAwards.innerHTML = arrAwards.map((objAward) => `
        <div class="form-check">
            <input class="form-check-input chkCLAward" type="checkbox" id="chkCLAward${objAward.AwardID}" data-award-id="${objAward.AwardID}" checked aria-label="Include award ${objAward.Name}">
            <label class="form-check-label" for="chkCLAward${objAward.AwardID}">
                ${objAward.Name}${objAward.Issuer ? ' — ' + objAward.Issuer : ''}
            </label>
        </div>
    `).join('')
}

// AI assisted: builds a structured context string from user selections and form inputs,
// then sends it to the backend cover letter route which calls Gemini.
const generateCoverLetter = async () => {
    const strCompany = document.querySelector('#txtCLCompany').value.trim()
    const strRole = document.querySelector('#txtCLRole').value.trim()
    const strJobDescription = document.querySelector('#txtCLJobDescription').value.trim()
    const strTone = document.querySelector('#selCLTone').value
    const intLength = parseInt(document.querySelector('#txtCLLength').value) || 250
    const intParagraphs = parseInt(document.querySelector('#txtCLParagraphs').value) || 3
    const blnIncludeAchievements = document.querySelector('#chkCLIncludeAchievements').checked
    const strCompanyContext = document.querySelector('#txtCLCompanyContext').value.trim()
    const strGeminiApiKey = localStorage.getItem(strGeminiKeyStorageName) || ''

    let blnError = false
    let strMessage = ''

    if (!strCompany) {
        blnError = true
        strMessage += '<p>Company name is required</p>'
    }
    if (!strRole) {
        blnError = true
        strMessage += '<p>Role/job title is required</p>'
    }
    if (!strJobDescription) {
        blnError = true
        strMessage += '<p>Job description is required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    // Collect selected jobs with their deets
    const arrSelectedJobIDs = Array.from(document.querySelectorAll('.chkCLJob:checked')).map((objEl) => objEl.dataset.jobId)
    const arrSelectedSkillIDs = Array.from(document.querySelectorAll('.chkCLSkill:checked')).map((objEl) => objEl.dataset.skillId)
    const arrSelectedCertIDs = Array.from(document.querySelectorAll('.chkCLCert:checked')).map((objEl) => objEl.dataset.certId)
    const arrSelectedAwardIDs = Array.from(document.querySelectorAll('.chkCLAward:checked')).map((objEl) => objEl.dataset.awardId)

    const arrSelectedJobs = objCoverLetterDataCache.arrJobs
        .filter((objJob) => arrSelectedJobIDs.includes(objJob.JobID))
        .map((objJob) => ({
            title: objJob.Title,
            company: objJob.Company,
            dates: formatResumeDateRange(objJob.StartDate, objJob.EndDate),
            bullets: (objCoverLetterDataCache.objDetailsByJobID[objJob.JobID] || []).map((objD) => objD.Detail)
        }))

    const arrSelectedSkills = objCoverLetterDataCache.arrSkills
        .filter((objSkill) => arrSelectedSkillIDs.includes(objSkill.SkillID))
        .map((objSkill) => objSkill.Name)

    const arrSelectedCerts = objCoverLetterDataCache.arrCerts
        .filter((objCert) => arrSelectedCertIDs.includes(objCert.CertID))
        .map((objCert) => `${objCert.Name} (${objCert.Issuer})`)

    const arrSelectedAwards = objCoverLetterDataCache.arrAwards
        .filter((objAward) => arrSelectedAwardIDs.includes(objAward.AwardID))
        .map((objAward) => `${objAward.Name}${objAward.Issuer ? ' from ' + objAward.Issuer : ''}${objAward.Description ? ': ' + objAward.Description : ''}`)

    const objProfile = objCoverLetterDataCache.objProfile

    document.querySelector('#pCLStatus').innerText = 'Generating cover letter...'
    document.querySelector('#txtCoverLetterOutput').value = ''

    console.log('jobs going to server:', arrSelectedJobs)
    console.log('skills:', arrSelectedSkills)
    console.log('certs:', arrSelectedCerts)
    console.log('awards:', arrSelectedAwards)
    console.log('profile:', objProfile)

    const objResponse = await fetch(`${strBaseURL}/api/ai/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            geminiApiKey: strGeminiApiKey,
            company: strCompany,
            role: strRole,
            jobDescription: strJobDescription,
            tone: strTone,
            targetLength: intLength,
            paragraphCount: intParagraphs,
            includeAchievements: blnIncludeAchievements,
            companyContext: strCompanyContext,
            profile: objProfile,
            jobs: arrSelectedJobs,
            skills: arrSelectedSkills,
            certifications: arrSelectedCerts,
            awards: arrSelectedAwards
        })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        document.querySelector('#pCLStatus').innerText = ''
        alert(objData.message || 'Cover letter generation failed.')
        return
    }

    document.querySelector('#txtCoverLetterOutput').value = objData.data.coverLetter
    document.querySelector('#pCLStatus').innerText = 'Cover letter generated. Review and edit as needed.'
}

document.querySelector('#btnGenerateCoverLetter').addEventListener('click', generateCoverLetter)

// AI assisted: simple thank-you generator, intentionally smaller than cover letter flow.
const generateThankYouLetter = async () => {
    const strJobTitle = document.querySelector('#txtTYJobTitle').value.trim()
    const strCompanyName = document.querySelector('#txtTYCompanyName').value.trim()
    const strTonePreference = document.querySelector('#selTYTone').value
    const strInterviewNotes = document.querySelector('#txtTYInterviewNotes').value.trim()
    const strGeminiApiKey = localStorage.getItem(strGeminiKeyStorageName) || ''

    let blnError = false
    let strMessage = ''

    if (!strJobTitle) {
        blnError = true
        strMessage += '<p>Job title is required</p>'
    }
    if (!strCompanyName) {
        blnError = true
        strMessage += '<p>Company name is required</p>'
    }
    if (!strTonePreference) {
        blnError = true
        strMessage += '<p>Tone preference is required</p>'
    }

    if (blnError) {
        alert(strMessage)
        return
    }

    document.querySelector('#pTYStatus').innerText = 'Generating thank-you letter...'
    document.querySelector('#txtThankYouOutput').value = ''

    const objResponse = await fetch(`${strBaseURL}/api/ai/thank-you-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            geminiApiKey: strGeminiApiKey,
            jobTitle: strJobTitle,
            companyName: strCompanyName,
            interviewNotes: strInterviewNotes,
            tonePreference: strTonePreference
        })
    })

    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        document.querySelector('#pTYStatus').innerText = ''
        alert(objData.message || 'Thank-you letter generation failed.')
        return
    }

    document.querySelector('#txtThankYouOutput').value = objData.data.thankYouLetter
    document.querySelector('#pTYStatus').innerText = 'Thank-you letter generated. Review and edit as needed.'
}

document.querySelector('#btnGenerateThankYou').addEventListener('click', generateThankYouLetter)