import { startOfDay, endOfDay, setHours, isAfter, isBefore } from 'date-fns';

import Delivery from '../models/Delivery';
import Courier from '../models/Courier';
import File from '../models/File';

class DeliveryEndController {
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

    if (!delivery.start_date) {
      return res.status(400).json({ error: 'Delivery has not started yet' });
    }

    if (delivery.end_date) {
      return res
        .status(400)
        .json({ error: 'Delivery has already been delivered' });
    }

    const date = new Date();

    const start_hour = setHours(startOfDay(date), 8);
    const end_hour = setHours(endOfDay(date), 18);

    if (!(isBefore(start_hour, date) && isAfter(end_hour, date))) {
      return res.status(400).json({
        error: 'Action not allowed outside work hours - from 8am to 6pm',
      });
    }

    const { signature_id } = req.body;

    const signatureImage = await File.findByPk(signature_id);

    if (!signatureImage) {
      return res.status(400).json({ error: 'Signature image does not exist' });
    }

    const deliveryUpate = await delivery.update({
      end_date: date,
      signature_id,
    });

    return res.json(deliveryUpate);
  }
}

export default new DeliveryEndController();
