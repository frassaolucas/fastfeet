import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import File from '../models/File';

import status from '../../utils/deliveryStatus';

import CreateDelivery from '../jobs/createDelivery';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
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
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'url', 'path'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'url', 'path'],
        },
      ],
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

    await Queue.add(CreateDelivery.key, {
      recipient,
      courier,
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
      recipient_id: Yup.number(),
      courier_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate' });
    }

    const delivery = await Delivery.findOne({
      where: { id: req.params.id, canceled_at: null },
    });

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Delivery does not exist or has been canceled' });
    }

    const { recipient_id, courier_id, product } = req.body;

    if (recipient_id && !(await Recipient.findByPk(recipient_id))) {
      return res.status(400).json({
        error: 'Recipient does not exist or has already been removed',
      });
    }

    if (courier_id && !(await Courier.findByPk(courier_id))) {
      return res.status(400).json({
        error: 'Courier does not exist or has already been removed',
      });
    }

    const deliveryUpdated = await delivery.update({
      recipient_id,
      courier_id,
      product,
    });

    return res.json(deliveryUpdated);
  }

  async delete(req, res) {
    const delivery = await Delivery.findOne({
      where: { id: req.params.id, canceled_at: null },
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'This delivery does not exist or has already been canceled.',
      });
    }

    delivery.canceled_at = new Date();
    delivery.status = status.canceled;

    await delivery.save();

    return res.send(delivery);
  }
}

export default new DeliveryController();
