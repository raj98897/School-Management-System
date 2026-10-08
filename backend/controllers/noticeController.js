import { memoryStore } from '../config/db.js';

// @route   GET /api/notices
export const getNotices = async (req, res) => {
  try {
    const sorted = [...memoryStore.notices].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    return res.json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notices'
    });
  }
};

// @route   GET /api/notices/:id
export const getNoticeById = async (req, res) => {
  try {
    const notice = memoryStore.notices.find(n => n._id === req.params.id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    return res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notice'
    });
  }
};

// @route   POST /api/notices
export const createNotice = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const newNotice = {
      _id: 'n_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdBy: req.user ? req.user.id || req.user._id : 'admin',
      createdByName: req.user ? req.user.name : 'Admin Office',
      createdAt: new Date().toISOString()
    };

    memoryStore.notices.push(newNotice);

    return res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: newNotice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating notice'
    });
  }
};

// @route   PUT /api/notices/:id
export const updateNotice = async (req, res) => {
  try {
    const notice = memoryStore.notices.find(n => n._id === req.params.id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    if (req.body.title) notice.title = req.body.title.trim();
    if (req.body.description) notice.description = req.body.description.trim();
    if (req.body.date) notice.date = req.body.date;

    return res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating notice'
    });
  }
};

// @route   DELETE /api/notices/:id
export const deleteNotice = async (req, res) => {
  try {
    const index = memoryStore.notices.findIndex(n => n._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    memoryStore.notices.splice(index, 1);

    return res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting notice'
    });
  }
};
