import express from "express";
import bcrypt from "bcryptjs";
import { Message, User } from "./sequelize.js";
import { Op, Sequelize } from "sequelize";
import _ from "lodash";
import {loginSchema, queryValidation, registerSchema} from './validation.js'

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(401)
      .send({ code: "unauthorized", message: "Authentication required!" });
  }
  next();
};

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const {error, value} = loginSchema.validate(req.body, {abortEarly: false,allowUnknown: true, stripUnknown: true})
  if(error){
    return res.status(400).send({
      code: "bad_request",
      message: error.message,
    })
  }
  const { email, password } = value;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(400)
      .send({ code: "bad_request", message: "Authentication failed!" });
  }
  const plain = _.pick(user.get({ plain: true }), [
    "id",
    "email",
    "avatar",
    "name",
  ]);
  req.session.user = plain;
  return res.send(plain);
});

router.post("/register", async (req, res, next) => {
  const {value, error} = registerSchema.validate(req.body, {abortEarly: true, stripUnknown: true, allowUnknown: true})
  if(error){
    return res.status(400).send({
      code: "bad_request",
      message: error.message,
    })
  }
  const { name, email, password} = value;
  const user = await User.findOne({ where: { email } });
  if (user) {
    return res
      .status(400)
      .send({ code: "bad_request", message: "Email existed!" });
  }
  await User.create({ name, email, password });
  return res.sendStatus(201);
});

router.get("/user-info", requireAuth, (req, res, next) => {
  return res.send(req.session.user);
});

router.post("/logout", requireAuth, (req, res, next) => {
  req.session.destroy();
  return res.sendStatus(200);
});

router.get("/users", requireAuth, async (req, res, next) => {
  const q = req.query.q || ''
  const users = await User.findAll({
    attributes: ["id", "email", "avatar", "name"],
    where: { [Op.and] : [{id: { [Op.ne]: req.session.user.id }}, Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {[Op.like]: `%${q}%`})]},
  });
  return res.send(users);
});

router.get("/user/:userId(\\d+)", requireAuth, async (req, res, next) => {
  const {value, error} = queryValidation(0, 10).validate(req.query, {abortEarly: false, allowUnknown: true, stripUnknown: true})
  if(error) {
    return res.status(400).send({
      code: 'bad_request',
      message: error.message
    })
  }
  const {offset, limit, order} = value
  const { userId } = req.params;
  const user = await User.findByPk(userId, {
    attributes: ["id", "email", "avatar", "name"],
  });
  if(!user){
    return next()
  }
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { [Op.and]: [{ fromId: req.session.user.id }, { toId: userId }] },
        { [Op.and]: [{ fromId: userId }, { toId: req.session.user.id }] },
      ],
    },
    offset: offset,
    limit: limit,
    order: [['createdAt', order]]
  });
  
  res.send({ ...JSON.parse(JSON.stringify(user)), messages });
});

router.get("/messages", requireAuth, async (req, res, next) => {
  const { user } = req.session;
  const messages = await Message.findAll({
    where: {
      [Op.or]: [{ fromId: user.id }, { toId: user.id }],
    },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "email", "avatar", "name"]
      },
      {
        model: User,
        as: "receiver",
        attributes: ["id", "email", "avatar", "name"]
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  const r = {};
  const rs = [0];
  let i = 1;
  messages.forEach((message) => {
    const key =
      message.sender.id == user.id ? message.receiver.id : message.sender.id;
    if (!r[key]) {
      r[key] = i;
      i++;
      rs.push(message);
    } else if (rs[r[key]].createdAt < message.createdAt) {
      rs[r[key]] = message;
    }
  });
  return res.send(rs.slice(1));
});

router.use((req, res,next) => {
  res.status(404).send({code: 'not_found', message: 'Request not found!'})
})

export default router;
