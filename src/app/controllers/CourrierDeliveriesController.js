import Delivery from '../models/Delivery';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import File from '../models/File';

class CourierDeliveriesController {
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
