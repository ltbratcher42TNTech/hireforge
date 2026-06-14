//routes/auth.js
const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const { sendError, safeTrim, sendSuccess } = require('../utils/responses')
const { hashPassword, verifyPassword, createToken } = require('../utils/auth')
const { requireUser } = require('../utils/users')
const { seedGuestData } = require('../utils/seedGuest')

const buildAuthResponse = (objUser) => {
    return {
        token: createToken(objUser),
        user: {
            UserID: objUser.UserID,
            Username: objUser.Username,
            IsGuest: objUser.IsGuest ? 1 : 0
        }
    }
}

// POST to reguster a normal user
router.post('/register', (req,res,next) => {
    const strUsername = safeTrim(req.body.username)
    const strPassword = safeTrim(req.body.password)

    if (!strPassword || !strUsername){
        return sendError(res, 400, 'Username and password are required', { code: 'VALIDATION_ERROR', details: {} })
    }

    if (strUsername.length < 3 || strPassword.length < 8){
        return sendError(res, 400, 'Username must be at least 3 characters long and password must be at least 8 characters', { code: 'VALIDATION_ERROR', details: {} })
    }

    const strPasswordHash = hashPassword(strPassword)
    const strQuery = `INSERT INTO tblUsers (Username, PasswordHash, IsGuest) VALUES (?, ?, 0)`

    db.run(strQuery, [strUsername, strPasswordHash], function (err) {
        if(err){
            if (err.message.includes('UNIQUE')) {
                return sendError(res, 409, 'Username is already taken', { code: 'CONFLICT', details: {} })
            }
            console.error('Error registering user:', err.message)
            return sendError(res, 500, 'Failed to register user', { code: 'SERVER_ERROR', details: {} })
        }

        return sendSuccess(res, 201, 'Registration successful', buildAuthResponse({ UserID: this.lastID, Username: strUsername, IsGuest: 0 }))
    })
})

// POST to login a normal user
router.post('/login', (req,res,next) => {
    const strUsername = safeTrim(req.body.username)
    const strPassword = safeTrim(req.body.password)

    if (!strUsername || !strPassword){
        return sendError(res, 400, 'Username and password are required', { code: 'VALIDATION_ERROR', details: {} })
    }

    const strQuery = `SELECT UserID, Username, PasswordHash, IsGuest FROM tblUsers WHERE Username=? AND IsGuest=0 LIMIT 1`

    db.get(strQuery, [strUsername], (err,objUser) => {
        if (err){
            console.error('Error logging in:', err.message)
            return sendError(res, 500, 'Failed to log in', { code: 'SERVER_ERROR', details: {} })
        }

        if (!objUser || !verifyPassword(strPassword, objUser.PasswordHash)){
            return sendError(res, 401, 'Invalid username or password', { code: 'UNAUTHORIZED', details: {} })
        }

        return sendSuccess(res, 200, 'Login successful', buildAuthResponse(objUser))
    })
})

//POST to create a recruiter/demo guest user (mainly for recruiters and such to test without making account), AND seeds it with an AI generated seed
router.post('/guest', (req,res,next) => {
    const strUsername = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const strQuery = `INSERT INTO tblUsers (Username, PasswordHash, IsGuest) VALUES (?, '', 1)`
    db.run(strQuery, [strUsername], async function (err) {
        if (err){
            console.error("Error creating guest user:", err.message)
            return sendError(res, 500, 'Failed to start guest mode', { code: 'SERVER_ERROR', details: {} })
        }
        const intNewUserID = this.lastID
        try {
            await seedGuestData(intNewUserID)
        } catch (objErr) {
            console.error('Seed failed:', objErr.message)
        }
        return sendSuccess(res, 201, 'Guest mode activated', buildAuthResponse({ UserID: intNewUserID, Username: strUsername, IsGuest: 1 }))
    })
})

// GET current authenticated user
router.get('/me', requireUser, (req,res,next) => {
    return sendSuccess(res, 200, 'Current user retrieved', { user: req.objUser })
})

// PUT change password
router.put('/password', requireUser, (req,res,next) => {
    const strCurrentPassword = safeTrim(req.body.currentPassword)
    const strNewPassword = safeTrim(req.body.newPassword)

    if (!strCurrentPassword || !strNewPassword){
        return sendError(res, 400, 'Both the current and the new password are required', { code: 'VALIDATION_ERROR', details: {} })
    }

    if (strNewPassword.length < 8){
        return sendError(res, 400, 'New password must be at least 8 characters in length', { code: 'VALIDATION_ERROR', details: {} })
    }

    const intUserID = req.intUserID
    const strQuery = `SELECT PasswordHash FROM tblUsers WHERE UserID = ? LIMIT 1`

    db.get(strQuery, [intUserID], (err, objUser) => {
        if (err){
            console.error('Error fetching user:', err.message)
            return sendError(res, 500, 'Failed to change password', { code: 'SERVER_ERROR', details: {} })
        }

        if (!objUser || !verifyPassword(strCurrentPassword, objUser.PasswordHash)){
            return sendError(res, 401, 'Current password is incorrect', { code: 'UNAUTHORIZED', details: {} })
        }

        const strNewHash = hashPassword(strNewPassword)
        const strUpdateQuery = `UPDATE tblUsers SET PasswordHash = ? WHERE UserID = ?`

        db.run(strUpdateQuery, [strNewHash, intUserID], function (err) {
            if (err){
                console.error('Error updating password:', err.message)
                return sendError(res, 500, 'Failed to change password', { code: 'SERVER_ERROR', details: {} })
            }

            return sendSuccess(res, 200, 'Password changed successfully', {})
        })
    })
})



module.exports = router