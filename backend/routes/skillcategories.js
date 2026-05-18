// routes/skillcategories.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')

// POST new skill category
router.post('/', (req,res,next) => {
    const strCategoryID = uuidv4()
    const strName = safeTrim(req.body.name)

    if (!strName) {
        return sendError(res, 400, "Category name is required", { code: "VALIDATION_ERROR", details: {} })
    }


    if (!isValidLength(strName, objFieldMaxLengths.strCategory)) {
        return sendError(res, 400, "Category name exceeds max length", { code: "VALIDATION_ERROR", details: {} })
    }

    const strQuery = `INSERT INTO tblSkillCategories (CategoryID, Name) VALUES (?, ?)`

    db.run(strQuery, [strCategoryID, strName], (err) => {
        if (err) {
            console.error("Error creating skill category:", err.message)
            return sendError(res, 500, "Failed to create skill category", { code: "SERVER_ERROR", details: {} })
        }
        const objCategory = { CategoryID: strCategoryID, Name: strName }
        return sendSuccess(res, 201, "Skill category created successfully", { category: objCategory })
    })
})

// GET all skill categories
router.get('/', (req,res,next) => {
    const strQuery = `SELECT * FROM tblSkillCategories ORDER BY Name`

    db.all(strQuery, [], (err, arrRows) => {
        if (err) {
            console.error("Error fetching skill categories:", err.message)
            return sendError(res, 500, "Failed to get skill categories", { code: "SERVER_ERROR", details: {} })
        }
        return sendSuccess(res, 200, "Skill categories fetched", { categories: arrRows })
    })
})

// DELETE skill category
router.delete('/:id', (req,res,next) => {
    const strCategoryID = req.params.id

    const strQuery = `DELETE FROM tblSkillCategories WHERE CategoryID=?`

    db.run(strQuery, [strCategoryID], function (err) {
        if (err) {
            console.error("Error deleting skill category:", err.message)
            return sendError(res, 500, "Failed to delete skill category", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Skill category not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Skill category with ID ${strCategoryID} deleted successfully`, {})
    })
})

module.exports = router