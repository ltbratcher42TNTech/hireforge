// initDB.js
// Creates all tables for the Resume Builder app

const sqlite3 = require('sqlite3').verbose()

const strDBPath = './resume.db'

const db = new sqlite3.Database(strDBPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message)
    } else {
        console.log("Connected to SQLite database")
    }
})

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON")

db.serialize(() => {

    // =====================================================
    // PROFILE
    // =====================================================
    let strQuery = `
        CREATE TABLE IF NOT EXISTS tblProfile (
            ProfileID TEXT PRIMARY KEY,
            FullName TEXT,
            Email TEXT,
            Phone TEXT,
            Location TEXT,
            LinkedIn TEXT,
            GitHub TEXT,
            Website TEXT
        )
    `
    db.run(strQuery)

    // =====================================================
    // JOBS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblJobs (
            JobID TEXT PRIMARY KEY,
            Title TEXT,
            Company TEXT,
            StartDate TEXT,
            EndDate TEXT
        )
    `
    db.run(strQuery)

    // =====================================================
    // JOB DETAILS
    // =====================================================
    
    // I learned on delete cascade is super useful from preventing orphaned records, which my db 
    // has and it is annoying
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblJobDetails (
            DetailID TEXT PRIMARY KEY,
            JobID TEXT,
            Detail TEXT,
            FOREIGN KEY (JobID) REFERENCES tblJobs(JobID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // SKILL CATEGORIES
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblSkillCategories (
            CategoryID TEXT PRIMARY KEY,
            Name TEXT
        )
    `
    db.run(strQuery)

    // =====================================================
    // SKILLS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblSkills (
            SkillID TEXT PRIMARY KEY,
            CategoryID TEXT,
            Name TEXT,
            FOREIGN KEY (CategoryID) REFERENCES tblSkillCategories(CategoryID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // CERTIFICATIONS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblCertifications (
            CertID TEXT PRIMARY KEY,
            Name TEXT,
            Issuer TEXT,
            DateEarned TEXT
        )
    `
    db.run(strQuery)

    // =====================================================
    // AWARDS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblAwards (
            AwardID TEXT PRIMARY KEY,
            Name TEXT,
            Issuer TEXT,
            DateEarned TEXT,
            Description TEXT
        )
    `
    db.run(strQuery)

    // =====================================================
    // SUMMARY
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblSummary (
            SummaryID TEXT PRIMARY KEY,
            Content TEXT NOT NULL
        )
    `
    db.run(strQuery)

    // =====================================================
    // EDUCATION
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblEducation (
            EducationID TEXT PRIMARY KEY,
            Institution TEXT NOT NULL,
            Degree TEXT,
            FieldOfStudy TEXT,
            StartDate TEXT,
            EndDate TEXT,
            GPA TEXT
        )
    `
    db.run(strQuery)

    console.log("All tables created successfully if they didn't exist.")
})

// Close connection
db.close((err) => {
    if (err) {
        console.error("Error closing database:", err.message)
    } else {
        console.log("Database connection closed.")
    }
})