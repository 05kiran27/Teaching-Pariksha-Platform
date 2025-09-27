// const User = require('../models/User');
// const Notification = require('../models/Notification');

// // Controller to fetch paginated notifications for a user
// exports.getNotifications = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { page = 1, limit = 10 } = req.query; // Default values: page 1, limit 10

//         // Find the user and paginate notifications
//         const user = await User.findById(userId)
//             .populate({
//                 path: 'notification',
//                 options: {
//                     sort: { createdAt: -1 }, // Sort by creation date (newest first)
//                     skip: (page - 1) * limit, // Pagination: skip the records
//                     limit: parseInt(limit) // Limit number of notifications returned
//                 }
//             });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // Get the total number of notifications for the user
//         const totalNotifications = await Notification.countDocuments({ recipient: userId });

//         return res.status(200).json({
//             success: true,
//             notifications: user.notification,
//             currentPage: parseInt(page),
//             totalPages: Math.ceil(totalNotifications / limit),
//             totalNotifications
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Error fetching notifications",
//         });
//     }
// };

const User = require('../models/User');
const Notification = require('../models/Notification');

// Controller to fetch paginated notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query; // Default values: page 1, limit 10

        // Find the user and paginate notifications, including sender's profile pic
        const user = await User.findById(userId)
            .populate({
                path: 'notification',
                options: {
                    sort: { createdAt: -1 }, // Sort by creation date (newest first)
                    skip: (page - 1) * limit, // Pagination: skip the records
                    limit: parseInt(limit) // Limit number of notifications returned
                },
                populate: { // Populate the sender's profile picture from the User model
                    path: 'sender',
                    select: 'images', // Select fields: profilePic and name of the sender
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Get the total number of notifications for the user
        const totalNotifications = await Notification.countDocuments({ recipient: userId });

        return res.status(200).json({
            success: true,
            notifications: user.notification.map(notification => ({
                _id: notification._id,
                message: notification.message,
                type: notification.type,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
                sender: {
                    _id: notification.sender._id,
                    name: notification.sender.name,
                    images: notification.sender.images, // Return profilePic of sender
                }
            })),
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalNotifications / limit),
            totalNotifications
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching notifications",
        });
    }
};



// Controller to mark unread notifications as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.id; 

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Filter unread notifications
        const unreadNotificationIds = user.notification
            .filter(notification => !notification.isRead)
            .map(notification => notification._id);

        // Check if there are any unread notifications
        if (unreadNotificationIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No unread notifications",
            });
        }

        // Mark all unread notifications as read
        await Notification.updateMany(
            { _id: { $in: unreadNotificationIds } },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            success: true,
            message: "All unread notifications marked as read",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error marking notifications as read",
        });
    }
};



// Controller to get the count of unread notifications for a user
exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count the number of unread notifications for the user
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        return res.status(200).json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching unread notification count",
        });
    }
};


