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

