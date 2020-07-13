const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    description : {
        type: String,
        required: true
    }
 
   
});

module.exports = mongoose.model('story',storySchema)