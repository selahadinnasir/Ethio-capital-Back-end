import BusinessIdea from '../models/BussinessIdea.js';

export const setMeetingTime = async (req, res) => {
  const { id } = req.params;
  const { time, userId } = req.body;

  try {
    const idea = await BusinessIdea.findById(id);
    if (!idea) return res.status(404).json({ error: 'Idea not found' });

    idea.nextMeeting = {
      time,
      setBy: userId,
    };

    await idea.save();
    res.status(200).json({
      message: 'Meeting time set successfully',
      nextMeeting: idea.nextMeeting,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMeetingTime = async (req, res) => {
  const { id } = req.params;

  try {
    const idea = await BusinessIdea.findById(id).populate(
      'nextMeeting.setBy',
      'name'
    );
    if (!idea || !idea.nextMeeting)
      return res.status(404).json({ message: 'No scheduled meeting' });

    res.status(200).json({
      time: idea.nextMeeting.time,
      setBy: idea.nextMeeting.setBy.name,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
