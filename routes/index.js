const express = require('express')
const router = express.Router()
const Student = require('../models/student')

router.get('/', async (req, res) => {
  let students
  try {
    students = await Student.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    students = []
  }
  res.render('index', { students: students }) 
})

module.exports = router