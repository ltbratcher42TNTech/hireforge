// routes.education.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')


// POST to create education
router.post('/', (req,res,next) => {
    const strEducationID = uuidv4()
    const strInstitution = safeTrim(req.body.institution)
    const strDegree = safeTrim(req.body.degree)
    const strFieldOfStudy = safeTrim(req.body.fieldOfStudy)
    const strStartDate = safeTrim(req.body.startDate)
    const strEndDate = safeTrim(req.body.endDate)
    const strGPA = safeTrim(req.body.gpa)
    const blnIsPresent = req.body.isPresent === true

    if (!strInstitution || !strDegree || !strStartDate){
        return sendError(res, 400, "Institution, degree, as well as start date are all required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `INSERT INTO tblEducation (EducationID, Institution, Degree, FieldOfStudy, StartDate, EndDate, GPA, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

    db.run(strQuery, [strEducationID, strInstitution, strDegree, strFieldOfStudy, strStartDate, blnIsPresent ? null : strEndDate, strGPA, intUserID], function(err){
        if(err){
            console.error("Error creating education: ", err.message)
            return sendError(res, 500, "Failed to create eduction entry", { code: "SERVER_ERROR", details: {} })
        }

        const objEducation = {
            EducationID: strEducationID,
            Institution: strInstitution,
            Degree: strDegree,
            FieldOfStudy: strFieldOfStudy,
            StartDate: strStartDate,
            EndDate: blnIsPresent ? null : strEndDate,
            GPA: strGPA

        }
        return sendSuccess(res, 201, "Education entry created successfully", { education: objEducation })
    })
})

// GET all entries into education
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblEducation WHERE UserID=? ORDER BY StartDate DESC`

    db.all(strQuery, [intUserID],(err,arrRows) => {
        if (err) {
            console.error("Error Fetching Education:", err.message)
            return sendError(res, 500, "Failed to GET all education entries", { code: "SERVER_ERROR", details: {} })
        }

        return sendSuccess(res, 200, "Education entries retrieved successfully", { education: arrRows })
    })
})

// PUT to update an education entry
router.put('/:id', (req,res,next) => {
    const strEducationID = req.params.id
    const strInstitution = safeTrim(req.body.institution)
    const strDegree = safeTrim(req.body.degree)
    const strFieldOfStudy = safeTrim(req.body.fieldOfStudy)
    const strStartDate = safeTrim(req.body.startDate)
    const strEndDate = safeTrim(req.body.endDate)
    const strGPA = safeTrim(req.body.gpa)
    const blnIsPresent = req.body.isPresent === true

    if (!strInstitution || !strDegree || !strStartDate){
        return sendError(res, 400, "Institution, degree, and start date are required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `UPDATE tblEducation SET Institution=?, Degree=?, FieldOfStudy=?, StartDate=?, EndDate=?, GPA=? WHERE EducationID=? AND UserID=?`

    db.run(strQuery, [strInstitution, strDegree, strFieldOfStudy, strStartDate, blnIsPresent ? null : strEndDate, strGPA, strEducationID, intUserID], function (err){
        if (err){
            console.error("Error updating education entry: ", err.message)
            return sendError(res, 500, "Failed to update education entry", { code: "SERVER_ERROR", details: {} })
        }

        if (this.changes === 0) {
            return sendError(res, 404, "Education entry not found", { code: "NOT_FOUND", details: {} })
        }

        const objEducation = {
            EducationID: strEducationID,
            Institution: strInstitution,
            Degree: strDegree,
            FieldOfStudy: strFieldOfStudy,
            StartDate: strStartDate,
            EndDate: blnIsPresent ? null : strEndDate,
            GPA: strGPA
        }
        return sendSuccess(res, 200, "Education entry updated successfully", { education: objEducation })
    })
})

// DELETE education entry
router.delete('/:id', (req,res,next) => {
    const strEducationID = req.params.id
    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblEducation WHERE EducationID=? AND UserID=?`

    db.run(strQuery, [strEducationID, intUserID], function (err){
        if (err){
            console.error("Error deleting education:", err.message)
            return sendError(res, 500, "Failed to delete education entry", { code: "SERVER_ERROR", details: {} })
        }

        if (this.changes === 0){
            return sendError(res, 404, "Education entry not found", { code: "NOT_FOUND", details: {} })
        }

        return sendSuccess(res, 200, `Education entry with ID ${strEducationID} deleted successfully`, {})
    })
})

module.exports = router