const express = require('express')
const dotenv = require('dotenv')
const app = express()
const port = process.env.PORT || 5000 ;

app.get('/', (req, res) => {
  res.send('Server runnign fine')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
