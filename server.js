
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIG ---
const JWT_SECRET = 'scheme-sense-secret-key-2025';
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schemesense';

// --- DATABASE MODELS ---

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  income: Number,
  caste: String,
  education: String,
  district: String,
  block: String,
  sector: String,
  sectorDetails: Object,
  createdAt: { type: Date, default: Date.now }
});

const SchemeSchema = new mongoose.Schema({
  title: String,
  description: String,
  benefit: String,
  category: String,
  icon: String,
  rules: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    maxIncome: { type: Number, default: 99999999 },
    allowedCastes: [String], // Empty means all
    minEducation: String,
    targetSectors: [String]
  }
});

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
  schemeTitle: String,
  status: { type: String, default: 'Pending' },
  appliedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Scheme = mongoose.model('Scheme', SchemeSchema);
const Application = mongoose.model('Application', ApplicationSchema);

// --- AUTH MIDDLEWARE ---

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Invalid token' });
  }
};

// --- ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, ...profile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...profile, phone, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: 'Registration failed. Phone might be in use.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.send({ user, token });
  } catch (e) {
    res.status(500).send({ error: 'Server error' });
  }
});

app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.send(user);
  } catch (e) {
    res.status(404).send();
  }
});

app.get('/api/schemes/eligible', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const allSchemes = await Scheme.find();
    
    const eligibleSchemes = allSchemes.filter(scheme => {
      const r = scheme.rules;
      if (user.age < r.minAge || user.age > r.maxAge) return false;
      if (user.income > r.maxIncome) return false;
      if (r.allowedCastes.length > 0 && !r.allowedCastes.includes(user.caste)) return false;
      if (r.targetSectors.length > 0 && !r.targetSectors.includes(user.sector)) return false;
      return true;
    });

    res.send(eligibleSchemes);
  } catch (e) {
    res.status(500).send({ error: 'Matching failed' });
  }
});

app.post('/api/applications', authenticate, async (req, res) => {
  try {
    const application = new Application({
      userId: req.userId,
      schemeId: req.body.schemeId,
      schemeTitle: req.body.schemeTitle
    });
    await application.save();
    res.status(201).send(application);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/api/applications', authenticate, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.userId }).sort({ appliedAt: -1 });
    res.send(apps);
  } catch (e) {
    res.status(500).send();
  }
});

// --- SEED DATA (200+ BIHAR SCHEMES) ---
const seedSchemes = async () => {
  const count = await Scheme.countDocuments();
  if (count > 0) return;

  const categories = ['Education', 'Agriculture', 'Health', 'Housing', 'Employment', 'Business'];
  const icons = { Education: '🎓', Agriculture: '🚜', Health: '🏥', Housing: '🏠', Employment: '💼', Business: '🏢' };
  const sectors = ['Student', 'Agriculture / Farmer', 'Unemployed', 'Laborer / Construction', 'Self-Employed / Business'];

  const initialSchemes = [
    { title: 'Bihar Student Credit Card', description: 'Loan up to 4 Lakh for higher studies.', benefit: '₹4,00,000 Loan', category: 'Education', icon: '🎓', rules: { maxAge: 25, targetSectors: ['Student'] } },
    { title: 'Kanya Utthan Yojana', description: 'Incentive for girls from birth to graduation.', benefit: '₹50,000 Total', category: 'Health', icon: '👧', rules: { maxAge: 23, targetSectors: ['Student'] } },
    { title: 'Diesel Subsidy', description: 'Agricultural fuel subsidy.', benefit: '₹60/liter', category: 'Agriculture', icon: '🚜', rules: { targetSectors: ['Agriculture / Farmer'] } }
  ];

  // Programmatically generate 200 variations of local welfare schemes
  const generatedSchemes = [];
  for (let i = 1; i <= 200; i++) {
    const cat = categories[i % categories.length];
    generatedSchemes.push({
      title: `${cat} Support Scheme - Phase ${i}`,
      description: `Welfare initiative targeted at regional development and individual empowerment in sector phase ${i}.`,
      benefit: `₹${(Math.floor(Math.random() * 50) + 1) * 1000} Grant/Subsidy`,
      category: cat,
      icon: icons[cat],
      rules: {
        minAge: Math.floor(Math.random() * 18),
        maxAge: 40 + Math.floor(Math.random() * 30),
        maxIncome: (Math.floor(Math.random() * 5) + 2) * 100000,
        allowedCastes: i % 5 === 0 ? ['SC', 'ST'] : [],
        targetSectors: [sectors[i % sectors.length]]
      }
    });
  }

  await Scheme.insertMany([...initialSchemes, ...generatedSchemes]);
  console.log('Database Seeded with 200+ Bihar Schemes');
};

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB Connected');
  seedSchemes();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
