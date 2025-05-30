require('dotenv').config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = {
  GEMINI_API_URL,
  GEMINI_API_KEY
};
