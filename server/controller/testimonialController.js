import Testimonial from "../models/testimonialModel.js";

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

// @desc    Create a testimonial
// @route   POST /api/testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { name, reviewText, rating, active } = req.body;
    const testimonial = await Testimonial.create({ name, reviewText, rating, active });
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
      testimonial.name = name || testimonial.name;
      testimonial.reviewText = reviewText || testimonial.reviewText;
      testimonial.rating = rating !== undefined ? rating : testimonial.rating;
      testimonial.active = active !== undefined ? active : testimonial.active;
      
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
