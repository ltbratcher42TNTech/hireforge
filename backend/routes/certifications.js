// routes/certifications.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// POST new certifications!
router.post('/', (req,res,next) => {
    const strCertID = uuidv4()
    const strName = safeTrim(req.body.name)
    const strIssuer = safeTrim(req.body.issuer)
    const strDateEarned = safeTrim(req.body.dateEarned)

    if (!strName || !strIssuer || !strDateEarned) {
        return sendError(res, 400, "Name, issuer, and date earned are required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `INSERT INTO tblCertifications (CertID, Name, Issuer, DateEarned, UserID) VALUES (?, ?, ?, ?, ?)`

    db.run(strQuery, [strCertID, strName, strIssuer, strDateEarned, intUserID], (err) => {
        if (err) {
            console.error("Error creating certification:", err.message)
            return sendError(res, 500, "Failed to get certifications", { code: "SERVER_ERROR", details: {} })
        }
        const objCert = { CertID: strCertID, Name: strName, Issuer: strIssuer, DateEarned: strDateEarned }
        return sendSuccess(res, 201, "Certification created successfully", { certification: objCert })
    })
})

// GET all da certifications
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblCertifications WHERE UserID=? ORDER BY DateEarned DESC`

    db.all(strQuery, [intUserID], (err, arrRows) => {
        if (err) {
            console.error("Error fetching certifications:", err.message)
            return sendError(res, 500, "Failed to get certifications", { code: "SERVER_ERROR" })
        }
        return sendSuccess(res, 200, "Certifications retreived successfully", { certifications: arrRows })
    })
})

// DELETE certification
router.delete('/:id', (req,res,next) => {
    const strCertID = req.params.id
    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblCertifications WHERE CertID=? AND UserID=?`

    db.run(strQuery, [strCertID, intUserID], function (err) {
        if (err) {
            console.error("Error deleting certification:", err.message)
            return sendError(res, 500, "Failed to delete certification", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Certification not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Certification with ID ${strCertID} deleted successfully`, {})
    })
})

module.exports = router