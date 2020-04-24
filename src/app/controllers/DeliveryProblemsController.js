import { Op } from 'sequelize';
import * as Yup from 'yup';

import status from '../../utils/deliveryStatus';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import File from '../models/File';

import CancelDelivery from '../jobs/cancelDelivery';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveriesWithProblems = await DeliveryProblem.findAll({
      plain: true,
    });

    const deliveries = await Delivery.findAll({
      where: {
        id: deliveriesWithProblems.delivery_id,
      },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
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
        },
      ],
      limit: 10,
      offset: (page - 1) * 10,
    });

    res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
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
          ],
        },
      ],
      attributes: ['id', 'description'],
    });

    res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate' });
    }

    const delivery_id = req.params.id;

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
        start_date: {
          [Op.ne]: null,
        },
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery' });
    }

    const { description } = req.body;

    const { id } = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json({
      id,
      delivery_id,
      description,
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
      },
    });

    if (!delivery) {
      return res.status(400).json({
        error: 'This delivery does not exist or has already been canceled',
      });
    }

    delivery.canceled_at = new Date();
    delivery.status = status.canceled;

    await delivery.save();

    const recipient = await Recipient.findByPk(delivery.recipient_id);
    const courier = await Courier.findByPk(delivery.courier_id);
    const { product } = delivery;

    await Queue.add(CancelDelivery.key, {
      recipient,
      courier,
      product,
    });

    return res.send(delivery);
  }
}

export default new DeliveryProblemsController();
