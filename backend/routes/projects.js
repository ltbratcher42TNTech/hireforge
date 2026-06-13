// routes/projects.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// ===================================================================
// PROJECT ROUTES BELOW
// ===================================================================

// POST project route
router.post('/', (req,res,next) => {
    const strProjectID = uuidv4()
    const strName = safeTrim(req.body.name)
    const strURL = safeTrim(req.body.url)

    if (!strProjectID || !strName || !strURL){
        return sendError(res, 400, 'All fields are required', { code: 'VALIDATION_ERROR', details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `INSERT INTO tblProjects (ProjectID, Name, URL, UserID) VALUES (?, ?, ?, ?)`
    db.run(strQuery, [strProjectID, strName, strURL, intUserID], function(err){
        if (err){
            console.error('Insert Error:', err.message)
            return sendError(res, 500, 'Failed to create project', { code: 'SERVER_ERROR', details: {} })
        }

        const objProject = { ProjectID: strProjectID, Name: strName, URL: strURL }
        return sendSuccess(res, 201, 'Project created successfully!', { project: objProject })
    })
})

// GET all projects route
router.get('/', (req,res,next) => {
    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblProjects WHERE UserID=? ORDER BY Name ASC`
    db.all(strQuery, [intUserID], function(err, arrRows) {
        if (err){
            console.error('Error Fetching:', err.message)
            return sendError(res, 500, 'Failed to GET all projects', { code: 'SERVER_ERROR', details: {} })
        }

        return sendSuccess(res, 200, 'Projects retrieved successfully', { projects: arrRows })
    })
})

// PUT project route
router.put('/:id', (req,res,next) => {
    const strProjectID = req.params.id
    const strName = safeTrim(req.body.name)
    const strURL = safeTrim(req.body.url)

    if (!strName || !strURL) {
        return sendError(res, 400, 'All fields are required', { code: 'VALIDATION_ERROR', details: {} })
    }

    const intUserID = getCurrentUserID(req)
    const strQuery = `UPDATE tblProjects SET Name=?, URL=? WHERE ProjectID=? AND UserID=?`
    db.run(strQuery, [strName, strURL, strProjectID, intUserID], function(err) {
        if (err) {
            console.error('Error updating project:', err.message)
            return sendError(res, 500, 'Failed to update project', { code: 'SERVER_ERROR', details: {} })
        }

        if (this.changes === 0) return sendError(res, 404, 'Project not found', { code: 'NOT_FOUND', details: {} })
        return sendSuccess(res, 200, `Project with ID ${strProjectID} updated successfully`, {})
    })
})

// DELETE project route
router.delete('/:id', (req,res,next) => {
    const strProjectID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblProjects WHERE ProjectID=? AND UserID=?`
    db.run(strQuery, [strProjectID, intUserID], function(err) {
        if (err) {
            console.error('Error deleting project:', err.message)
            return sendError(res, 500, 'Failed to delete project', { code: 'SERVER_ERROR', details: {} })
        }

        if (this.changes === 0) return sendError(res, 404, 'Project not found', { code: 'NOT_FOUND', details: {} })
        return sendSuccess(res, 200, `Project with ID ${strProjectID} deleted successfully`, {})
    })
})

// ===================================================================
// PROJECT DETAILS ROUTES BELOW
// ===================================================================

// POST detail route for project bullets
router.post('/:id/details', (req,res,next) => {
    const strDetailID = uuidv4()
    const strProjectID = req.params.id
    const strDetail = safeTrim(req.body.detail)

    if(!strDetail){
        return sendError(res, 400, 'Detail text is required', { code: 'VALIDATION_ERROR', details: {} })
    }

    if (!isValidLength(strDetail, objFieldMaxLengths.strDetail)){
        return sendError(res, 400, 'Detail text exceeds max length', { code: 'VALIDATION_ERROR', details: {} })
    }

    const intUserID = getCurrentUserID(req)
    // Asked ai to implement similar query here as seen in jobs
    const strQuery = `INSERT INTO tblProjectDetails (DetailID, ProjectID, Detail, UserID) SELECT ?, ProjectID, ?, ? FROM tblProjects WHERE ProjectID=? AND UserID=?`
    db.run(strQuery, [strDetailID, strDetail, intUserID, strProjectID, intUserID], function (err) {
        if (err){
            console.error('Error creating detail:', err.message)
            return sendError(res, 500, 'Failed to create detail', { code: 'SERVER_ERROR', details: {} })
        }

        // Database brick-walled the request because user doesn't own this JobID. AKA Gaslight bad actors with a 404 so they 
        // don't know if the ID is real.
        if (this.changes === 0) return sendError(res, 404, 'Project not found', { code: 'NOT_FOUND', details: {} })
        const objDetail = { DetailID: strDetailID, ProjectID: strProjectID, Detail: strDetail }
        return sendSuccess(res, 201, 'Detail created successfully', { detail: objDetail })
    })
})

// GET all details for one project
router.get('/:id/details', (req,res,next) => {
    const strProjectID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `SELECT * FROM tblProjectDetails WHERE ProjectID=? AND UserID=?`
    db.all(strQuery, [strProjectID, intUserID], (err, arrRows) => {
        if (err) {
            console.error('Error fetching the project details:', err.message)
            return sendError(res, 500, 'Failed to get the project details', { code: 'SERVER_ERROR', details: {} })
        }

        return sendSuccess(res, 200, 'Project details fetched', { details: arrRows })
    })
})

module.exports = router