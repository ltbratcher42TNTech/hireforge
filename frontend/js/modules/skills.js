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
