// routes/awards.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// POST new award
router.post('/', (req,res,next) => {
    const strAwardID = uuidv4()
    const strName = safeTrim(req.body.name)
    const strIssuer = safeTrim(req.body.issuer)
    const strDateEarned = safeTrim(req.body.dateEarned)
    const strDescription = safeTrim(req.body.description)

    if (!strName || !strDateEarned) {
        return sendError(res, 400, "Name and date earned are required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `INSERT INTO tblAwards (AwardID, Name, Issuer, DateEarned, Description, UserID) VALUES (?, ?, ?, ?, ?, ?)`
    
    db.run(strQuery, [strAwardID, strName, strIssuer, strDateEarned, strDescription, intUserID], (err) => {
        if (err) {
            console.error("Error creating award:", err.message)
            return sendError(res, 500, "Failed to create award", { code: "SERVER_ERROR", details: {} })
        }
        const objAward = { AwardID: strAwardID, Name: strName, Issuer: strIssuer, DateEarned: strDateEarned, Description: strDescription }
        return sendSuccess(res, 201, "Award created successfully", { award: objAward })
    })
})


// GET all awards
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblAwards WHERE UserID=? ORDER BY DateEarned DESC`

    db.all(strQuery, [intUserID], (err, arrRows) => {
        if (err) {
            console.error("Error fetching awards:", err.message)
            return sendError(res, 500, "Failed to get awards", { code: "SERVER_ERROR", details: {} })
        }
        return sendSuccess(res, 200, "Awards retrieved successfully", { awards: arrRows })
    })
})

// DELETE award
router.delete('/:id', (req,res,next) => {
    const strAwardID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblAwards WHERE AwardID=? AND UserID=?`

    db.run(strQuery, [strAwardID, intUserID], function (err) {
        if (err) {
            console.error("Error deleting award:", err.message)
            return sendError(res, 500, "Failed to delete award", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Award not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Award with ID ${strAwardID} deleted successfully`, {})
    })
})

module.exports = router