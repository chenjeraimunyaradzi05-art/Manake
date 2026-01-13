import { Router } from "express";
import {
  getMentors,
  getFeaturedMentors,
  getMentor,
  requestMentorship,
  getMyMentorships,
  getPendingRequests,
  acceptMentorship,
  declineMentorship,
  endMentorship,
  addMeeting,
  rateMeeting,
  becomeMentor,
  updateMentorSettings,
  getMentorshipStats,
} from "../../controllers/mentorshipController";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/mentors", getMentors);
router.get("/mentors/featured", getFeaturedMentors);
router.get("/mentors/:id", getMentor);

// Protected routes
router.use(authenticate);

// My mentorships
router.get("/my", getMyMentorships);
router.get("/stats", getMentorshipStats);
router.get("/requests", getPendingRequests);

// Mentorship actions
router.post("/request", requestMentorship);
router.post("/:id/accept", acceptMentorship);
router.post("/:id/decline", declineMentorship);
router.post("/:id/end", endMentorship);

// Meeting management
router.post("/:id/meetings", addMeeting);
router.post("/:id/meetings/:meetingId/rate", rateMeeting);

// Become a mentor
router.post("/become-mentor", becomeMentor);
router.put("/settings", updateMentorSettings);

export default router;
