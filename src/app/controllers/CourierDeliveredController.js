import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import File from '../models/File';

class CourierDeliveredController {
  async index(req, res) {
    const { id } = req.params;

    const courier = await Courier.findByPk(id);

    if (!courier) {
      res
        .status(400)
        .json({ error: 'Courier does not exist or has been removed' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        courier_id: id,
        end_date: {
          [Op.ne]: null,
        },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'url', 'path'],
        },
      ],
    });

    return res.json(deliveries);
  }
}

export default new CourierDeliveredController();
