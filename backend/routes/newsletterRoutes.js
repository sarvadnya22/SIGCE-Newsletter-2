const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const authMiddleware = require('../middleware/authMiddleware');
const demoMiddleware = require('../middleware/demoMiddleware');

router.route('/')
  .post(authMiddleware, demoMiddleware, newsletterController.createNewsletter)
  .get(newsletterController.getNewsletters);

router.route('/:id')
  .get(newsletterController.getNewsletterById)
  .put(authMiddleware, demoMiddleware, newsletterController.updateNewsletter)
  .delete(authMiddleware, demoMiddleware, newsletterController.deleteNewsletter);

router.post('/:id/view', newsletterController.trackView);
router.post('/:id/email', authMiddleware, demoMiddleware, newsletterController.emailNewsletter);

module.exports = router;
