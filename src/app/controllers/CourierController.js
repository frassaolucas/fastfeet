import * as Yup from 'yup';
import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const couriers = await Courier.findAll({
      where: { removed_at: null },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate' });
    }

    const courierExists = await Courier.findOne({
      where: { email: req.body.email },
    });

    if (courierExists) {
      return res.status(400).json({ error: 'Courier already exists.' });
    }

    const { id, name, email } = await Courier.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (courier.removed_at) {
      return res
        .status(400)
        .json({ error: 'Removed courier cannot be updated.' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Failed to validate' });
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

  async delete(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (courier.removed_at) {
      return res
        .status(400)
        .json({ error: 'This courier has already been removed.' });
    }

    courier.removed_at = new Date();

    await courier.save();

    return res.send(courier);
  }
}

export default new CourierController();
