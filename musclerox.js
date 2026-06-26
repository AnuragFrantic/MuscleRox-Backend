const express = require('express');
const { server, app } = require('./app');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const mongourl = "mongodb+srv://anurag_db_user:2klG8lk6fwy2jgEP@musclerox.rybw9ae.mongodb.net/?appName=musclerox";

mongoose.connect(mongourl);
const database = mongoose.connection;
database.on('connected', () => {
    console.log('Database connected');
})
database.on('error', (err) => {
    console.error('Database connection error:', err);
});
database.on('disconnected', () => {
    console.log('Database disconnected');
});
process.env.TZ = "Asia/Kolkata";
const port = 8982;
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => res.send('Musclerox  api started successfully.'));
const bannerRoute = require('./routes/bannerRoutes');
const settingRoute = require('./routes/settingRoute');
const userRoute = require('./routes/userRoutes');
const appRoute = require('./routes/AppRoutes');
const productRoute = require('./routes/productRoute');
const testimonialRoute = require('./routes/Testimonial.routes');

// const offerRoute = require('./routes/offer.routes');


// const reviewroutes = require('./routes/reviewRoutes');
const blogroutes = require('./routes/blogRoutes');


const contactRoute = require('./routes/contactRoutes');
const policyRoute = require('./routes/PolicyRoutes');
const sectionRoute = require('./routes/sectionRoutes');
const pageContentRoute = require('./routes/pageContentRoutes');
const AddressRoute = require('./routes/AddressRoutes');
const MediaRoute = require('./routes/MediaRoutes');
const FaqRoute = require('./routes/FaqRoutes');
const TeamRoute = require('./routes/TeamRoutes');









app.use('/api/v1/banner', bannerRoute);
app.use('/api/v1/setting', settingRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/app', appRoute);
app.use('/api/v1/product', productRoute);




app.use('/api/v1/blog', blogroutes);
app.use('/api/v1/testimonial', testimonialRoute);

// app.use('/api/v1/review', reviewroutes);

app.use('/api/v1/contact', contactRoute);
app.use('/api/v1/policy', policyRoute);
app.use('/api/v1/section', sectionRoute);
app.use('/api/v1/page-content', pageContentRoute);
app.use('/api/v1/address', AddressRoute);
app.use('/api/v1/media', MediaRoute);
app.use('/api/v1/faq', FaqRoute);
app.use('/api/v1/team', TeamRoute);











server.listen(port, () => {
    console.log(`Tara ecommerce api started at https://localhost:${port}`);
});