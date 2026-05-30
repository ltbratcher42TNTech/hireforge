// ========================================================
// Cover letter
// ========================================================

// This will essentially be a copy paste of whats done for resume
const objCoverLetterDataCache = {
    objProfile: null,
    arrEducation: [],
    arrJobs: [],
    arrProjects: [],
    arrCategories: [],
    arrSkills: [],
    arrCerts: [],
    arrAwards: [],
    objDetailsByJobID: {},
    objDetailsByProjectID: {}
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

        const objProjectsResponse = await fetch(`${strBaseURL}/api/projects`)
        const objProjectsData = await objProjectsResponse.json()
        objCoverLetterDataCache.arrProjects = objProjectsData.data && objProjectsData.data.projects ? objProjectsData.data.projects : []

        objCoverLetterDataCache.objDetailsByProjectID = {}
        for (const objProject of objCoverLetterDataCache.arrProjects) {
            const objProjectDetailResponse = await fetch(`${strBaseURL}/api/projects/${objProject.ProjectID}/details`)
            const objProjectDetailData = await objProjectDetailResponse.json()
            objCoverLetterDataCache.objDetailsByProjectID[objProject.ProjectID] = objProjectDetailData.data && objProjectDetailData.data.details ? objProjectDetailData.data.details : []
        }

        const objEducationResponse = await fetch(`${strBaseURL}/api/education`)
        const objEducationData = await objEducationResponse.json()
        objCoverLetterDataCache.arrEducation = objEducationData.data && objEducationData.data.education ? objEducationData.data.education : []


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
    renderCLEducationSelection()
    renderCLJobsSelection()
    renderCLProjectsSelection()
    renderCLSkillsSelection()
    renderCLCertSelection()
    renderCLAwardSelection()
}


const renderCLEducationSelection = () => {
    const divCLEducation = document.querySelector('#divCLEducation')
    const arrEducation = objCoverLetterDataCache.arrEducation

    if (!arrEducation.length) {
        divCLEducation.innerHTML = '<p class="text-muted mb-0">No education found.</p>'
        return
    }

    divCLEducation.innerHTML = arrEducation.map((objEducation) => `
        <div class="form-check">
            <input class="form-check-input chkCLEducation" type="checkbox" id="chkCLEdu${objEducation.EducationID}" data-edu-id="${objEducation.EducationID}" checked aria-label="Include education ${objEducation.Institution}">
            <label class="form-check-label" for="chkCLEdu${objEducation.EducationID}">
                ${objEducation.Degree}${objEducation.FieldOfStudy ? ' — ' + objEducation.FieldOfStudy : ''} at ${objEducation.Institution}
            </label>
        </div>
    `).join('')
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


const renderCLProjectsSelection = () => {
    const divCLProjects = document.querySelector('#divCLProjects')
    const arrProjects = objCoverLetterDataCache.arrProjects

    if (!arrProjects.length) {
        divCLProjects.innerHTML = '<p class="text-muted mb-0">No projects found.</p>'
        return
    }

    let strHTML = ''
    arrProjects.forEach((objProject) => {
        strHTML += `
            <div class="form-check">
                <input class="form-check-input chkCLProject" type="checkbox" id="chkCLProject${objProject.ProjectID}" data-project-id="${objProject.ProjectID}" checked aria-label="Include project ${objProject.Name}">
                <label class="form-check-label" for="chkCLProject${objProject.ProjectID}">
                    ${objProject.Name} — ${objProject.URL}
                </label>
            </div>
        `
    })

    divCLProjects.innerHTML = strHTML
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
    const arrSelectedEduIDs = Array.from(document.querySelectorAll('.chkCLEducation:checked')).map((objEl) => objEl.dataset.eduId)
    const arrSelectedProjectIDs = Array.from(document.querySelectorAll('.chkCLProject:checked')).map((objEl) => objEl.dataset.projectId)
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

    const arrSelectedEducation = objCoverLetterDataCache.arrEducation
        .filter((objEducation) => arrSelectedEduIDs.includes(objEducation.EducationID))
        .map((objEducation) => `${objEducation.Degree}${objEducation.FieldOfStudy ? ' — ' + objEducation.FieldOfStudy : ''} at ${objEducation.Institution}`)

    const arrSelectedProjects = objCoverLetterDataCache.arrProjects
        .filter((objProject) => arrSelectedProjectIDs.includes(objProject.ProjectID))
        .map((objProject) => ({
            name: objProject.Name,
            url: objProject.URL,
            bullets: (objCoverLetterDataCache.objDetailsByProjectID[objProject.ProjectID] || []).map((objD) => objD.Detail)
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
    console.log('education:', arrSelectedEducation)
    console.log('projects:', arrSelectedProjects)
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
            projects: arrSelectedProjects,
            education: arrSelectedEducation,
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