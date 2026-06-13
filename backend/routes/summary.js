// routes/summary.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')



//POST create the summary
router.post('/', (req,res,next) => {
    const strSummaryID = uuidv4()
    const strContent = safeTrim(req.body.content)

    if (!strContent){
        return sendError(res, 400, "Summary content is required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strCheckQuery = `SELECT SummaryID FROM tblSummary WHERE UserID=? LIMIT 1`

    db.get(strCheckQuery, [intUserID], (err,objRow) => {
        if (err){
            console.error("Error checking existing summary:", err.message)
            return sendError(res, 500, "Failed to check summary", { code: "SERVER_ERROR", details: {} })
        }

        if (objRow){
            return sendError(res, 409, "Summary already exists. Please edit instead.", { code: "CONFLICT", details: {} })
        }

        const strQuery = `INSERT INTO tblSummary (SummaryID, Content, UserID) VALUES (?, ?, ?)`

        db.run(strQuery, [strSummaryID, strContent, intUserID], (err) => {
            if (err){
                console.error("Error Creating The Summary: ", err.message) // correct
                return sendError(res, 500, "Failed the create summary", {code: "SERVER_ERROR", details: {} })
            } 

            return sendSuccess(res, 201, "Summary created successfully", { summary: { SummaryID: strSummaryID, Content: strContent } })
        })
    })
})



// GET for summary
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    //parameterizing the query
    const strQuery = `SELECT * FROM tblSummary WHERE UserID=? LIMIT 1`
    
    db.get(strQuery, [intUserID], (err,objRow) => {
        if (err){
            console.error("Error Getting Summary: ", err.message)
            return sendError(res, 500, "Failed to get summary", { code: "SERVER_ERROR", details: {} })
        }

        if(!objRow){
            return sendError(res, 404, "No summary found", { code: "NOT_FOUND", details: {} })
        }

        return sendSuccess(res, 200, "Summary retrieved successfully", { summary: objRow })
    })
})



//PUT Summary to edit
router.put('/', (req,res,next) => {
    const strContent = safeTrim(req.body.content)

    if (!strContent){
        return sendError(res, 400, "Summary content is required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `UPDATE tblSummary SET Content=? WHERE SummaryID=(SELECT SummaryID FROM tblSummary WHERE UserID=? LIMIT 1) AND UserID=?`

    db.run(strQuery, [strContent, intUserID, intUserID], function (err) {
        if (err){
            console.error("Error updating summary:", err.message)
            return sendError(res, 500, "Failed to update summary", { code: "SERVER_ERROR", details: {} })
        }

        if (this.changes === 0) {
            return sendError(res, 404, "Summary not found", { code: "NOT_FOUND", details: {} })
        }

        return sendSuccess(res, 200, "Summary updated successfully", { summary: { Content: strContent } })
    })
})

module.exports = router