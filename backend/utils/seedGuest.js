// utils/seedGuest.js
// AI assisted: seeds realistic demo data for guest users so recruiters 
// can explore a fully populated HireForge account.

const { v4: uuidv4 } = require('uuid')
const db = require('./db')

const runQuery = (strQuery, arrParams = []) => {
    return new Promise((resolve, reject) => {
        db.run(strQuery, arrParams, function(err) {
            if (err) reject(err)
            else resolve(this)
        })
    })
}

const seedGuestData = async (intUserID) => {
    // Profile
    await runQuery(
        `INSERT INTO tblProfile (ProfileID, FullName, Email, Phone, Location, LinkedIn, GitHub, Website, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'Jane Doe', 'jane.doe@email.com', '(555) 867-5309', 'Nashville, TN', 'linkedin.com/in/janedoe', 'github.com/janedoe', 'janedoe.dev', intUserID]
    )

    // Summary
    await runQuery(
        `INSERT INTO tblSummary (SummaryID, Content, UserID) VALUES (?, ?, ?)`,
        [uuidv4(), 'Computer Science student with hands-on experience in full stack web development. Passionate about building clean, user-friendly applications and solving real problems with code. Seeking a software engineering role where I can contribute and grow.', intUserID]
    )

    // Education
    await runQuery(
        `INSERT INTO tblEducation (EducationID, Institution, Degree, FieldOfStudy, StartDate, EndDate, GPA, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'Tennessee Tech University', 'Bachelor of Science', 'Computer Science', '2022-08-01', '2026-05-01', '3.7', intUserID]
    )

    // Jobs
    const strJob1ID = uuidv4()
    const strJob2ID = uuidv4()

    await runQuery(
        `INSERT INTO tblJobs (JobID, Title, Company, StartDate, EndDate, UserID) VALUES (?, ?, ?, ?, ?, ?)`,
        [strJob1ID, 'Software Engineering Intern', 'Acme Corp', '2025-06-01', '2025-08-07', intUserID]
    )
    await runQuery(
        `INSERT INTO tblJobs (JobID, Title, Company, StartDate, EndDate, UserID) VALUES (?, ?, ?, ?, ?, ?)`,
        [strJob2ID, 'Web Developer', 'Freelance', '2024-01-01', '2025-04-01', intUserID]
    )

    // Job bullets
    const arrJob1Details = [
        'Built and maintained REST API endpoints using Node.js and Express, reducing response times by 30%',
        'Collaborated with a team of 5 engineers in an Agile environment using Jira and GitHub',
        'Wrote unit tests achieving 85% code coverage across core modules'
    ]
    const arrJob2Details = [
        'Designed and developed 4 client websites using HTML, CSS, JavaScript, and Bootstrap',
        'Implemented SEO best practices resulting in a 40% increase in organic traffic for one client',
        'Managed client communications and delivered projects on time and within budget'
    ]

    for (const strDetail of arrJob1Details) {
        await runQuery(
            `INSERT INTO tblJobDetails (DetailID, JobID, Detail, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strJob1ID, strDetail, intUserID]
        )
    }
    for (const strDetail of arrJob2Details) {
        await runQuery(
            `INSERT INTO tblJobDetails (DetailID, JobID, Detail, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strJob2ID, strDetail, intUserID]
        )
    }

    // Projects
    const strProject1ID = uuidv4()
    const strProject2ID = uuidv4()

    await runQuery(
        `INSERT INTO tblProjects (ProjectID, Name, URL, UserID) VALUES (?, ?, ?, ?)`,
        [strProject1ID, 'HireForge', 'github.com/janedoe/hireforge', intUserID]
    )
    await runQuery(
        `INSERT INTO tblProjects (ProjectID, Name, URL, UserID) VALUES (?, ?, ?, ?)`,
        [strProject2ID, 'Budget Tracker', 'github.com/janedoe/budget-tracker', intUserID]
    )

    const arrProject1Details = [
        'Built a full stack resume builder using Node.js, Express, SQLite, and vanilla JavaScript',
        'Integrated Google Gemini AI API to improve resume bullet points and generate cover letters',
        'Implemented JWT authentication with guest mode for recruiter demos'
    ]
    const arrProject2Details = [
        'Developed a personal finance tracker with category-based expense visualization using Chart.js',
        'Implemented local data persistence using SQLite with full CRUD functionality'
    ]

    for (const strDetail of arrProject1Details) {
        await runQuery(
            `INSERT INTO tblProjectDetails (DetailID, ProjectID, Detail, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strProject1ID, strDetail, intUserID]
        )
    }
    for (const strDetail of arrProject2Details) {
        await runQuery(
            `INSERT INTO tblProjectDetails (DetailID, ProjectID, Detail, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strProject2ID, strDetail, intUserID]
        )
    }

    // Skill categories and skills
    const strCat1ID = uuidv4()
    const strCat2ID = uuidv4()

    await runQuery(
        `INSERT INTO tblSkillCategories (CategoryID, Name, UserID) VALUES (?, ?, ?)`,
        [strCat1ID, 'Languages', intUserID]
    )
    await runQuery(
        `INSERT INTO tblSkillCategories (CategoryID, Name, UserID) VALUES (?, ?, ?)`,
        [strCat2ID, 'Frameworks & Tools', intUserID]
    )

    const arrLangSkills = ['JavaScript', 'Python', 'SQL', 'HTML', 'CSS']
    const arrToolSkills = ['Node.js', 'Express', 'React', 'Git', 'Bootstrap']

    for (const strSkill of arrLangSkills) {
        await runQuery(
            `INSERT INTO tblSkills (SkillID, CategoryID, Name, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strCat1ID, strSkill, intUserID]
        )
    }
    for (const strSkill of arrToolSkills) {
        await runQuery(
            `INSERT INTO tblSkills (SkillID, CategoryID, Name, UserID) VALUES (?, ?, ?, ?)`,
            [uuidv4(), strCat2ID, strSkill, intUserID]
        )
    }

    // Certification
    await runQuery(
        `INSERT INTO tblCertifications (CertID, Name, Issuer, DateEarned, UserID) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), 'AWS Cloud Practitioner', 'Amazon Web Services', '2025-11-01', intUserID]
    )

    // Award
    await runQuery(
        `INSERT INTO tblAwards (AwardID, Name, Issuer, DateEarned, Description, UserID) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), "Dean's List", 'Tennessee Tech University', '2024-12-01', 'Awarded for achieving a GPA of 3.5 or higher for the semester.', intUserID]
    )
}

module.exports = { seedGuestData }