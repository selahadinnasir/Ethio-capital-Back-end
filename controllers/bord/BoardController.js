// backend/controllers/bord/BoardController.js

import BusinessIdea from '../../models/BussinessIdea.js'; // Adjust path if needed
import User from '../../models/User.js'; // Adjust path if needed
import mongoose from 'mongoose';

export const getBoardMembersForIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    // console.log("ideaId",ideaId);

    if (!ideaId) {
      return res.status(400).json({ message: 'No id found ' });
    }

    // 1. Fetch the Business Idea and populate the 'user' field (CORRECTED)
    const businessIdea = await BusinessIdea.findById(ideaId).populate({
      path: 'user', // <--- CORRECTED: Use 'user' instead of 'owner'
      model: 'User',
      select: 'name email profileImage contact',
    });

    if (!businessIdea) {
      return res.status(404).json({ message: 'Business Idea not found' });
    }

    // 2. Identify the Entrepreneur (using the populated 'user' field) (CORRECTED)
    if (!businessIdea.user) {
      // <--- CORRECTED: Check businessIdea.user
      // Using 'user' as the term for the idea creator based on schema
      return res
        .status(404)
        .json({ message: 'User (creator) not found for this idea' });
    }
    // Format the entrepreneur object
    const entrepreneur = {
      id: businessIdea.user._id, // <--- CORRECTED: Access user._id
      name: businessIdea.entrepreneurName, // <--- CORRECTED: Access user.name
      // Assuming the 'user' who created the idea is the entrepreneur/chairman
      role: 'Chairman (Entrepreneur)',
      shares: 'N/A',
      status: 'online',
      image: businessIdea.user.profileImage || '👨‍💼', // <--- CORRECTED: Access user.profileImage
      bio: 'Idea Owner/Creator',
      contact: businessIdea.user.contact || 'Not specified', // <--- CORRECTED: Access user.contact
    };

    // 3. Get Investors and Shares (Mock Data Phase)
    // TODO: Replace this with actual data fetching
    const mockInvestments = [
      { userId: 'mockUserId1', name: 'Sarah Johnson', sharePercentage: 9 },
      { userId: 'mockUserId2', name: 'Michael Chen', sharePercentage: 15 },
      // Example: Only 2 investors for testing the '<= 3' case
      { userId: 'mockUserId3', name: 'Emma Williams', sharePercentage: 12 },
      { userId: 'mockUserId4', name: 'David Brown', sharePercentage: 10 },
      { userId: 'mockUserId5', name: 'John Terry', sharePercentage: 20 },
      {
        userId: '67b0d5d0ba480c63fab77204',
        name: 'Addis Alem',
        sharePercentage: 34,
      },
    ];

    let investors = mockInvestments.map((inv) => ({
      id: inv.userId,
      name: inv.name,
      role: 'Investor',
      shares: `${inv.sharePercentage}%`,
      status: Math.random() > 0.5 ? 'online' : 'offline',
      image: Math.random() > 0.5 ? '👩‍💼' : '👨‍💼',
      bio: 'Investor in this project',
      contact: `+251 9${Math.floor(10000000 + Math.random() * 90000000)}`,
      sharePercentage: inv.sharePercentage,
    }));

    // 4. Select Board Investors based on Rules
    let selectedInvestors = [];
    if (investors.length <= 4) {
      selectedInvestors = investors;
    } else {
      investors.sort((a, b) => b.sharePercentage - a.sharePercentage);
      selectedInvestors = investors.slice(0, 4);
    }
    selectedInvestors = selectedInvestors.map(
      ({ sharePercentage, ...rest }) => rest
    );

    // 5. Construct the Final Board List
    const boardMembers = [entrepreneur, ...selectedInvestors];

    // Optional: Check minimum members if needed
    // if (boardMembers.length < 4) { ... }

    // 6. Return the Response
    res.status(200).json(boardMembers);
  } catch (error) {
    // Log the specific error for better debugging
    console.error('Error fetching board members:', error.message);
    // Send a more informative error message if possible, but avoid leaking details
    res.status(500).json({
      message: 'Server error fetching board members',
      // Include error type if helpful and safe (like error.name)
      errorType: error.constructor.name,
    });
  }
};
