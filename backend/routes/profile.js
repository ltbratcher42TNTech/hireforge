// routes/profile.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// POST create profile
router.post('/', (req,res,next) => {
    const strProfileID = uuidv4()
    const strFullName = safeTrim(req.body.fullName)
    const strEmail = safeTrim(req.body.email)
    const strPhone = safeTrim(req.body.phone)
    const strLocation = safeTrim(req.body.location)
    const strLinkedIn = safeTrim(req.body.linkedIn)
    const strGitHub = safeTrim(req.body.gitHub)
    const strWebsite = safeTrim(req.body.website)

    if (!strFullName || !strEmail) {
            return sendError(res, 400, "Full name and email are required", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strCheckQuery = `SELECT ProfileID FROM tblProfile WHERE UserID=? LIMIT 1`

    db.get(strCheckQuery, [intUserID], (err, objRow) => {
        if (err){
            console.error("Error checking existing profile:", err.message)
            return sendError(res, 500, "Failed to check profile", { code: "SERVER_ERROR" })
        }

        if (objRow){
            return sendError(res, 409, "Profile already exists. Please edit profile instead.", { code: "CONFLICT", details: {} })        }

        const strInsertQuery = `INSERT INTO tblProfile (ProfileID, FullName, Email, Phone, Location, LinkedIn, GitHub, Website, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        
        db.run(strInsertQuery, [strProfileID, strFullName, strEmail, strPhone, strLocation, strLinkedIn, strGitHub, strWebsite, intUserID], (err) => {
            if (err){
                console.error("Error creating profile:", err.message)
                return sendError(res, 500, "Failed to create profile", { code: "SERVER_ERROR", details: {} })
            }

            const objProfile = {
                    ProfileID: strProfileID,
                    FullName: strFullName,
                    Email: strEmail,
                    Phone: strPhone,
                    Location: strLocation,
                    LinkedIn: strLinkedIn,
                    GitHub: strGitHub,
                    Website: strWebsite
                }
            return sendSuccess(res, 201, "Profile created successfully", { profile: objProfile })
        })
    })
})


// GET profile
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblProfile WHERE UserID=? LIMIT 1`

    db.get(strQuery, [intUserID], (err, objRow) => {
        if (err){
            console.error("Error getting profile:", err.message)
            return sendError(res, 500, "Failed to get profile", { code: "SERVER_ERROR", details: {} })
        }

        if (!objRow){
            return sendError(res, 404, "Profile not found", { code: "NOT_FOUND", details: {} })
        }

        return sendSuccess(res, 200, "Profile retrieved successfully", { profile: objRow })
    })
})

// PUT update profile
router.put('/:id', (req,res,next) => {
    const strProfileID = req.params.id
    const strFullName = safeTrim(req.body.fullName)
    const strEmail = safeTrim(req.body.email)
    const strPhone = safeTrim(req.body.phone)
    const strLocation = safeTrim(req.body.location)
    const strLinkedIn = safeTrim(req.body.linkedIn)
    const strGitHub = safeTrim(req.body.gitHub)
    const strWebsite = safeTrim(req.body.website)

    if (!strFullName || !strEmail) {
        return res.status(400).json({ message: "Full name and email are required" })
        return sendError(res, 400, "Full name and email are required", { code: "VALIDATION_ERROR", details: {} })
    }

    // adding the new length validation defined at the top, ensuring the length doesn't exceed new limits
    if (!isValidLength(strFullName, objFieldMaxLengths.strProfileName) || !isValidLength(strEmail, objFieldMaxLengths.strEmail)) {
        return sendError(res, 400, "Profile field length is invalid", { code: "VALIDATION_ERROR", details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `UPDATE tblProfile SET FullName=?, Email=?, Phone=?, Location=?, LinkedIn=?, GitHub=?, Website=? WHERE ProfileID=? AND UserID=?`

    db.run(strQuery, [strFullName, strEmail, strPhone, strLocation, strLinkedIn, strGitHub, strWebsite, strProfileID, intUserID], function (err) {
        if (err){
            console.error("Error updating profile:", err.message)
            return sendError(res, 500, "Failed to update profile", { code: "SERVER_ERROR", details: {} })
        }

        if (this.changes === 0) {
            return sendError(res, 404, "Profile not found", { code: "NOT_FOUND", details: {} })
        }

        const objProfile = {
                ProfileID: strProfileID,
                FullName: strFullName,
                Email: strEmail,
                Phone: strPhone,
                Location: strLocation,
                LinkedIn: strLinkedIn,
                GitHub: strGitHub,
                Website: strWebsite
            }
        return sendSuccess(res, 200, "Profile updated successfully", { profile: objProfile })
    })
})

module.exports = router