const strBaseURL = 'http://localhost:8000'

// ===================================================
// Navigation of the site (basically open forms)
// ===================================================

const showSection = (strSectionName) => {
    document.getElementById('dashboardSection').style.display = 'none'
    document.getElementById('jobsSection').style.display = 'none'
    document.getElementById('skillsSection').style.display = 'none'
    document.getElementById('resumeSection').style.display = 'none'
    document.getElementById(strSectionName + 'Section').style.display = 'block'
}

document.querySelector('#btnNavDashboard').addEventListener('click', () => {
    showSection('dashboard')
})

document.querySelector('#btnNavJobs').addEventListener('click', () => {
    showSection('jobs')
    loadJobs()
})

document.querySelector('#btnNavSkills').addEventListener('click', () => {
    showSection('skills')
})

document.querySelector('#btnNavResume').addEventListener('click', () => {
    showSection('resume')
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

