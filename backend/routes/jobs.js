// routes/jobs.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// ===================================================================
// JOB ROUTES BELOW
// ===================================================================

// POST job route
router.post('/', (req,res,next) => {
    let strJobID = uuidv4()
    let strTitle = safeTrim(req.body.title)
    let strCompany = safeTrim(req.body.company)
    let strStartDate = safeTrim(req.body.startDate)
    let strEndDate = safeTrim(req.body.endDate)
    let blnIsPresent = req.body.isPresent === true

    if (blnIsPresent){
        strEndDate = null
    }
    
    // Lets validate the data
    if(!strJobID || !strTitle || !strCompany || !strStartDate || (!strEndDate && !blnIsPresent)){
        return sendError(res, 400, "All fields are required", { code: "VALIDATION_ERROR", details: {} })
    }


    if (!isValidLength(strTitle, objFieldMaxLengths.strJobTitle) || !isValidLength(strCompany, objFieldMaxLengths.strCompany)) {
        return sendError(res, 400, "Job field length is invalid", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `INSERT INTO tblJobs (JobID, Title, Company, StartDate, EndDate, UserID) VALUES (?, ?, ?, ?, ?, ?)`

    db.run(strQuery, [strJobID, strTitle, strCompany, strStartDate, strEndDate, intUserID], function (err){
        if(err){
            console.error("Insert Error:", err.message)
            return sendError(res, 500, "Failed to create the job", { code: "SERVER_ERROR", details: {} })
        }

        const objJob = {
                JobID: strJobID,
                Title: strTitle,
                Company: strCompany,
                StartDate: strStartDate,
                EndDate: strEndDate
            }
        return sendSuccess(res, 201, "Job created successfully!", { job: objJob })
    })
})

// GET ALL of the jobs route
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblJobs WHERE UserID=? ORDER BY StartDate DESC`

    db.all(strQuery,[intUserID],function (err,arrRows) {

        if (err) {
            console.error("Error Fetching:", err.message)
            return sendError(res, 500, "Failed to GET all jobs", { code: "SERVER_ERROR", details: {} })
        }

        return sendSuccess(res, 200, "Jobs retrieved successfully", { jobs: arrRows })
    })
})

// PUT to update job using a URL param
router.put('/:id', (req,res,next) => {
    const strJobID = req.params.id
    let strTitle = safeTrim(req.body.title)
    let strCompany = safeTrim(req.body.company)
    let strStartDate = safeTrim(req.body.startDate)
    let strEndDate = safeTrim(req.body.endDate)

    if (!strTitle || !strCompany || !strStartDate || !strEndDate) {
        return sendError(res, 400, "All fields are required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `UPDATE tblJobs SET Title=?, Company=?, StartDate=?, EndDate=? WHERE JobID=? AND UserID=?`

    db.run(strQuery, [strTitle, strCompany, strStartDate, strEndDate, strJobID, intUserID], function (err) {
        if (err) {
            console.error("Error updating job:", err.message)
            return sendError(res, 500, "Failed to update job", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Job not found", { code: "NOT_FOUND", details: {} })

        return sendSuccess(res, 200, `Job with ID ${strJobID} updated successfully`, {})
    })
})

// DELETE job to, well, delete the job, pretty self explanatory
router.delete('/:id', (req,res,next) => {
    const strJobID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblJobs WHERE JobID=? AND UserID=?`


    db.run(strQuery, [strJobID, intUserID], function (err) {
        if (err) {
            console.error("Error deleting job:", err.message)
            return sendError(res, 500, "Failed to delete job", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Job not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Job with ID ${strJobID} deleted successfully`, {})
    })
})


// ===================================================================
// JOB DETAILS ROUTES BELOW
// ===================================================================

// POST new detail for a job
router.post('/:id/details', (req,res,next) => {
    const strDetailID = uuidv4()
    const strJobID = req.params.id
    const strDetail = safeTrim(req.body.detail)

    if (!strDetail) {
        return sendError(res, 400, "Detail text is required", { code: "VALIDATION_ERROR", details: {} })
    }
    
    if (!isValidLength(strDetail, objFieldMaxLengths.strDetail)) {
        return sendError(res, 400, "Detail text exceeds max length", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    // AI assisted query which apparently improves efficiency!
    const strQuery = `INSERT INTO tblJobDetails (DetailID, JobID, Detail, UserID) SELECT ?, JobID, ?, ? FROM tblJobs WHERE JobID=? AND UserID=?`

    db.run(strQuery, [strDetailID, strDetail, intUserID, strJobID, intUserID], function (err) {
        if (err) {
            console.error("Error creating detail:", err.message)
            return sendError(res, 500, "Failed to create detail", { code: "SERVER_ERROR", details: {} })
        }
        // Database brick-walled the request because user doesn't own this JobID. AKA Gaslight bad actors with a 404 so they don't know if the ID is real.
        if (this.changes === 0) return sendError(res, 404, "Job not found", { code: "NOT_FOUND", details: {} })
        const objDetail = { DetailID: strDetailID, JobID: strJobID, Detail: strDetail }
        return sendSuccess(res, 201, "Detail created successfully", { detail: objDetail })
    })
})


// GET all the details for a job
router.get('/:id/details', (req,res,next) => {
    const strJobID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblJobDetails WHERE JobID=? AND UserID=?`

    db.all(strQuery, [strJobID, intUserID], (err, arrRows) => {
        if (err) {
            console.error("Error fetching the job details:", err.message)
            return sendError(res, 500, "Failed to get the job details", { code: "SERVER_ERROR", details: {} })
        }
        return sendSuccess(res, 200, "Job details fetched", { details: arrRows })
    })
})

module.exports = router