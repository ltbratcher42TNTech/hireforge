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

