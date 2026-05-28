const Newsletter = require('../models/Newsletter');

exports.createNewsletter = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Handle empty date strings from frontend which break Mongoose Cast to Date
    if (payload.events && Array.isArray(payload.events)) {
      payload.events = payload.events.map(e => ({
        ...e,
        date: e.date === '' ? undefined : e.date
      }));
    }
    
    const savedNewsletter = await Newsletter.create(payload);
    res.status(201).json(savedNewsletter);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ message: 'Error creating newsletter', error: error.message });
  }
};

exports.getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching newsletters', error: error.message });
  }
};

exports.getNewsletterById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.status(200).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching newsletter', error: error.message });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    await Newsletter.update(req.body, { where: { id: req.params.id } });
    const newsletter = await Newsletter.findByPk(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.status(200).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Error updating newsletter', error: error.message });
  }
};

exports.deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);
    if (newsletter) {
      await newsletter.destroy();
    }
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.status(200).json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting newsletter', error: error.message });
  }
};
