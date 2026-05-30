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

        const objProjectsResponse = await fetch(`${strBaseURL}/api/projects`)
        const objProjectsData = await objProjectsResponse.json()
        objResumeDataCache.arrProjects = objProjectsData.data && objProjectsData.data.projects ? objProjectsData.data.projects : []

        objResumeDataCache.objDetailsByProjectID = {}
        for (const objProject of objResumeDataCache.arrProjects) {
            const objProjectDetailResponse = await fetch(`${strBaseURL}/api/projects/${objProject.ProjectID}/details`)
            const objProjectDetailData = await objProjectDetailResponse.json()
            objResumeDataCache.objDetailsByProjectID[objProject.ProjectID] = objProjectDetailData.data && objProjectDetailData.data.details ? objProjectDetailData.data.details : []
        }

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
    renderResumeProjectsSelection()
    renderResumeSkillsSelection()
    renderResumeCertSelection()
    renderResumeAwardSelection()
    renderResumeSectionOrderUI()
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

const renderResumeProjectsSelection = () => {
    const divProjects = document.querySelector('#divResumeProjects')
    const arrProjects = objResumeDataCache.arrProjects

    if (!arrProjects.length) {
        divProjects.innerHTML = '<p class="text-muted mb-0">No projects found.</p>'
        return
    }

    let strProjectsHTML = ''
    arrProjects.forEach((objProject) => {
        const arrDetails = objResumeDataCache.objDetailsByProjectID[objProject.ProjectID] || []
        strProjectsHTML += `
            <div class="border rounded p-2 mb-2">
                <div class="form-check mb-2">
                    <input class="form-check-input chkResumeProject" type="checkbox" id="chkProject${objProject.ProjectID}" data-project-id="${objProject.ProjectID}" checked aria-label="Select project ${objProject.Name}">
                    <label class="form-check-label fw-bold" for="chkProject${objProject.ProjectID}">
                        ${objProject.Name} — ${objProject.URL}
                    </label>
                </div>
                ${arrDetails.map((objDetail) => `
                    <div class="form-check ms-3">
                        <input class="form-check-input chkResumeProjectDetail" type="checkbox" id="chkProjectDetail${objDetail.DetailID}" data-project-id="${objProject.ProjectID}" data-detail-id="${objDetail.DetailID}" checked aria-label="Select project detail ${objDetail.Detail}">
                        <label class="form-check-label" for="chkProjectDetail${objDetail.DetailID}">
                            ${objDetail.Detail}
                        </label>
                    </div>
                `).join('')}
            </div>
        `
    })

    divProjects.innerHTML = strProjectsHTML
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

const getResumeSectionLabel = (strSectionKey) => {
    const objSectionLabels = {
        education: 'Education',
        experience: 'Experience',
        projects: 'Projects',
        skills: 'Skills',
        certifications: 'Certifications',
        awards: 'Awards'
    }

    return objSectionLabels[strSectionKey] || strSectionKey
}

// AI assisted: lets users reorder the major resume sections without changing the rest of the resume builder flow.
const renderResumeSectionOrderUI = () => {
    const divResumeSectionOrder = document.querySelector('#divResumeSectionOrder')

    divResumeSectionOrder.innerHTML = arrResumeSectionOrder.map((strSectionKey, intIndex) => `
        <div class="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
            <span>${getResumeSectionLabel(strSectionKey)}</span>
            <div class="d-flex gap-1">
                <button
                    class="btn btn-outline-secondary btn-sm btnMoveResumeSection"
                    data-direction="up"
                    data-index="${intIndex}"
                    ${intIndex === 0 ? 'disabled' : ''}
                    aria-label="Move ${getResumeSectionLabel(strSectionKey)} section up">
                    ↑
                </button>
                <button
                    class="btn btn-outline-secondary btn-sm btnMoveResumeSection"
                    data-direction="down"
                    data-index="${intIndex}"
                    ${intIndex === arrResumeSectionOrder.length - 1 ? 'disabled' : ''}
                    aria-label="Move ${getResumeSectionLabel(strSectionKey)} section down">
                    ↓
                </button>
            </div>
        </div>
    `).join('')
}

document.querySelector('#divResumeSectionOrder').addEventListener('click', (objEvent) => {
    const objButton = objEvent.target.closest('.btnMoveResumeSection')
    if (!objButton) return

    const intIndex = parseInt(objButton.dataset.index, 10)
    const strDirection = objButton.dataset.direction

    if (Number.isNaN(intIndex)) return

    if (strDirection === 'up' && intIndex > 0) {
        const strSwapValue = arrResumeSectionOrder[intIndex - 1]
        arrResumeSectionOrder[intIndex - 1] = arrResumeSectionOrder[intIndex]
        arrResumeSectionOrder[intIndex] = strSwapValue
    }

    if (strDirection === 'down' && intIndex < arrResumeSectionOrder.length - 1) {
        const strSwapValue = arrResumeSectionOrder[intIndex + 1]
        arrResumeSectionOrder[intIndex + 1] = arrResumeSectionOrder[intIndex]
        arrResumeSectionOrder[intIndex] = strSwapValue
    }

    renderResumeSectionOrderUI()
    generateResumePreview()
})

const generateResumePreview = () => {
    const objProfile = objResumeDataCache.objProfile
    const arrSelectedProfileFields = Array.from(document.querySelectorAll('.chkResumeProfileField:checked')).map((objElement) => objElement.dataset.field)
    const arrSelectedJobs = Array.from(document.querySelectorAll('.chkResumeJob:checked')).map((objElement) => objElement.dataset.jobId)
    const arrSelectedProjects = Array.from(document.querySelectorAll('.chkResumeProject:checked')).map((objElement) => objElement.dataset.projectId)
    const arrSelectedEduIDs = Array.from(document.querySelectorAll('.chkResumeEducation:checked')).map((objElement) => objElement.dataset.eduId)
    const arrSelectedDetailIDs = Array.from(document.querySelectorAll('.chkResumeDetail:checked')).map((objElement) => objElement.dataset.detailId)
    const arrSelectedProjectDetailIDs = Array.from(document.querySelectorAll('.chkResumeProjectDetail:checked')).map((objElement) => objElement.dataset.detailId)
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

    const objResumeSectionsByKey = {}

    //Education
    const arrSelectedEducation = objResumeDataCache.arrEducation.filter((objEdu) => arrSelectedEduIDs.includes(objEdu.EducationID))
    if (arrSelectedEducation.length) {
        let strSectionHTML = '<section class="resume-preview-section"><h3>Education</h3>'
        arrSelectedEducation.forEach((objEdu) => {
            strSectionHTML += `
                <div class="mb-2">
                    <div class="resume-job-header">
                        <strong>${objEdu.Institution}</strong>
                        <small>${formatResumeDateRange(objEdu.StartDate, objEdu.EndDate)}</small>
                    </div>
                    <div>${objEdu.Degree}${objEdu.FieldOfStudy ? ' — ' + objEdu.FieldOfStudy : ''}${objEdu.GPA ? ' | GPA: ' + objEdu.GPA : ''}</div>
                </div>
            `
        })
        strSectionHTML += '</section>'
        objResumeSectionsByKey.education = strSectionHTML
    }

    // Exp
    const arrJobs = objResumeDataCache.arrJobs.filter((objJob) => arrSelectedJobs.includes(objJob.JobID))
    if (arrJobs.length) {
        let strSectionHTML = '<section class="resume-preview-section"><h3>Experience</h3>'
        arrJobs.forEach((objJob) => {
            const arrDetails = (objResumeDataCache.objDetailsByJobID[objJob.JobID] || []).filter((objDetail) => arrSelectedDetailIDs.includes(objDetail.DetailID))
            strSectionHTML += `
                <div class="mb-2">
                    <div class="resume-job-header">
                        <strong>${objJob.Title} — ${objJob.Company}</strong>
                        <small>${formatResumeDateRange(objJob.StartDate, objJob.EndDate)}</small>
                    </div>
                    <ul>
            `
            arrDetails.forEach((objDetail) => {
                strSectionHTML += `<li class="resume-bullet-item">${objDetail.Detail}</li>`
            })
            strSectionHTML += '</ul></div>'
        })
        strSectionHTML += '</section>'
        objResumeSectionsByKey.experience = strSectionHTML
    }


    // Projects
     const arrProjects = objResumeDataCache.arrProjects.filter((objProject) => arrSelectedProjects.includes(objProject.ProjectID))
    if (arrProjects.length) {
        let strSectionHTML = '<section class="resume-preview-section"><h3>Projects</h3>'
        arrProjects.forEach((objProject) => {
            const arrDetails = (objResumeDataCache.objDetailsByProjectID[objProject.ProjectID] || []).filter((objDetail) => arrSelectedProjectDetailIDs.includes(objDetail.DetailID))
            strSectionHTML += `
                <div class="mb-2">
                    <div class="resume-job-header">
                        <strong>${objProject.Name}</strong>
                        <small>${objProject.URL}</small>
                    </div>
                    <ul>
            `
            arrDetails.forEach((objDetail) => {
                strSectionHTML += `<li class="resume-bullet-item">${objDetail.Detail}</li>`
            })
            strSectionHTML += '</ul></div>'
        })
        strSectionHTML += '</section>'
        objResumeSectionsByKey.projects = strSectionHTML
    }



    //Skills
    let strSkillsSectionHTML = ''
    objResumeDataCache.arrCategories.forEach((objCategory) => {
        const arrCategorySkills = arrSelectedSkills.filter((objSkill) => objSkill.CategoryID === objCategory.CategoryID)
        if (!arrCategorySkills.length) return
        const strSkillNames = arrCategorySkills.map((objSkill) => objSkill.Name).join(', ')
        strSkillsSectionHTML += `<p><span class="fw-bold">${objCategory.Name}:</span> ${strSkillNames}</p>`
    })

    if (strSkillsSectionHTML) {
        objResumeSectionsByKey.skills = `<section class="resume-preview-section"><h3>Skills</h3>${strSkillsSectionHTML}</section>`
    }


    //Certs
    if (arrSelectedCerts.length) {
        let strSectionHTML = '<section class="resume-preview-section"><h3>Certifications</h3><ul>'
        arrSelectedCerts.forEach((objCert) => {
            strSectionHTML += `<li><span class="fw-bold">${objCert.Name}</span> — ${objCert.Issuer} (${formatResumeMonthYear(objCert.DateEarned, false)})</li>`
        })
        strSectionHTML += '</ul></section>'
        objResumeSectionsByKey.certifications = strSectionHTML
    }


    
    //Awards
    if (arrSelectedAwards.length) {
        let strSectionHTML = '<section class="resume-preview-section"><h3>Awards</h3><ul>'
        arrSelectedAwards.forEach((objAward) => {
            strSectionHTML += `<li><span class="fw-bold">${objAward.Name}</span> — ${objAward.Issuer} (${formatResumeMonthYear(objAward.DateEarned, false)})${objAward.Description ? `: ${objAward.Description}` : ''}</li>`
        })
        strSectionHTML += '</ul></section>'
        objResumeSectionsByKey.awards = strSectionHTML
    }

    arrResumeSectionOrder.forEach((strSectionKey) => {
        if (objResumeSectionsByKey[strSectionKey]) {
            strHTML += objResumeSectionsByKey[strSectionKey]
        }
    })

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
