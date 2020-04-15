import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      where: { canceled_at: null },
      attributes: [
        'id',
        'recipient_id',
        'courier_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate' });
    }

    const { recipient_id, courier_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist ' });
    }

    const courier = await Courier.findByPk(courier_id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier does not exist ' });
    }

    const { id } = await Delivery.create({
      recipient_id,
      courier_id,
      product,
    });

    return res.json({
      id,
      recipient_id,
      courier_id,
      product,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate' });
    }

    const courier = await Courier.findByPk(req.params.id);

    if (courier.removed_at) {
      return res
        .status(400)
        .json({ error: 'Removed courier cannot be updated.' });
    }

    const { email } = req.body;

    if (email && email !== courier.email) {
      const courierExists = await Courier.findOne({ where: { email } });

      if (courierExists) {
        return res
          .status(400)
          .json({ error: 'This email is already being used.' });
      }
    }

    const { id, name } = await courier.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  // async delete(req, res) {
  //   const courier = await Courier.findByPk(req.params.id);

  //   if (courier.removed_at) {
  //     return res
  //       .status(400)
  //       .json({ error: 'This courier has already been removed.' });
  //   }

  //   courier.removed_at = new Date();

  //   await courier.save();

  //   return res.send(courier);
  // }
}

export default new DeliveryController();
