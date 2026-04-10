import Testimonial from "../models/testimonialModel.js";
import User from "../models/userModel.js";
import { sendReviewNotification } from "../utils/email.js";

// @desc    Get all testimonials
// @route   GET /api/testimonial
export const getTestimonials = async (req, res) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { active: true };
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user specific testimonials
// @route   GET /api/testimonial/user
export const getUserTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Create a testimonial
// @route   POST /api/testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { reviewText, rating, name } = req.body;
    const image = req.file ? req.file.filename : null;
    
    const testimonialData = {
      name: `${req.user.firstName} ${req.user.lastName}`,
      reviewText,
      rating,
      active: false,
      userId: req.user._id,
      userEmail: req.user.email,
      source: 'website',
      image
    };

    const testimonial = await Testimonial.create(testimonialData);
    
    // Send email notification to admin
    sendReviewNotification(testimonial, req.user);
    
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle testimonial active status
// @route   PUT /api/testimonial/:id/toggle
export const toggleTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      testimonial.active = !testimonial.active;
      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a testimonial by admin
// @route   POST /api/testimonial
const createAdminTestimonial = async (req, res) => {
  try {
    const { name, reviewText, rating, active } = req.body;
    const image = req.file ? req.file.filename : null;
    
    const testimonial = await Testimonial.create({ 
      name, 
      reviewText, 
      rating, 
      active, 
      image,
      source: 'admin'
    });
    
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonial/:id
export const updateTestimonial = async (req, res) => {
  try {
    const { name, reviewText, rating, active } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
      // Only allow editing admin added testimonials
      if (testimonial.source !== 'admin') {
        return res.status(403).json({ message: "Cannot edit user submitted reviews" });
      }
      
      testimonial.name = name || testimonial.name;
      testimonial.reviewText = reviewText || testimonial.reviewText;
      testimonial.rating = rating !== undefined ? rating : testimonial.rating;
      testimonial.active = active !== undefined ? active : testimonial.active;
      
      if (req.file) {
        testimonial.image = req.file.filename;
      }
      
      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonial/:id
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (testimonial) {
      await Testimonial.findByIdAndDelete(req.params.id);
      res.json({ message: "Testimonial removed" });
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
