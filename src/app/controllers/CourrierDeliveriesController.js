import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class CourierDeliveriesController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      where: {
        courier_id: req.params.id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'start_date'],
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

export default new CourierDeliveriesController();
