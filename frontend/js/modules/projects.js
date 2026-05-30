// ===================================================
// Projects
// ===================================================

let strCurrentProjectID = ''

// Loads the project list and resets to list view
const loadProjects = async () => {
    document.querySelector('#divProjectDetailsView').style.display = 'none'
    document.querySelector('#divProjectListView').style.display = 'block'

    const objResponse = await fetch(`${strBaseURL}/api/projects`)
    const objData = await objResponse.json()
    const arrProjects = objData.data && objData.data.projects ? objData.data.projects : []

    const divProjects = document.querySelector('#divProjects')
    divProjects.innerHTML = ''

    arrProjects.forEach(function(objProject) {
        divProjects.innerHTML += `
            <div class="card p-3 mb-2 btnSelectProject" style="cursor:pointer;" data-id="${objProject.ProjectID}" data-name="${objProject.Name}" data-url="${objProject.URL}">
                <strong>${objProject.Name}</strong>
                <br>
                <small>${objProject.URL}</small>
                <button class="btn btn-danger btn-sm mt-2 btnDeleteProject" data-id="${objProject.ProjectID}">Delete</button>
            </div>
        `
    })
}

// Loads bullets for one selected project
const loadProjectDetails = async (strProjectID) => {
    const objResponse = await fetch(`${strBaseURL}/api/projects/${strProjectID}/details`)
    const objData = await objResponse.json()
    const arrDetails = objData.data && objData.data.details ? objData.data.details : []

    const divProjectDetailList = document.querySelector('#divProjectDetailList')
    divProjectDetailList.innerHTML = ''

    arrDetails.forEach(function(objDetail) {
        divProjectDetailList.innerHTML += `
            <div class="card p-2 mb-1">
                - ${objDetail.Detail}
                <span class="text-danger btnDeleteProjectDetail" style="cursor:pointer; font-size:0.8rem;" data-id="${objDetail.DetailID}">remove</span>
            </div>
        `
    })
}

// Handles deleting projects and selecting a project card
document.querySelector('#divProjects').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteProject')) {
        const strProjectID = objEvent.target.dataset.id
        const objResponse = await fetch(`${strBaseURL}/api/projects/${strProjectID}`, { method: 'DELETE' })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadProjects()
        return
    }

    const divProject = objEvent.target.closest('.btnSelectProject')
    if (divProject) {
        strCurrentProjectID = divProject.dataset.id
        document.querySelector('#txtSelectedProject').innerText = divProject.dataset.name
        document.querySelector('#txtEditProjectName').value = divProject.dataset.name || ''
        document.querySelector('#txtEditProjectURL').value = divProject.dataset.url || ''
        document.querySelector('#divProjectListView').style.display = 'none'
        document.querySelector('#divProjectDetailsView').style.display = 'block'
        loadProjectDetails(strCurrentProjectID)
    }
})

// Handles deleting a single project bullet detail
document.querySelector('#divProjectDetailList').addEventListener('click', async function(objEvent) {
    if (objEvent.target.classList.contains('btnDeleteProjectDetail')) {
        const strDetailID = objEvent.target.dataset.id
        const objResponse = await fetch(`${strBaseURL}/api/projectdetails/${strDetailID}`, { method: 'DELETE' })
        const objData = await objResponse.json()

        if (objResponse.status !== 200) {
            alert(objData.message)
            return
        }

        loadProjectDetails(strCurrentProjectID)
    }
})

// Back button to return from project details to project list
document.querySelector('#btnBackToProjects').addEventListener('click', function() {
    document.querySelector('#divProjectDetailsView').style.display = 'none'
    document.querySelector('#divProjectListView').style.display = 'block'
    loadProjects()
})

// POST new project
document.querySelector('#btnAddProject').addEventListener('click', async function() {
    const strName = document.querySelector('#txtProjectName').value.trim()
    const strURL = document.querySelector('#txtProjectURL').value.trim()

    if (!strName || !strURL) {
        alert('Project name and URL are required')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName, url: strURL })
    })
    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtProjectName').value = ''
    document.querySelector('#txtProjectURL').value = ''
    loadProjects()
})

// Updates the selected project
document.querySelector('#btnUpdateProject').addEventListener('click', async function() {
    const strName = document.querySelector('#txtEditProjectName').value.trim()
    const strURL = document.querySelector('#txtEditProjectURL').value.trim()

    if (!strName || !strURL) {
        alert('Project name and URL are required')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/projects/${strCurrentProjectID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: strName, url: strURL })
    })
    const objData = await objResponse.json()

    if (objResponse.status !== 200) {
        alert(objData.message)
        return
    }

    loadProjects()
})

// Adds one new bullet/detail under selected project
document.querySelector('#btnAddProjectDetail').addEventListener('click', async function() {
    const strDetail = document.querySelector('#txtProjectDetail').value.trim()

    if (!strDetail) {
        alert('Please enter a detail')
        return
    }

    const objResponse = await fetch(`${strBaseURL}/api/projects/${strCurrentProjectID}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail: strDetail })
    })
    const objData = await objResponse.json()

    if (objResponse.status !== 201) {
        alert(objData.message)
        return
    }

    document.querySelector('#txtProjectDetail').value = ''
    loadProjectDetails(strCurrentProjectID)
})



