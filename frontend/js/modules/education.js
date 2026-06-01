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


