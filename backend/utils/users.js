// utils/users.js
// HEAVILY AI assisted here: current-user helpers for authenticated API requests.

const { verifyToken } = require('./auth')
const { sendError } = require('./responses')


const getTokenFromRequest = (req) => {
    const strAuthHeader = req.headers.authorization || ''

    if (!strAuthHeader.startsWith('Bearer ')) {
        return ''
    }

    return strAuthHeader.replace('Bearer ', '').trim()
}

const requireUser = (req,res,next) => {
    const strToken = getTokenFromRequest(req)
    const objUser = verifyToken(strToken)

    if (!objUser || !objUser.UserID) {
        return sendError(res, 401, 'Please log in to continue', { code: 'UNAUTHORIZED', details: {} })
    }

    req.objUser = objUser
    req.intUserID = objUser.UserID
    return next()
}

const getCurrentUserID = (req) => req.intUserID

module.exports = { getCurrentUserID, requireUser }