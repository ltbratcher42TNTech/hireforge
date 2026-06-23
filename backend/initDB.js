// initDB.js
// Creates all tables for the Resume Builder app

const sqlite3 = require('sqlite3').verbose()

const strDBPath = './resume.db'
const intDefaultUserID = 1

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

    // Gave up the idea of migrating my data, I backed it up and will manually migrate, this will ensure tables are rebuilt from scratch
    strQuery = `DROP TABLE IF EXISTS tblJobDetails`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblProjectDetails`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblSkills`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblProfile`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblJobs`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblProjects`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblSkillCategories`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblCertifications`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblAwards`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblSummary`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblEducation`
    db.run(strQuery)

    strQuery = `DROP TABLE IF EXISTS tblUsers`
    db.run(strQuery)

    // =====================================================
    // USERS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblUsers (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT NOT NULL UNIQUE,
            PasswordHash TEXT NOT NULL DEFAULT '',
            IsGuest INTEGER NOT NULL DEFAULT 0,
            CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `
    db.run(strQuery)

    // =====================================================
    // PROFILE
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblProfile (
            ProfileID TEXT PRIMARY KEY,
            FullName TEXT,
            Email TEXT,
            Phone TEXT,
            Location TEXT,
            LinkedIn TEXT,
            GitHub TEXT,
            Website TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            EndDate TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            UserID INTEGER NOT NULL,
            FOREIGN KEY (JobID) REFERENCES tblJobs(JobID) ON DELETE CASCADE,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // PROJECTS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblProjects (
            ProjectID TEXT PRIMARY KEY,
            Name TEXT,
            URL TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // PROJECT DETAILS
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblProjectDetails (
            DetailID TEXT PRIMARY KEY,
            ProjectID TEXT,
            Detail TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (ProjectID) REFERENCES tblProjects(ProjectID) ON DELETE CASCADE,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // SKILL CATEGORIES
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblSkillCategories (
            CategoryID TEXT PRIMARY KEY,
            Name TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            UserID INTEGER NOT NULL,
            FOREIGN KEY (CategoryID) REFERENCES tblSkillCategories(CategoryID) ON DELETE CASCADE,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            DateEarned TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            Description TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
        )
    `
    db.run(strQuery)

    // =====================================================
    // SUMMARY
    // =====================================================
    strQuery = `
        CREATE TABLE IF NOT EXISTS tblSummary (
            SummaryID TEXT PRIMARY KEY,
            Content TEXT NOT NULL,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
            GPA TEXT,
            UserID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES tblUsers(UserID) ON DELETE CASCADE
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
