const connection = require("../config/connection");
const knex = require("knex")(connection);
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const { validateAppointment } = require("../validation/isValid");

exports.newAppointment = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  let data = {
    id_pasien: req.body.id_pasien,
    keperluan: req.body.keperluan,
    tanggal: req.body.tanggal,
    jam: req.body.jam,
    keluhan: req.body.keluhan,
    is_checked: false,
  };

  const { valid, errors } = validateAppointment(data);
  if (!valid) return res.status(400).json(errors);

  const newDate = data.tanggal.split("/").reverse().join("-");
  data.tanggal = newDate;

  try {
    const checkPasien = await knex("pasien").where({
      id_pasien: data.id_pasien,
    });
    if (checkPasien.length === 0)
      return res.status(404).json({ message: "Pasien is not found" });
    const checkTanggalDanJam = await knex("appointment").where({
      tanggal: data.tanggal,
      jam: data.jam,
    });
    if (checkTanggalDanJam.length > 0)
      return res.status(400).json({ message: "Appointment sudah ada" });

    if (!req.file) {
      await knex("appointment").insert(data);
      return res.status(200).json({ message: "Appointment berhasil dibuat" });
    }

    const result = await knex("appointment").insert(data);
    const today = moment(Date.now()).format("YYYY-MM-DD");

    const photoForData = {
      id_pasien: data.id_pasien,
      id_appointment: result[0],
      photo: req.file.filename,
      is_checked: false,
      added_on: today,
    };

    await knex("photo_data").insert(photoForData);

    return res.status(200).json({ message: "Appointment berhasil dibuat" });
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.deleteAppointment = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id = req.query.id;
  try {
    const find = await knex("appointment").where({
      id_appointment: id,
      is_checked: false,
    });
    if (find.length === 0)
      return res.status(404).json({ message: "Appointment is Not found" });

    let photo;
    const photo_data = await knex("photo_data").where("id_appointment", id);
    if (photo_data.length === 0) {
      photo = null;
    } else {
      photo = photo_data[0].photo;
      await knex("photo_data").where("id_appointment", id).del();
    }

    await knex("appointment").where("id_appointment", id).del();

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

exports.appointment = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  const today = moment(Date.now()).format("YYYY-MM-DD");

  try {
    const appointment = await knex("appointment_details")
      .where({
        tanggal: today,
        is_checked: false,
      })
      .orderBy("jam", "asc");

    if (appointment.length === 0)
      return res.status(404).json({ message: "Belum ada appointment" });

    const newAppointment = [];

    appointment.forEach((ap) => {
      const newd = moment(ap.tanggal).format("YYYY-MM-DD");
      //   const todayDate = new Date().toISOString().slice(0, 10);
      //   if (ap.tanggal < todayDate) {
      //     return delete ap;
      //   }
      ap.tanggal = newd;
      newAppointment.push(ap);
    });
    return res.status(200).json(newAppointment);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.filterAppointment = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const tanggal = req.query.tanggal;

  let newTanggal = tanggal.split("/").reverse().join("-");
  const today = moment(Date.now()).format("YYYY-MM-DD");

  if (tanggal === "today" || tanggal === "Today") {
    newTanggal = today;
  }

  try {
    const appointment = await knex("appointment_details")
      .where("tanggal", newTanggal)
      .andWhere("is_checked", false)
      .orderBy("jam", "asc");

    if (appointment.length === 0)
      return res.status(404).json({ message: "Appointment tidak ditemukan" });

    const newAppointment = [];
    appointment.forEach((ap) => {
      const formatDate = moment(ap.tanggal).format("YYYY-MM-DD");
      ap.tanggal = formatDate;
      newAppointment.push(ap);
    });

    return res.status(200).json(newAppointment);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.getSingleAppointment = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_appointment = req.query.id;

  try {
    const appointment = await knex("appointment_details").where({
      id_appointment,
      is_checked: false,
    });
    if (appointment.length === 0)
      return res.status(404).json({ message: "Appointment tidak ditemukan" });

    let dataAppointment = appointment[0];
    const formatDate = moment(dataAppointment.tanggal).format("YYYY-MM-DD");
    dataAppointment.tanggal = formatDate;

    return res.status(200).json(dataAppointment);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
