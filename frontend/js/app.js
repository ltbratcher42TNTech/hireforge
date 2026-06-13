// ===================================================
// Navigation of the site (basically open forms)
// ===================================================

const showSection = (strSectionName) => {
    document.getElementById('authSection').style.display = 'none'
    document.getElementById('dashboardSection').style.display = 'none'
    document.getElementById('profileSection').style.display = 'none'
    document.getElementById('jobsSection').style.display = 'none'
    document.getElementById('educationSection').style.display = 'none'
    document.getElementById('projectsSection').style.display = 'none'
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

document.querySelector('#btnNavProjects').addEventListener('click', () => {
    showSection('projects')
    loadProjects()
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

//auth button wiring and initial page protection.
document.querySelector('#btnLogin').addEventListener('click', loginUser)
document.querySelector('#btnRegister').addEventListener('click', registerUser)
document.querySelector('#btnGuestMode').addEventListener('click', startGuestMode)
document.querySelector('#btnLogout').addEventListener('click', logoutUser)

requireFrontendAuth()