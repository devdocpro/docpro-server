const connection = require("../config/connection");
const knex = require("knex")(connection);
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { validatePasien } = require("../validation/isValid");

exports.addPasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });

  const today = moment(Date.now()).format("YYYY-MM-DD");

  let data = {
    nama: req.body.nama,
    nik: req.body.nik,
    tanggal_lahir: req.body.tanggal_lahir,
    alamat: req.body.alamat,
    phone: req.body.phone,
    added_on: today,
    is_deleted: false,
  };

  const { valid, errors } = validatePasien(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const nik = await knex("pasien").where({ nik: data.nik });
    if (nik.length > 0)
      return res.status(400).json({ message: "Pasien sudah ada" });

    if (!req.file) {
      data.photo = "Default_Image.png";
      await knex("pasien").insert(data);
      return res.status(200).json({ message: "User is added" });
    }
    data.photo = req.file.filename;
    const result = await knex("pasien").insert(data);
    const id_pasien = result;

    let newPasien = await knex("pasien").where({ id_pasien });

    const formatDate = moment(newPasien[0].added_on).format("YYYY-MM-DD");
    newPasien[0].added_on = formatDate;

    const pasien = newPasien[0];

    return res.status(200).json(pasien);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.searchPasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const nama = req.query.nama;
  try {
    const user = await knex("pasien")
      .where("nama", "like", `%${nama}%`)
      .andWhere({ is_deleted: false })
      .orderBy("id_pasien", "desc");

    if (user.length === 0)
      return res.status(404).json({ message: "Pasien not found" });

    let allPasien = [];
    user.forEach((pasien) => {
      const formatDate = moment(pasien.added_on).format("YYYY-MM-DD");
      pasien.added_on = formatDate;
      allPasien.push(pasien);
    });

    return res.status(200).json(allPasien);
  } catch (err) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

exports.updatePasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_pasien = req.query.id;

  let data = {
    nama: req.body.nama,
    nik: req.body.nik,
    tanggal_lahir: req.body.tanggal_lahir,
    alamat: req.body.alamat,
    phone: req.body.phone,
  };

  const { valid, errors } = validatePasien(data);
  if (!valid) return res.status(400).json(errors);

  try {
    const findUser = await knex("pasien").where({
      id_pasien,
      is_deleted: false,
    });
    if (findUser.length === 0)
      return res.status(404).json({ message: "Pasien is not found" });

    const pasien = findUser[0];
    const oldImagePasien = pasien.photo;
    if (!req.file) {
      await knex("pasien").where({ id_pasien, is_deleted: false }).update(data);
      return res.status(200).json({ message: "Pasien is up to date" });
    }
    const newPhoto = req.file.filename;
    data.photo = newPhoto;
    await knex("pasien").where({ id_pasien, is_deleted: false }).update(data);
    const findPasien = await knex("pasien")
      .where({ id_pasien })
      .select("photo");
    const photo = findPasien[0].photo;

    if (oldImagePasien === "Default_Image.png") {
      return res.status(200).json({ message: "Pasien is up to date" });
    } else if (oldImagePasien === photo) {
      return res
        .status(200)
        .json({ message: "Pasien is up to date and photo is not changed" });
    } else if (oldImagePasien !== photo) {
      const dirPath = path.join(__dirname, "../../public/images/pasien/");

      fs.unlink(dirPath + oldImagePasien, (err) => {
        if (err && err.code == "ENOENT") {
          // file doens't exist
          console.info("File doesn't exist, won't remove it.");
        } else if (err) {
          // other errors, e.g. maybe we don't have enough permission
          console.error("Error occurred while trying to remove file");
        } else {
          return res
            .status(200)
            .json({ message: "Pasien is up to date and photo is changed" });
        }
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Something wrong" });
  }
};

exports.deletePasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_pasien = req.query.id;

  try {
    const findUser = await knex("pasien").where({
      id_pasien,
      is_deleted: false,
    });
    if (findUser.length === 0)
      return res.status(404).json({ message: "Pasien is not found" });

    await knex("pasien").where({ id_pasien }).update({
      is_deleted: true,
    });

    return res.status(200).json({ message: "Pasien is deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Something wrong" });
  }
};

exports.getAllPasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  try {
    let pasien = await knex("pasien")
      .select("*")
      .where({ is_deleted: false })
      .orderBy("id_pasien", "desc");

    let allPasien = [];
    pasien.forEach((psien) => {
      const formatDate = moment(psien.added_on).format("YYYY-MM-DD");
      psien.added_on = formatDate;

      allPasien.push(psien);
    });
    return res.status(200).json(allPasien);
  } catch (err) {
    return res.status(400).json({ message: "Something wrong" });
  }
};

exports.getDetailsPasien = async (req, res) => {
  if (!req.isAuth) return res.status(401).json({ message: "Unauthorization" });
  const id_pasien = req.query.id;

  try {
    let findPasien = await knex("pasien").where({
      id_pasien,
      is_deleted: false,
    });

    if (findPasien.length === 0)
      return res.status(404).json({ message: "Pasien is not found" });
    const formatDate = moment(findPasien[0].added_on).format("YYYY-MM-DD");
    findPasien[0].added_on = formatDate;
    const pasien = findPasien[0];

    let historys = [];
    const findHistory = await knex("history")
      .where({
        id_pasien,
        is_deleted: false,
      })
      .orderBy("tanggal", "desc");

    findHistory.forEach((history) => {
      const formatDate = moment(history.tanggal).format("YYYY-MM-DD");
      history.tanggal = formatDate;

      const appointment = {
        id_appointment: history.id_appointment,
        keperluan: history.keperluan,
        tanggal: history.tanggal,
        jam: history.jam,
        keluhan: history.keluhan,
        is_checked: history.is_checked,
      };
      const diagnosa = {
        penanganan: history.penanganan,
        doctor: history.doctor,
        total_biaya: history.total_biaya,
      };

      historys.push({ appointment, diagnosa });
    });

    let photos = [];
    const allPhotosUser = await knex("photo_data")
      .where({
        id_pasien,
        is_checked: true,
      })
      .orderBy("added_on", "desc");

    allPhotosUser.forEach((photo) => {
      const formatDate = moment(photo.added_on).format("YYYY-MM-DD");
      photo.added_on = formatDate;
      photos.push(photo);
    });

    const allUser = { pasien, historys, photos };

    return res.status(200).json(allUser);
  } catch (err) {
    return res.status(400).json({ message: "Something wrong" });
  }
};
