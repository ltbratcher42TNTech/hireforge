// routes/projectdetails.js
const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const { sendSuccess, sendError } = require('../utils/responses')
//centralizes user scoping while auth and guest flows are future work.
const { getCurrentUserID } = require('../utils/users')

// DELETE project detail route
router.delete('/:id', (req,res,next) => {
    const strDetailID = req.params.id

    const intUserID = getCurrentUserID(req)
    const strQuery = `DELETE FROM tblProjectDetails WHERE DetailID=? AND UserID=?`
    db.run(strQuery, [strDetailID, intUserID], function(err){
        if (err){
            console.error("Error deleting project detail: ", err.message)
            return sendError(res, 500, 'Failed to delete project detail', { code: 'SERVER_ERROR', details: {} })
        }

        if (this.changes === 0) return sendError(res, 404, 'Detail not found', { code:'FOUND', details: {} })
        return sendSuccess(res, 200, `Project detail with ID ${strDetailID} deleted successfully`, {})
    })
})

module.exports = router