// routes/ai.js
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { sendSuccess, sendError, safeTrim, isValidLength, objFieldMaxLengths } = require('../utils/responses')

// AI assisted: helper used to call Gemini with a user key first, then env fallback key.
const callGemini = async (objOptions) => {
    const strUserApiKey = objOptions.strUserApiKey ? objOptions.strUserApiKey.trim() : ""
    const strApiKey = strUserApiKey || (process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "")

    if (!strApiKey) {
        return {
            blnSuccess: false,
            intStatus: 400,
            strErrorCode: "MISSING_API_KEY",
            strMessage: "Gemini API key is required. Save a key in Profile or set GEMINI_API_KEY in backend/.env."
        }
    }

    const strModel = "gemini-2.5-flash"

    const strURL = `https://generativelanguage.googleapis.com/v1beta/models/${strModel}:generateContent`

    console.log('Using API key:', strApiKey.substring(0, 8) + '...')
    console.log('Model:', strModel)
    console.log('URL:', strURL)

    const objResponse = await fetch(strURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": strApiKey
        },
        body: JSON.stringify({
            generationConfig: {
                temperature: 0.2
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: objOptions.strPrompt }]
                }
            ]
        })
    })

    const objPayload = await objResponse.json()

    console.log("=== GEMINI RESPONSE ===")
    console.log("Status:", objResponse.status)
    console.log("Body:", JSON.stringify(objPayload, null, 2))

    if (!objResponse.ok) {
        return {
            blnSuccess: false,
            intStatus: objResponse.status,
            strErrorCode: "GEMINI_REQUEST_FAILED",
            strMessage: objPayload.error && objPayload.error.message ? objPayload.error.message : "Gemini request failed."
        }
    }

    const strRawText = objPayload?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!strRawText) {
        return {
            blnSuccess: false,
            intStatus: 502,
            strErrorCode: "EMPTY_AI_RESPONSE",
            strMessage: "Gemini returned an empty response."
        }
    }

    // AI assisted: Gemini may return JSON inside markdown code fences, so strip wrappers before parsing.
    let strJsonText = strRawText.trim()
    const arrCodeFenceMatch = strJsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
    if (arrCodeFenceMatch && arrCodeFenceMatch[1]) {
        strJsonText = arrCodeFenceMatch[1].trim()
    }
    
    if (objOptions.blnRawText) {
        return { blnSuccess: true, intStatus: 200, strText: strRawText }
    }

    let objData = null
    try {
        objData = JSON.parse(strJsonText)
    } catch (err) {
        return {
            blnSuccess: false,
            intStatus: 502,
            strErrorCode: "INVALID_AI_RESPONSE",
            strMessage: "Gemini returned invalid JSON."
        }
    }

    return {
        blnSuccess: true,
        intStatus: 200,
        objData: objData
    }
}

router.get('/config', (req,res,next) => {
    return res.status(200).json({
        message: "AI config retrieved successfully",
        data: {
            hasEnvKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
        }
    })
})

// AI assisted: first Gemini endpoint for polishing existing bullet details.
router.post('/improve-bullet', async (req,res,next) => {
    // Keeping these routes the same because I fear they're more finicky, and prone to breakage, especially since AI largely helped in their creation
    const strDetail = req.body.detail ? req.body.detail.trim() : ""
    const strJobTitle = req.body.jobTitle ? req.body.jobTitle.trim() : ""
    const strCompany = req.body.company ? req.body.company.trim() : ""
    const strGeminiApiKey = req.body.geminiApiKey ? req.body.geminiApiKey.trim() : ""

    if (!strDetail) {
        return res.status(400).json({
            message: "Detail is required.",
            error: { code: "VALIDATION_ERROR" }
        })
    }

    const strPrompt = `
You are improving one resume bullet.
Rules:
1) Do not fabricate achievements, numbers, technologies, or responsibilities.
2) Keep claims grounded only in the provided text.
3) Preserve the original meaning.
4) Keep output concise and resume-ready.
5) Return ONLY JSON with shape: {"improvedBullet":"...","reasoning":"..."}.

Input bullet: "${strDetail}"
Job title context: "${strJobTitle}"
Company context: "${strCompany}"
`

    try {
        const objAiResult = await callGemini({
            strUserApiKey: strGeminiApiKey,
            strPrompt: strPrompt
        })

        if (!objAiResult.blnSuccess) {
            return res.status(objAiResult.intStatus).json({
                message: objAiResult.strMessage,
                error: { code: objAiResult.strErrorCode }
            })
        }

        const strImprovedBullet = objAiResult.objData.improvedBullet ? objAiResult.objData.improvedBullet.trim() : ""

        if (!strImprovedBullet) {
            return res.status(502).json({
                message: "AI response did not include an improved bullet.",
                error: { code: "INVALID_AI_RESPONSE" }
            })
        }

        return res.status(200).json({
            message: "Bullet improved successfully",
            data: {
                originalBullet: strDetail,
                improvedBullet: strImprovedBullet,
                reasoning: objAiResult.objData.reasoning ? objAiResult.objData.reasoning : ""
            }
        })
    } catch (err) {
        console.error("Error improving bullet with AI:", err.message)
        return res.status(500).json({
            message: "Unexpected AI server error.",
            error: { code: "AI_SERVER_ERROR" }
        })
    }
})


// AI assisted: builds a detailed prompt from resume data and user preferences, sends to Gemini
router.post('/cover-letter', async (req,res,next) => {
    const {
        geminiApiKey, company, role, jobDescription, tone,
        targetLength, paragraphCount, includeAchievements,
        companyContext, profile, jobs, skills, certifications, awards
    } = req.body

    if (!company || !role || !jobDescription) {
        return res.status(400).json({ message: 'Company, role, and job description are required.' })
    }

    let strApplicantName = profile && profile.FullName ? profile.FullName : 'the applicant'

    let strContext = ''

    if (jobs && jobs.length) {
        strContext += '\nWork Experience:\n'
        jobs.forEach((objJob) => {
            strContext += `- ${objJob.title} at ${objJob.company} (${objJob.dates})\n`
            if (objJob.bullets && objJob.bullets.length) {
                objJob.bullets.forEach((strBullet) => {
                    strContext += `  • ${strBullet}\n`
                })
            }
        })
    }

    if (skills && skills.length) {
        strContext += `\nKey Skills: ${skills.join(', ')}\n`
    }

    if (certifications && certifications.length) {
        strContext += `\nCertifications: ${certifications.join(', ')}\n`
    }

    if (awards && awards.length) {
        strContext += '\nAwards & Achievements:\n'
        awards.forEach((strAward) => {
            strContext += `- ${strAward}\n`
        })
    }

    const strPrompt = `
Write a cover letter for ${strApplicantName} applying to the role of ${role} at ${company}.

Tone: ${tone}
Target length: approximately ${targetLength} words
Number of body paragraphs: ${paragraphCount}
${includeAchievements ? 'Emphasize specific achievements and quantifiable results where possible.' : ''}
${companyContext ? `Company context: ${companyContext}` : ''}

Job Description:
${jobDescription}

Applicant background:
${strContext}

Write only the body of the cover letter — no subject line, no date, no address block.
Start directly with the opening paragraph. Do not include any preamble or explanation.
`.trim()

    try {
        const objAiResult = await callGemini({
            strUserApiKey: geminiApiKey,
            strPrompt: strPrompt,
            blnRawText: true
        })

        if (!objAiResult.blnSuccess) {
            return res.status(objAiResult.intStatus).json({ message: objAiResult.strMessage })
        }

        return res.status(200).json({ message: 'Cover letter generated.', data: { coverLetter: objAiResult.strText } })
    } catch (objError) {
        console.error('Cover letter Gemini error:', objError.message)
        return res.status(500).json({ message: 'Failed to generate cover letter.', error: objError.message })
    }
})

// AI assisted: lightweight thank-you note generator using existing Gemini helper.
router.post('/thank-you-letter', async (req,res,next) => {
    const strGeminiApiKey = req.body.geminiApiKey ? req.body.geminiApiKey.trim() : ''
    const strJobTitle = req.body.jobTitle ? req.body.jobTitle.trim() : ''
    const strCompanyName = req.body.companyName ? req.body.companyName.trim() : ''
    const strInterviewNotes = req.body.interviewNotes ? req.body.interviewNotes.trim() : ''
    const strTonePreference = req.body.tonePreference ? req.body.tonePreference.trim() : ''

    if (!strJobTitle || !strCompanyName || !strTonePreference) {
        return res.status(400).json({ message: 'Job title, company name, and tone preference are required.' })
    }

    const strPrompt = `
Write a concise post-interview thank-you email.

Role: ${strJobTitle}
Company: ${strCompanyName}
Tone: ${strTonePreference}
${strInterviewNotes ? `Interview notes/context: ${strInterviewNotes}` : 'Interview notes/context: none provided'}

Rules:
- Keep it short (about 100 to 120 words).
- Include: subject line, greeting, 2 short paragraphs, and a simple sign-off.
- Sound specific if interview notes are provided.
- Do not invent or hallucinate facts that were not provided.
- Return only the final thank-you email text.
`.trim()

    try {
        const objAiResult = await callGemini({
            strUserApiKey: strGeminiApiKey,
            strPrompt: strPrompt,
            blnRawText: true
        })

        if (!objAiResult.blnSuccess) {
            return res.status(objAiResult.intStatus).json({ message: objAiResult.strMessage })
        }

        return res.status(200).json({ message: 'Thank-you letter generated.', data: { thankYouLetter: objAiResult.strText } })
    } catch (objError) {
        console.error('Thank-you letter Gemini error:', objError.message)
        return res.status(500).json({ message: 'Failed to generate thank-you letter.', error: objError.message })
    }
})

module.exports = router