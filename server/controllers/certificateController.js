import CertificateTemplate from '../models/CertificateTemplate.js';

export const saveTemplate = async (req, res) => {
  try {
    const fields = JSON.parse(req.body.fields);
    const templateImage = req.file ? req.file.filename : req.body.templateImage;
    const currentUser = req.user;

    const template = await CertificateTemplate.findOneAndUpdate(
      { createdBy: currentUser._id, institute: currentUser.institute || null },
      { 
        fields, 
        templateImage,
        createdBy: currentUser._id,
        institute: currentUser.institute || null
      },
      { upsert: true, new: true }
    );

    res.json(template);
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const currentUser = req.user;
    
    const template = await CertificateTemplate.findOne({
      createdBy: currentUser._id,
      institute: currentUser.institute || null
    });

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
