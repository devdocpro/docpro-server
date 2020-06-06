const connection = require("../config/connection");
const knex = require("knex")(connection);
const fs = require("fs");
const path = require("path");
const moment = require("moment");

exports.addNewPhotoData = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const today = moment(Date.now()).format("YYYY-MM-DD");

  let data = {
    id_pasien: req.body.id_pasien,
    id_appointment: 0,
    is_checked: true,
    added_on: today,
  };

  try {
    const searchPasien = await knex("pasien").where({
      id_pasien: data.id_pasien,
      is_deleted: false,
    });
    if (searchPasien.length === 0)
      return res.status(404).json({ message: "Pasien not found" });

    if (!req.file)
      return res.status(404).json({ message: "Photo is not found" });

    data.photo = req.file.filename;

    await knex("photo_data").insert(data);
    return res.status(200).json({ message: "Photo is added" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deletePhotoData = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id = req.query.id;
  try {
    let photo = null;
    const find = await knex("photo_data").where({
      id_photo: id,
      is_checked: true,
    });
    if (find.length === 0)
      return res.status(404).json({ message: "Photo is not found" });

    photo = find[0].photo;
    await knex("photo_data").where({ id_photo: id, is_checked: true }).del();

    if (photo === null) {
      return res.status(200).json({ message: "Appointment is deleted" });
    } else {
      const dirPath = path.join(__dirname, "../../public/images/data/");

      fs.unlink(dirPath + photo, (err) => {
        if (err && err.code == "ENOENT") {
          // file doens't exist
          console.info("File doesn't exist, won't remove it.");
        } else if (err) {
          // other errors, e.g. maybe we don't have enough permission
          console.error("Error occurred while trying to remove file");
        } else {
          console.log("Photo is removed from folder images/data");
          return res.status(200).json({ message: "Appointment is deleted" });
        }
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
