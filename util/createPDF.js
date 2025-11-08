// import PDFDocument from "pdfkit";

// export const createPDF = (res) => {
//   const doc = new PDFDocument();
//   doc.pipe(res);

//   // 📝 Mock data - Replace this with real DB data later
//   const reportData = {
//     title: "Board Report",
//     projectInvestment: "$1,000,000",
//     requiredVotes: "3/5",
//     members: [
//       { name: "John Smith", role: "Chairman", shares: "30%" },
//       { name: "Sarah Johnson", role: "Lead Investor", shares: "20%" },
//       { name: "Michael Chen", role: "Board Member", shares: "15%" },
//     ],
//     discussions: [
//       {
//         author: "Temesgen",
//         time: "10:00 AM",
//         message: "Welcome to the board meeting.",
//       },
//       {
//         author: "Sarah Johnson",
//         time: "10:02 AM",
//         message: "Let's discuss the fund release proposal.",
//       },
//     ],
//   };

//   // 📌 Generate PDF Content
//   doc.fontSize(18).text(reportData.title, { align: "center" });
//   doc.moveDown();

//   doc.fontSize(12).text(`Total Investment: ${reportData.projectInvestment}`);
//   doc.text(`Required Votes for Approval: ${reportData.requiredVotes}`);
//   doc.moveDown();

//   doc.fontSize(14).text("Board Members:");
//   reportData.members.forEach((member) => {
//     doc
//       .fontSize(12)
//       .text(`- ${member.name} (${member.role}) - Shares: ${member.shares}`);
//   });
//   doc.moveDown();

//   doc.fontSize(14).text("Discussion Summary:");
//   reportData.discussions.forEach((discussion) => {
//     doc
//       .fontSize(12)
//       .text(`${discussion.author} (${discussion.time}): ${discussion.message}`);
//   });

//   doc.end();
// };

import PDFDocument from 'pdfkit';
import BusinessIdea from '../models/BussinessIdea.js'; // Adjust path if needed

export const createPDF = async (req, res) => {
  const { ideaId, boardMembers, votes } = req.body;
  // console.log(
  //   `ideID: ${ideaId}, bordMember: ${boardMembers}, votes: ${votes}}`
  // );

  const businessIdea = await BusinessIdea.findById(ideaId);
  // console.log('bisnesIdea data fundigneed', businessIdea);

  console.log('bisnesIdea data fundigneed', businessIdea.fundingNeeded);
  console.log('bisnesIdea data name entrepr:', businessIdea.entrepreneurName);
  console.log('bisnesIdea data title', businessIdea.title);

  const requiredVotes = Math.ceil(boardMembers.length / 2);
  const finalDecision = Object.entries(votes).find(
    ([_, count]) => count >= requiredVotes
  );
  const decisionText = finalDecision
    ? `✅ Decision Passed: ${formatVoteLabel(finalDecision[0])}`
    : '❌ No Majority Decision Reached';

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=board_report.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(`Board Report `);
  doc.moveDown();
  doc.fontSize(18).text(`Idea Name: ${businessIdea.title}`);
  doc.moveDown();
  doc.fontSize(12).text(` Investment required ${businessIdea.fundingNeeded} `);
  doc.fontSize(12).text(`Total Investment later fethced: $1,0000,000`);
  doc.text(
    `Required Votes for Majority: ${requiredVotes}/${boardMembers.length}`
  );
  doc.moveDown();

  doc.fontSize(14).text('Board Members:');
  boardMembers.forEach((member) => {
    doc
      .fontSize(12)
      .text(`- ${member.name} (${member.role}) - Shares: ${member.shares}`);
  });
  doc.moveDown();

  doc.fontSize(14).text('Vote Summary:');
  Object.entries(votes).forEach(([key, count]) => {
    doc.fontSize(12).text(`- ${formatVoteLabel(key)}: ${count} vote(s)`);
  });
  doc.moveDown();

  doc.fontSize(14).text(decisionText);
  doc.end();
};

// Optional helper function
const formatVoteLabel = (key) => {
  switch (key) {
    case 'releaseFunds':
      return 'Release Funds';
    case 'extendTime':
      return 'Extend Timeline';
    case 'refundInvestors':
      return 'Refund Investors';
    default:
      return key;
  }
};
