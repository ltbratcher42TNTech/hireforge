
const express = require('express')
const router = express.Router()

const db = require('../utils/db')
const { getCurrentUserID } = require('../utils/users')

// Helper to retrieve all matching rows
const getAll = (strQuery, arrParams) => {
    return new Promise((resolve, reject) => {
        db.all(strQuery, arrParams, (err, arrRows) => {
            if (err) {
                return reject(err)
            }

            resolve(arrRows)
        })
    })
}

// Helper to retrieve one matching row
const getOne = (strQuery, arrParams) => {
    return new Promise((resolve, reject) => {
        db.get(strQuery, arrParams, (err, objRow) => {
            if (err) {
                return reject(err)
            }

            resolve(objRow || null)
        })
    })
}

// GET /api/export
router.get('/', async (req, res) => {

    const intUserID = getCurrentUserID(req)

    try {
        // Profile and summary
        const objProfile = await getOne(
            'SELECT ProfileID, FullName, Email, Phone, Location, LinkedIn, GitHub, Website FROM tblProfile WHERE UserID = ?',
            [intUserID]
        )

        const objSummary = await getOne(
            'SELECT SummaryID, Content FROM tblSummary WHERE UserID = ?',
            [intUserID]
        )

        // Education
        const arrEducation = await getAll(
            'SELECT EducationID, Institution, Degree, FieldOfStudy, StartDate, EndDate, GPA FROM tblEducation WHERE UserID = ?',
            [intUserID]
        )

        // Jobs and job details
        const arrJobs = await getAll(
            'SELECT JobID, Title, Company, StartDate, EndDate FROM tblJobs WHERE UserID = ?',
            [intUserID]
        )

        const arrJobDetails = await getAll(
            'SELECT DetailID, JobID, Detail FROM tblJobDetails WHERE UserID = ?',
            [intUserID]
        )

        arrJobs.forEach((objJob) => {
            objJob.details = arrJobDetails.filter(
                (objDetail) => objDetail.JobID === objJob.JobID
            )
        })

        // Projects and project details
        const arrProjects = await getAll(
            'SELECT ProjectID, Name, URL FROM tblProjects WHERE UserID = ?',
            [intUserID]
        )

        const arrProjectDetails = await getAll(
            'SELECT DetailID, ProjectID, Detail FROM tblProjectDetails WHERE UserID = ?',
            [intUserID]
        )

        arrProjects.forEach((objProject) => {
            objProject.details = arrProjectDetails.filter(
                (objDetail) => objDetail.ProjectID === objProject.ProjectID
            )
        })

        // Skill categories and skills
        const arrSkillCategories = await getAll(
            'SELECT CategoryID, Name FROM tblSkillCategories WHERE UserID = ?',
            [intUserID]
        )

        const arrSkills = await getAll(
            'SELECT SkillID, CategoryID, Name FROM tblSkills WHERE UserID = ?',
            [intUserID]
        )

        arrSkillCategories.forEach((objCategory) => {
            objCategory.skills = arrSkills.filter(
                (objSkill) => objSkill.CategoryID === objCategory.CategoryID
            )
        })

        // Certifications and awards
        const arrCertifications = await getAll(
            'SELECT CertID, Name, Issuer, DateEarned FROM tblCertifications WHERE UserID = ?',
            [intUserID]
        )

        const arrAwards = await getAll(
            'SELECT AwardID, Name, Issuer, DateEarned, Description FROM tblAwards WHERE UserID = ?',
            [intUserID]
        )

        // Build export object
        const objExport = {
            exportVersion: 1,
            exportedAt: new Date().toISOString(),
            profile: objProfile,
            summary: objSummary,
            education: arrEducation,
            jobs: arrJobs,
            projects: arrProjects,
            skillCategories: arrSkillCategories,
            certifications: arrCertifications,
            awards: arrAwards
        }

        return res.status(200).json(objExport)

    } catch (err) {
        console.error('Data export error:', err.message)

        return res.status(500).json({
            error: 'Failed to export user data'
        })
    }
})

module.exports = router
