import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL)

const SALT_FACTOR = 10;

const DEFAULT_ASSETS = [
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu7_pnu1zy.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu5_upbpf0.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu6_tbftyw.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu4_mzxawl.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nam6_wgo8hm.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu3_modpo9.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu2_saz9ap.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nu1_davzam.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595598/chat/nam5_eiwnsr.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595597/chat/nam7_dl4hwk.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595597/chat/nam4_e19qlt.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595597/chat/nam3_pdu3eb.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595597/chat/nam2_iwoyeh.png",
  "https://res.cloudinary.com/ddpym9h5e/image/upload/v1709595597/chat/nam2_iwoyeh.png",
];

export const User = sequelize.define("User", {
    email: DataTypes.STRING(50),
    name: DataTypes.STRING(50),
    avatar: DataTypes.STRING,
    password: DataTypes.STRING,
}, {
    freezeTableName: true,
    underscored: true,
    hooks: {
        beforeSave: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(SALT_FACTOR);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeCreate: function(user, opts){
          if(!user.avatar){
            user.avatar = _.sample(DEFAULT_ASSETS);
          }
        }
      },
})

export const Message = sequelize.define("Message", {
    message: DataTypes.TEXT,
}, {
    freezeTableName: true,
    underscored: true,
})

User.hasMany(Message, {foreignKey: 'fromId', as: 'sent_messages'})
User.hasMany(Message, { foreignKey: 'toId', as: 'received_messages'})

Message.belongsTo(User, {foreignKey: 'fromId', as: 'sender'})
Message.belongsTo(User, {foreignKey: 'toId', as: 'receiver'})
export default sequelize;