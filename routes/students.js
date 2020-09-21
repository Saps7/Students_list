const express = require('express')
const router = express.Router()
const Student = require('../models/student')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All students Route
router.get('/', async (req, res) => {
  let query = Student.find()
  if (req.query.name != null && req.query.name != '') {
    query = query.regex('name', new RegExp(req.query.name, 'i'))
  }
  try {
    const students = await query.exec()
    res.render('students/index', {
      students: students,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New student Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Student())
})

// Create student Route
router.post('/', async (req, res) => {
  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    degree: req.body.degree
  })
  saveCover(student, req.body.cover)

  try {
    const newstudent = await student.save()
    // res.redirect(`students/${newstudent.id}`)
    res.redirect(`students`)
  } catch {
    renderNewPage(res, student, true)
  }
})

async function renderNewPage(res, student, hasError = false) {
  try {
    const params = {
      student: student
    }
    if (hasError) params.errorMessage = 'Error Creating student'
    res.render('students/new', params)
  } catch {
    res.redirect('/students')
  }
}

function saveCover(student, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    student.coverImage = new Buffer.from(cover.data, 'base64')
    student.coverImageType = cover.type
  }
}

module.exports = router