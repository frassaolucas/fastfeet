import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class CourierDeliveredController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      where: {
        courier_id: req.params.id,
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
