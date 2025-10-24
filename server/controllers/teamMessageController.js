import TeamMessage from '../models/TeamMessage.js';

export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await TeamMessage.find({ team: teamId })
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTeamMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { text } = req.body;
    const currentUser = req.user;

    const message = new TeamMessage({
      team: teamId,
      sender: currentUser._id,
      text,
    });

    await message.save();
    await message.populate('sender', 'firstName lastName email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
