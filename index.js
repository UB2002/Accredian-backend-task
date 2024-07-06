const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Send an email using Nodemailer
const sendEmail = (form) => {
  const mailOptions = {
    from: 'noreply@yourdomain.com',
    to: form.email,
    subject: 'Thank you for the referral!',
    text: `Thank you ${form.name} for referring ${form.course} with code ${form.referralCode}.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API endpoint to handle referral form data
app.post('/api/referrals', async (req, res) => {
  const { name, email, referralCode, course } = req.body;

  try {
    // Create a new referral entry in the database
    const newReferral = await prisma.referral.create({
      data: { name, email, referralCode, course }
    });

    // Send an email
    sendEmail({
      name,
      email,
      referralCode,
      course
    });

    res.status(201).json(newReferral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Connected to the database successfully');
});
