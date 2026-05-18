// routes/skills.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')

// POST a new skill
router.post('/', (req,res,next) => {
    const strSkillID = uuidv4()
    const strCategoryID = safeTrim(req.body.categoryId)
    const strName = safeTrim(req.body.name)

    if (!strCategoryID || !strName) {
        return sendError(res, 400, "Category ID and skill name are required", { code: "VALIDATION_ERROR", details: {} })
    }

    if (!isValidLength(strName, objFieldMaxLengths.strSkill)) {
        return sendError(res, 400, "Skill name exceeds max length", { code: "VALIDATION_ERROR", details: {} })
    }

    const strQuery = `INSERT INTO tblSkills (SkillID, CategoryID, Name) VALUES (?, ?, ?)`

    db.run(strQuery, [strSkillID, strCategoryID, strName], (err) => {
        if (err) {
            console.error("Error creating skill:", err.message)
            return sendError(res, 500, "Failed to create skill", { code: "SERVER_ERROR", details: {} })
        }
        const objSkill = { SkillID: strSkillID, CategoryID: strCategoryID, Name: strName }
        return sendSuccess(res, 201, "Skill created successfully", { skill: objSkill })
    })
})

// GET all skills, which can be filtered by category (I think this could be useful on frontend to 
// improve even further if I decide to implement it), even if it makes this query a little quirky,
// This was created with the help of AI (I wrote most of the route and asked it to help me add filtering
// by category)
router.get('/', (req,res,next) => {
    const strCategoryID = req.query.categoryId
    let strQuery = `SELECT * FROM tblSkills`
    let arrParams = []

    if (strCategoryID) {
        strQuery += ` WHERE CategoryID=?`
        arrParams.push(strCategoryID)
    }

    db.all(strQuery, arrParams, (err, arrRows) => {
        if (err) {
            console.error("Error fetching skills:", err.message)
            return sendError(res, 500, "Failed to get skills", { code: "SERVER_ERROR", details: {} })
        }
        return sendSuccess(res, 200, "Skills retreved successfully", { skills: arrRows })
    })
})

// DELETE as kill
router.delete('/:id', (req,res,next) => {
    const strSkillID = req.params.id
    const strQuery = `DELETE FROM tblSkills WHERE SkillID=?`

    db.run(strQuery, [strSkillID], function (err) {
        if (err) {
            console.error("Error deleting skill:", err.message)
            return sendError(res, 500, "Failed to delete skill", { code: "SERVER_ERROR", details: {} })
        }
        if (this.changes === 0) return sendError(res, 404, "Skill not found", { code: "NOT_FOUND", details: {} })
        return sendSuccess(res, 200, `Skill with ID ${strSkillID} deleted successfully`, {})
    })
})

module.exports = router