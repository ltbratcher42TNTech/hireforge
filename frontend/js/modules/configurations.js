//const strBaseURL = 'http://localhost:8000'
const strBaseURL = ''


let strCurrentJobTitle = ''
let strCurrentJobCompany = ''

const objResumeDataCache = {
    objProfile: null,
    objSummary: null,
    arrJobs: [],
    arrEducation: [],
    arrProjects: [],
    arrCategories: [],
    arrSkills: [],
    arrCerts: [],
    arrAwards: [],
    objDetailsByJobID: {},
    objDetailsByProjectID: {}
}

const arrResumeSectionOrderDefault = ['education', 'experience', 'projects', 'skills', 'certifications', 'awards']
let arrResumeSectionOrder = [...arrResumeSectionOrderDefault]

const strGeminiKeyStorageName = 'strGeminiApiKey'