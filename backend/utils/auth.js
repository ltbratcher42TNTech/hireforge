// utils/auth.js
// AI assisted here with the following: password hashing as well as signed token helpers for local authentication without 
// adding additional packages.

const crypto = require('crypto')

const strTokenSecret = process.env.AUTH_TOKEN_SECRET || 'hireforge-local-dev-secret-change-before-deploy'
const intTokenSeconds = 60 * 60 * 8
const intPasswordIterations = 120000
const intPasswordKeyLength = 64
const strPasswordDigest = 'sha512'

const encodeBase64URL = (strValue) => Buffer.from(strValue).toString('base64url')
const decodeBase64URL = (strValue) => Buffer.from(strValue, 'base64url').toString('utf8')

const hashPassword = (strPassword) => {
    const strSalt = crypto.randomBytes(16).toString('hex')
    const strHash = crypto.pbkdf2Sync(strPassword, strSalt, intPasswordIterations, intPasswordKeyLength, strPasswordDigest).toString('hex')
    return `pbkdf2$${intPasswordIterations}$${strSalt}$${strHash}`
}

const verifyPassword = (strPassword, strStoredHash) => {
    const arrHashParts = strStoredHash.split('$')

    if (arrHashParts.length !== 4 || arrHashParts[0] !== 'pbkdf2'){
        return false
    }

    const intIterations = Number.parseInt(arrHashParts[1], 10)
    const strSalt = arrHashParts[2]
    const strExpectedHash = arrHashParts[3]
    const strActualHash = crypto.pbkdf2Sync(strPassword, strSalt, intIterations, intPasswordKeyLength, strPasswordDigest).toString('hex')

    return crypto.timingSafeEqual(Buffer.from(strExpectedHash, 'hex'), Buffer.from(strActualHash, 'hex'))
}

const signValue = (strValue) => crypto.createHmac('sha256', strTokenSecret).update(strValue).digest('base64url')

const createToken = (objUser) => {
    const objPayload = {
        UserID: objUser.UserID,
        Username: objUser.Username,
        IsGuest: objUser.IsGuest ? 1 : 0,
        exp: Math.floor(Date.now() / 1000) + intTokenSeconds
    }
    const strPayload = encodeBase64URL(JSON.stringify(objPayload))
    const strSignature = signValue(strPayload)
    return `${strPayload}.${strSignature}`
}

const verifyToken = (strToken) => {
    if (!strToken || !strToken.includes('.')) {
        return null
    }

    const arrParts = strToken.split('.')
    if (arrParts.length !== 2){
        return null
    }

    const strPayload = arrParts[0]
    const strSignature = arrParts[1]
    const strExpectedSignature = signValue(strPayload)

    if (strSignature.length !== strExpectedSignature.length){
        return null
    }

    if (!crypto.timingSafeEqual(Buffer.from(strSignature), Buffer.from(strExpectedSignature))) {
        return null
    }

    try{
        const objPayload = JSON.parse(decodeBase64URL(strPayload))
        if (!objPayload.exp || objPayload.exp < Math.floor(Date.now() / 1000)) {
            return null
        }

        return objPayload
    } catch (err) {
        return null
    }
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken }