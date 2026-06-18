const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/')
  .post(authMiddleware, newsletterController.createNewsletter)
  .get(newsletterController.getNewsletters);

router.route('/:id')
  .get(newsletterController.getNewsletterById)
  .put(authMiddleware, newsletterController.updateNewsletter)
  .delete(authMiddleware, newsletterController.deleteNewsletter);

router.post('/:id/view', newsletterController.trackView);
router.post('/:id/email', authMiddleware, newsletterController.emailNewsletter);

module.exports = router;
