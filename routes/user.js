import express from 'express'
import {
  authUser,
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  registerUser,
  updateUserProfile,
  updateUser,
  createResetToken,
  checkResetToken,
  resetPassword,
} from '../controllers/userController.js'
import { admin, protect } from '../middleware/authMiddleware.js'
const router = express.Router()

router.post('/forgotpassword', createResetToken)
router.post('/forgotpassword/check', checkResetToken)
router.put('/resetpassword', resetPassword)

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.route('/login').post(authUser)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)

export default router
