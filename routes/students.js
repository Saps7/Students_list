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

//Show Students Route
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).exec()
    res.render('students/show', { student: student })
  } catch {
    res.redirect('/')
  }
})

// Edit student Route
router.get('/:id/edit', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    renderEditPage(res, student)
  } catch {
    res.redirect('/')
  }
})

// Update student Route
router.put('/:id', async (req, res) => {
  let student

  try {
    student = await Student.findById(req.params.id)
    student.name = req.body.name
    student.email = req.body.email
    student.phone = req.body.phone
    student.degree = req.body.degree
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(student, req.body.cover)
    }
    await student.save()
    res.redirect(`/students/${student.id}`)
  } catch {
    if (student != null) {
      renderEditPage(res, student, true)
    } else {
      redirect('/')
    }
  }
})

// Delete student Page
router.delete('/:id', async (req, res) => {
  let student
  try {
    student = await Student.findById(req.params.id)
    await student.remove()
    res.redirect('/students')
  } catch {
    if (student != null) {
      res.render('students/show', {
        student: student,
        errorMessage: 'Could not remove student'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, student, hasError = false) {
  renderFormPage(res, student, 'new', hasError)
}

async function renderEditPage(res, student, hasError = false) {
  renderFormPage(res, student, 'edit', hasError)
}

async function renderFormPage(res, student, form, hasError = false) {
  try {
    const params = {
      student: student
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating student'
      } else {
        params.errorMessage = 'Error Creating student'
      }
    }
    res.render(`students/${form}`, params)
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