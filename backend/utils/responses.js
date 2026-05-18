// Shared API response and validation help for predictable response (AI slightly assisted in formatting, I chose limits)
const objFieldMaxLengths = {
    strProfileName: 128,
    strEmail: 256,
    strPhone: 32,
    strLocation: 128,
    strURL: 256,
    strJobTitle: 128,
    strCompany: 128,
    strDetail: 512,
    strCategory: 100,
    strSkill: 100,
    strCertName: 128,
    strIssuer: 128,
    strAwardName: 128,
    strAwardDescription: 650
}

// Centralized responses to make sure all endpoints return a much more consistent shape (success/message/data or error),
// which theoretically makes frontend handling predictable and allowing changes to response format in one place without total chaos
const sendSuccess = (res, intStatusCode, strMessage, objData = {}) => {
    return res.status(intStatusCode).json({
        success: true,
        message: strMessage,
        data: objData
    })
}

const sendError = (res, intStatusCode, strMessage, objError = {}) => {
    return res.status(intStatusCode).json({
        success: false,
        message: strMessage,
        error: { code: objError.code || "ERROR", details: objError.details || {} }
    })
}

// this safely trims any input without throwing on null or non-string values from req.body, superior to the previous way I was doing it
const safeTrim = (objValue) => {
    if (objValue === null || objValue === undefined) {
        return ""
    }
    return String(objValue).trim()
}

// checks if a string's length is within a specified maximum limit.
const isValidLength = (strValue, intMaxLength) => strValue.length <= intMaxLength

module.exports = { objFieldMaxLengths, sendSuccess, sendError, safeTrim, isValidLength }