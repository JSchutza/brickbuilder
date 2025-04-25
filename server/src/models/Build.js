const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  color: { type: String, required: true },
  type: { type: String, required: true },
  rotation: { type: Number, default: 0 }
});

const buildSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  blocks: [blockSchema]
}, {
  timestamps: true
});

const Build = mongoose.model('Build', buildSchema);

module.exports = Build; 