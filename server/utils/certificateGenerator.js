import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (templateData, userData) => {
  try {
    const canvas = createCanvas(842, 595);
    const ctx = canvas.getContext('2d');

    // Load template image
    const templatePath = path.join(__dirname, '..', 'public', 'images', templateData.templateImage);
    const image = await loadImage(templatePath);
    ctx.drawImage(image, 0, 0, 842, 595);

    // Draw fields with user data
    templateData.fields.forEach(field => {
      ctx.font = `bold ${field.fontSize}px Arial`;
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      
      let text = '';
      if (field.id === 'name') {
        text = `${userData.firstName} ${userData.lastName}`;
      } else if (field.id === 'course') {
        text = userData.courseTitle;
      } else if (field.id === 'date') {
        text = new Date(userData.completionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      ctx.fillText(text, field.x, field.y);
    });

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};
