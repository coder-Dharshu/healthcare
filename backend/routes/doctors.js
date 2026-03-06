const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

// Get all doctors (with optional specialization filter)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = {};
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    const doctors = await Doctor.find(query).populate('user', 'name email avatar phone');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email avatar phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create doctor profile (doctor role)
router.post('/', protect, async (req, res) => {
  try {
    const doctor = await Doctor.create({ ...req.body, user: req.user._id });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed demo doctors
router.post('/seed', async (req, res) => {
  try {
    const User = require('../models/User');
    const specializations = ['Cardiologist','Neurologist','Dermatologist','Pediatrician','Orthopedic','General Physician','Psychiatrist','Gynecologist'];
    const names = ['Dr. Sarah Mitchell','Dr. James Patel','Dr. Emily Chen','Dr. Robert Kumar','Dr. Priya Sharma','Dr. David Wilson','Dr. Lisa Anderson','Dr. Michael Brown'];
    const hospitals = ['City Medical Center','Apollo Hospital','Fortis Healthcare','Max Hospital','AIIMS','Medanta','Narayana Health','Columbia Asia'];

    const created = [];
    for (let i = 0; i < names.length; i++) {
      const email = `doctor${i+1}@healthcare.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name: names[i], email, password: 'doctor123', role: 'doctor' });
      }
      let doctor = await Doctor.findOne({ user: user._id });
      if (!doctor) {
        doctor = await Doctor.create({
          user: user._id,
          specialization: specializations[i],
          qualifications: ['MBBS', 'MD'],
          experience: Math.floor(Math.random() * 20) + 5,
          consultationFee: Math.floor(Math.random() * 500) + 300,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          totalReviews: Math.floor(Math.random() * 200) + 50,
          hospital: hospitals[i],
          bio: `Experienced ${specializations[i]} with over ${Math.floor(Math.random()*15)+5} years of clinical practice.`,
          isVerified: true,
          availableSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '13:00', isAvailable: true },
            { day: 'Wednesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
            { day: 'Friday', startTime: '10:00', endTime: '14:00', isAvailable: true }
          ]
        });
      }
      created.push(doctor);
    }
    res.json({ message: `${created.length} doctors seeded`, doctors: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
