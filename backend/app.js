const express = require('express');
const app = express();

app.use('/api/tasks', require('./routes/tasks'));

// Add other routes here

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});
