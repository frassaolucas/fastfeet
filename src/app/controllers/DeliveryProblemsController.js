import { Op } from 'sequelize';
import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';

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
    res.json({ ok: true });
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
    res.json({ ok: true });
  }
}

export default new DeliveryProblemsController();
