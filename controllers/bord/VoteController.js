import Vote from '../../models/Vote.js';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
// import BusinessIdea from '../../models/BusinessIdea.js'; // if board info is in here
import BusinessIdea from '../../models/BussinessIdea.js';

export const submitOrCancelVote = async (req, res) => {
  const { ideaId, voterId, type } = req.body;
  console.log(`ideaID: ${ideaId}, voterID: ${voterId}, type: ${type} `);

  try {
    const existingVote = await Vote.findOne({ ideaId, voterId });

    if (existingVote) {
      if (existingVote.type === type) {
        await Vote.deleteOne({ _id: existingVote._id });
        return res.status(200).json({ message: 'Vote cancelled' });
      } else {
        existingVote.type = type;
        await existingVote.save();
        // await checkAndNotifyMajority(ideaId, type); // 🔔 check after vote change
        try {
          await checkAndNotifyMajority(ideaId, type);
        } catch (notifyErr) {
          console.error(
            '🔴 Error in checkAndNotifyMajority (on update):',
            notifyErr
          );
        }
        return res.status(200).json({ message: `Vote changed to ${type}` });
      }
    } else {
      const vote = new Vote({ ideaId, voterId, type });
      await vote.save();
      // await checkAndNotifyMajority(ideaId, type); // 🔔 check after new vote
      try {
        await checkAndNotifyMajority(ideaId, type);
      } catch (notifyErr) {
        console.error(
          '🔴 Error in checkAndNotifyMajority (on update):',
          notifyErr
        );
      }
      return res.status(200).json({ message: 'Vote submitted' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ ideaId: req.params.ideaId });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};

// 🔔 helper function to check and notify admin if majority reached
const checkAndNotifyMajority = async (ideaId, type) => {
  console.log('🔎 Checking majority for:', type);

  const votes = await Vote.find({ ideaId, type });
  const voteCount = votes.length;

  // 🔍 Find number of board members — assuming from BusinessIdea model
  // const idea = await BusinessIdea.findById(ideaId).populate('boardMembers');
  const idea = await BusinessIdea.findById(ideaId);
  const boardMembers = idea?.boardMembers || [];
  const majority = Math.ceil(boardMembers.length / 2);

  if (voteCount >= majority) {
    const alreadyNotified = await Notification.findOne({
      ideaId,
      message: new RegExp(type), // avoid duplicates
    });

    if (!alreadyNotified) {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const messageMap = {
          releaseFunds: '✅ Majority vote: Release funds.',
          extendTime: '⏳ Majority vote: Extend timeline.',
          refundInvestors: '💸 Majority vote: Refund investors.',
        };

        await Notification.create({
          userId: admin._id,
          ideaId,
          message: messageMap[type] || `Majority vote for ${type}`,
        });
        console.log('🔔 Notification sent to admin');
      }
    }
  }
};
