// routes/details.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')

// DELETE for if you wanna delete a detail
router.delete('/:id', (req,res,next) => {
    const strDetailID = req.params.id

    const strQuery = `DELETE FROM tblJobDetails WHERE DetailID=?`

    db.run(strQuery, [strDetailID], function (err) {
        if (err) {
            console.error("Error deleting detail:", err.message)
            return sendError(res, 500, "Failed to delete detail", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Detail not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Detail with ID ${strDetailID} deleted successfully`, {})
    })
})

module.exports = router