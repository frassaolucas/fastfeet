import Notification from '../schemas/Notification';
import Courier from '../models/Courier';

class NotificationController {
  async index(req, res) {
    const { id } = req.params;

    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res
        .status(400)
        .json({ error: 'Courier does not exist or has been deleted' });
    }

    const notifications = await Notification.find({
      user: id,
    })
      .sort({ createAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const { id, notification_id } = req.params;

    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res
        .status(400)
        .json({ error: 'Courier does not exist or has been deleted' });
    }

    const notification = await Notification.findByIdAndUpdate(
      notification_id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
