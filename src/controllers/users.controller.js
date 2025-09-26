import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ....');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const paramValidation = userIdSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;
    logger.info(`Getting user with ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error(`Error fetching user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const paramValidation = userIdSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: formatValidationError(paramValidation.error),
      });
    }

    // Validate the update data
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Check authorization - users can only update their own data unless they're admin
    const targetUserId = id;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && currentUserId !== targetUserId) {
      logger.warn(
        `User ${req.user.email} attempted to update user ${targetUserId} without permission`
      );
      return res.status(403).json({
        error:
          'You can only update your own information unless you are an admin.',
      });
    }

    // Only admin users can change roles
    if (updates.role && userRole !== 'admin') {
      logger.warn(
        `User ${req.user.email} attempted to change role without admin privileges`
      );
      return res.status(403).json({
        error: 'Only admin users can change user roles.',
      });
    }

    logger.info(`Updating user with ID: ${id}`);

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'Successfully updated user',
      user: updatedUser,
    });
  } catch (e) {
    logger.error(`Error updating user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const paramValidation = userIdSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // Check authorization - users can only delete their own account unless they're admin
    const targetUserId = id;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && currentUserId !== targetUserId) {
      logger.warn(
        `User ${req.user.email} attempted to delete user ${targetUserId} without permission`
      );
      return res.status(403).json({
        error: 'You can only delete your own account unless you are an admin.',
      });
    }

    // Prevent users from deleting their own admin account (safety check)
    if (currentUserId === targetUserId && userRole === 'admin') {
      logger.warn(
        `Admin user ${req.user.email} attempted to delete their own account`
      );
      return res.status(400).json({
        error: 'Admin users cannot delete their own account.',
      });
    }

    logger.info(`Deleting user with ID: ${id}`);

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'Successfully deleted user',
      user: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (e) {
    logger.error(`Error deleting user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};
