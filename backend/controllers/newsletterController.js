const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');


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

exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    await Newsletter.increment('views', { where: { id } });
    res.status(200).json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: 'Error tracking view', error: error.message });
  }
};

exports.emailNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipients, subject, message } = req.body;

    if (!recipients) {
      return res.status(400).json({ message: 'Recipients list is required' });
    }

    const newsletter = await Newsletter.findByPk(id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const previewUrl = `${frontendUrl}/public-preview/${id}`;

    // Build mail options
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SIGCE Newsletters" <noreply@sigce.edu>',
      to: recipients, // comma separated list
      subject: subject || `SIGCE Newsletter: ${newsletter.title}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            ${newsletter.headerImage ? `<img src="${newsletter.headerImage}" alt="SIGCE Header" style="max-width: 100%; height: auto; border-radius: 8px;" />` : `<h2 style="color: #1e3a8a; margin: 0; font-family: Georgia, serif;">SIGCE Newsletter Portal</h2>`}
          </div>
          <h2 style="color: #1e3a8a; font-family: Georgia, serif; margin-bottom: 8px; font-size: 22px;">${newsletter.title}</h2>
          <p style="color: #4b5563; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; font-size: 13px; letter-spacing: 0.05em;">${newsletter.department} - ${newsletter.semester}</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
            <p style="color: #334155; line-height: 1.6; margin: 0; font-style: italic; font-size: 14px;">"${message || 'Please find the latest SIGCE department newsletter details and online preview below.'}"</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${previewUrl}" target="_blank" style="background-color: #1d4ed8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3);">Read Newsletter Online</a>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 10px; font-size: 13px; color: #1e40af; line-height: 1.5; margin-bottom: 25px;">
            <strong>Quick Stats from this Issue:</strong>
            <ul style="margin: 5px 0 0 15px; padding: 0;">
              <li>Events Recorded: ${newsletter.events?.length || 0}</li>
              <li>Toppers Featured: ${newsletter.toppers?.length || 0}</li>
            </ul>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; text-align: center; font-size: 11px; margin: 0; letter-spacing: 0.02em;">
            This email was sent from the SIGCE Newsletter Platform. 
            To view all past newsletters, visit the <a href="${frontendUrl}/archive" style="color: #3b82f6; text-decoration: underline;">SIGCE Public Archive</a>.
          </p>
        </div>
      `
    };

    // Configure SMTP transporter if credentials exist
    let info;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      info = await transporter.sendMail(mailOptions);
      console.log('[Email] Sent successfully via SMTP:', info.messageId);
    } else {
      // Simulation mode
      console.log('============================================================');
      console.log('[SIMULATED EMAIL SEND] SMTP credentials not configured in backend/.env');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Preview URL:', previewUrl);
      console.log('Message:', message);
      console.log('============================================================');
      info = { messageId: 'simulated-id-' + Date.now() };
    }

    res.status(200).json({ message: 'Email shared successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sharing newsletter by email', error: error.message });
  }
};

