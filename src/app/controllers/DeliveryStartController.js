import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import status from '../../utils/deliveryStatus';

import Delivery from '../models/Delivery';
import Courier from '../models/Courier';

class DeliveryStartController {
  async update(req, res) {
    const { id, delivery_id } = req.params;

    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found or removed' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
        courier_id: id,
        canceled_at: null,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found or deleted' });
    }

    if (delivery.start_date) {
      return res.status(400).json({ error: 'Delivery has already started' });
    }

    const date = new Date();

    const deliveries = await Delivery.findAll({
      where: {
        courier_id: id,
        canceled_at: null,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    if (deliveries.length > 5) {
      return res.status(400).json({ error: 'Only 5 daily deliveries allowed' });
    }

    const deliveryUpate = await delivery.update({
      start_date: new Date(),
      status: status.open,
    });

    return res.json(deliveryUpate);
  }
}

export default new DeliveryStartController();
